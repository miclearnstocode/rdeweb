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
                backgroundColor: type === 'error' ? '#e91e63' : '#4caf50',
                color: '#fff',
                fontSize: '14px',
                zIndex: '5000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontFamily: 'Segoe UI, sans-serif',
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
        if (!dateString || dateString === '—') return '—'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (e) {
            return dateString
        }
    }

    // Format date for datetime-local input
    const formatDateForInput = (dateString) => {
        if (!dateString || dateString === '—' || dateString === '0000-00-00 00:00:00') return ''
        try {
            // Handle the database format: "YYYY-MM-DD HH:MM:SS"
            const date = new Date(dateString.replace(' ', 'T'))
            if (isNaN(date.getTime())) return ''

            // Format to YYYY-MM-DDTHH:MM
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
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                border: '1px solid #444'
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
                                color: '#fff',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0 0 8px 0',
                                letterSpacing: '-0.5px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: 'Create a new event for research presentations and symposiums',
                            style: {
                                color: '#888',
                                fontFamily: 'Segoe UI, sans-serif',
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
                                marginBottom: '8px',
                                color: '#aaa',
                                fontSize: '13px',
                                fontWeight: '500',
                                fontFamily: 'Segoe UI, sans-serif'
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
                                padding: '12px 16px',
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: 'Segoe UI, sans-serif',
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
                                    el.style.borderColor = 'deepskyblue'
                                    el.style.boxShadow = '0 0 0 3px rgba(0, 191, 255, 0.1)'
                                })
                                el.addEventListener('blur', () => {
                                    el.style.borderColor = '#444'
                                    el.style.boxShadow = 'none'
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
                        padding: '12px 24px',
                        backgroundColor: 'deepskyblue',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'Segoe UI, sans-serif',
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
                            el.style.backgroundColor = '#00bfff'
                            el.style.transform = 'translateY(-2px)'
                            el.style.boxShadow = '0 4px 12px rgba(0, 191, 255, 0.3)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'deepskyblue'
                            el.style.transform = 'translateY(0)'
                            el.style.boxShadow = 'none'
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
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                width: '500px',
                maxWidth: '95%',
                padding: '32px',
                border: '1px solid #444',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                fontFamily: 'Segoe UI, sans-serif',
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
                        color: '#888',
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
                            el.style.color = '#fff'
                            el.style.backgroundColor = '#444'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.color = '#888'
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
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0 0 8px 0',
                                letterSpacing: '-0.5px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: eventName || 'Event',
                            style: {
                                color: 'deepskyblue',
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
                                marginBottom: '8px',
                                color: '#aaa',
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
                                        color: 'deepskyblue',
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
                                        padding: '12px 16px 12px 48px',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'Segoe UI, sans-serif',
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
                                        // FIXED: Use proper date formatting for datetime-local input
                                        const formattedDate = formatDateForInput(currentDeadline)
                                        if (formattedDate) {
                                            el.value = formattedDate
                                            timeIn = formattedDate
                                        }
                                        el.addEventListener('focus', () => {
                                            el.style.borderColor = 'deepskyblue'
                                            el.style.boxShadow = '0 0 0 3px rgba(0, 191, 255, 0.1)'
                                        })
                                        el.addEventListener('blur', () => {
                                            el.style.borderColor = '#444'
                                            el.style.boxShadow = 'none'
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
                        padding: '12px 24px',
                        backgroundColor: 'deepskyblue',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'Segoe UI, sans-serif',
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
                            el.style.backgroundColor = '#00bfff'
                            el.style.transform = 'translateY(-2px)'
                            el.style.boxShadow = '0 4px 12px rgba(0, 191, 255, 0.3)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'deepskyblue'
                            el.style.transform = 'translateY(0)'
                            el.style.boxShadow = 'none'
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
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                width: '500px',
                maxWidth: '95%',
                padding: '32px',
                border: '1px solid #444',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                fontFamily: 'Segoe UI, sans-serif',
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
                        color: '#888',
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
                            el.style.color = '#fff'
                            el.style.backgroundColor = '#444'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.color = '#888'
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
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0 0 8px 0',
                                letterSpacing: '-0.5px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: eventName || 'Event',
                            style: {
                                color: '#ff9800',
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
                                marginBottom: '8px',
                                color: '#aaa',
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
                                        color: '#ff9800',
                                        fontSize: '18px',
                                        zIndex: '1'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-presentation-screen' }
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
                                        padding: '12px 16px 12px 48px',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'Segoe UI, sans-serif',
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
                                        // FIXED: Use proper date formatting for datetime-local input
                                        const formattedDate = formatDateForInput(currentPresentation)
                                        if (formattedDate) {
                                            el.value = formattedDate
                                            presentationDate = formattedDate
                                        }
                                        el.addEventListener('focus', () => {
                                            el.style.borderColor = '#ff9800'
                                            el.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)'
                                        })
                                        el.addEventListener('blur', () => {
                                            el.style.borderColor = '#444'
                                            el.style.boxShadow = 'none'
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
                        padding: '12px 24px',
                        backgroundColor: '#ff9800',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'Segoe UI, sans-serif',
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
                            el.style.backgroundColor = '#ffb347'
                            el.style.transform = 'translateY(-2px)'
                            el.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#ff9800'
                            el.style.transform = 'translateY(0)'
                            el.style.boxShadow = 'none'
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                margin: '6px 0',
                padding: '14px 12px',
                borderRadius: '10px',
                backgroundColor: '#2d2d2d',
                border: '1px solid #444',
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
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'deepskyblue',
                        backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        border: '1px solid rgba(0, 191, 255, 0.3)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        flexShrink: '0'
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(0, 191, 255, 0.2)'
                            el.style.transform = 'scale(1.1)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(0, 191, 255, 0.1)'
                            el.style.transform = 'scale(1)'
                        })
                    }
                }),

                // Event Name
                $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '13px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        color: '#ddd',
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
                        fontFamily: 'Segoe UI, sans-serif',
                        textAlign: 'center',
                        height: 'fit-content',
                        margin: 'auto',
                        fontSize: '12px',
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
                                el.style.color = (responseData.status) ? '#4caf50' : '#e91e63'
                                el.style.backgroundColor = (responseData.status) ? 'rgba(76, 175, 80, 0.15)' : 'rgba(233, 30, 99, 0.15)'
                                el.style.border = (responseData.status) ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(233, 30, 99, 0.3)'
                            }).catch(() => {
                                el.innerText = "Unknown"
                                el.style.color = '#888'
                                el.style.backgroundColor = 'rgba(136, 136, 136, 0.15)'
                                el.style.border = '1px solid rgba(136, 136, 136, 0.3)'
                            })
                        } catch (e) {
                            el.innerText = "Error"
                            el.style.color = '#888'
                        }
                    },
                    text: (status) ? "Active" : "Closed"
                }),

                // Presentation Date - Click to update presentation date only
                $({
                    tag: 'div',
                    style: {
                        width: '160px',
                        height: 'fit-content',
                        padding: '6px 12px',
                        textAlign: "center",
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '12px',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderRadius: '8px',
                        color: '#ff9800',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: '0',
                        border: '1px solid rgba(255, 152, 0, 0.2)'
                    },
                    text: presentationDate && presentationDate !== '0000-00-00 00:00:00' ? formatDate(presentationDate) : 'Click to Set',
                    title: 'Click to update Presentation Date',
                    event: {
                        type: 'click',
                        method: openPresentationModal
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(255, 152, 0, 0.2)'
                            el.style.transform = 'scale(1.02)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(255, 152, 0, 0.1)'
                            el.style.transform = 'scale(1)'
                        })
                    }
                }),

                // Deadline Date - Click to update deadline only
                $({
                    tag: 'div',
                    style: {
                        width: '160px',
                        height: 'fit-content',
                        padding: '6px 12px',
                        textAlign: "center",
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '12px',
                        backgroundColor: 'rgba(0, 191, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'deepskyblue',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: '0',
                        border: '1px solid rgba(0, 191, 255, 0.2)'
                    },
                    text: deadline && deadline !== '0000-00-00 00:00:00' ? formatDate(deadline) : 'Click to Set',
                    title: 'Click to update Submission Deadline',
                    event: {
                        type: 'click',
                        method: openDeadlineModal
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(0, 191, 255, 0.2)'
                            el.style.transform = 'scale(1.02)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(0, 191, 255, 0.1)'
                            el.style.transform = 'scale(1)'
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
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 'auto',
                        fontSize: '14px',
                        cursor: 'pointer',
                        color: '#e91e63',
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        border: '1px solid rgba(233, 30, 99, 0.2)',
                        borderRadius: '8px',
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
                            el.style.backgroundColor = 'rgba(233, 30, 99, 0.2)'
                            el.style.transform = 'scale(1.1)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(233, 30, 99, 0.1)'
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
                        mainFrame.appendChild(AddScoreSheet({
                            id: scoreId,
                            eventID: eventID,
                            name: Evename
                        }))
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
                flexDirection: 'column'
            },
            child: [
                // Header
                $({
                    tag: 'div',
                    style: {
                        padding: '16px 20px',
                        borderBottom: '1px solid #444',
                        backgroundColor: '#2d2d2d'
                    },
                    child: [
                        $({
                            tag: 'h2',
                            text: 'Event List',
                            style: {
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '18px',
                                color: '#fff',
                                margin: '0',
                                fontWeight: '600',
                                letterSpacing: '-0.5px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: 'Manage existing events, update deadlines, and create criteria',
                            style: {
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '12px',
                                color: '#888',
                                margin: '4px 0 0 0'
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
                        padding: '10px 12px',
                        backgroundColor: '#333',
                        borderBottom: '1px solid #444',
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
                                width: '36px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Event Name',
                            style: {
                                flex: '1',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontWeight: '600',
                                fontSize: '12px',
                                color: '#aaa',
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
                                fontFamily: 'Segoe UI, sans-serif',
                                fontWeight: '600',
                                fontSize: '12px',
                                color: '#aaa',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Presentation Date',
                            style: {
                                width: '160px',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontWeight: '600',
                                fontSize: '12px',
                                color: '#aaa',
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
                                width: '160px',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontWeight: '600',
                                fontSize: '12px',
                                color: '#aaa',
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
                                width: '36px',
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
                        padding: '8px 12px',
                        backgroundColor: '#2a2a2a'
                    },
                    elementHandler: async (el) => {
                        // Show loading while fetching
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
                                    // FIXED: Pass the raw deadline from database, not the formatted one
                                    const rawDeadline = val.dead_line || null

                                    // Format for display only
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
                                        deadline: rawDeadline,  // Pass the raw datetime string
                                        presentationDate: val.date_of_presentation || null,
                                        scoreId: val.scID
                                    }))
                                })
                            } else {
                                // Empty state
                                el.appendChild($({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        color: '#888',
                                        fontFamily: 'Segoe UI, sans-serif'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-calendar-xmark' },
                                            style: {
                                                fontSize: '48px',
                                                marginBottom: '16px',
                                                opacity: '0.3'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'No Events Found',
                                            style: {
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#aaa'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Create your first event to get started',
                                            style: {
                                                fontSize: '13px',
                                                marginTop: '8px'
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
                                    color: '#e91e63',
                                    fontFamily: 'Segoe UI, sans-serif',
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
            backgroundColor: '#1a1a1a'
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
                            width: '40%',
                            padding: '24px',
                            backgroundColor: '#2a2a2a',
                            borderRight: '1px solid #444',
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
                            width: '60%',
                            backgroundColor: '#2a2a2a',
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
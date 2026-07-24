import { $, Request, Waiting } from '../../../../lib/lib.js'

export const AddScoreSheetInHouse = ({ id, eventID, name }) => {
    let mainContainer
    let loadingElement = null
    let tableBody
    let searchInput
    let criteriaData = []
    let selectedCenter = 'all'
    let centers = []
    let totalPercentage = 0
    let modalElement = null

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
                backgroundColor: type === 'error' ? '#e74c3c' : '#2ecc71',
                color: '#fff',
                fontSize: '14px',
                zIndex: '5000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontFamily: 'Segoe UI, sans-serif'
            }
        })
        document.body.appendChild(notification)
        setTimeout(() => {
            notification.style.opacity = '0'
            notification.style.transition = 'opacity 0.3s'
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }

    // Fetch centers
    const fetchCenters = async () => {
        try {
            const req = new Request('/criteria')
            req.Post([{ name: 'getCenters', value: '1' }])
            req.Json()
            const data = await req.Send()
            centers = data || []
            updateCenterFilter()
            return centers
        } catch (error) {
            console.error('Error fetching centers:', error)
            return []
        }
    }

    // Fetch criteria for in-house event
    const fetchCriteria = async () => {
        try {
            const req = new Request('/criteria')
            req.Post([
                { name: 'criteriaListAllInHouse', value: '1' },
                { name: 'eventId', value: eventID }
            ])
            req.Json()
            const data = await req.Send()
            criteriaData = data || []
            updateTable()
            updateTotalPercentage()
            return data
        } catch (error) {
            console.error('Error fetching criteria:', error)
            return []
        }
    }

    // Update total percentage
    const updateTotalPercentage = () => {
        totalPercentage = 0
        criteriaData.forEach(item => {
            const percent = parseFloat(item.percentage) || 0
            totalPercentage += percent
        })

        const totalEl = document.getElementById('total-percentage-value')
        if (totalEl) {
            totalEl.textContent = totalPercentage.toFixed(2) + '%'

            if (totalPercentage === 100) {
                totalEl.style.color = '#27ae60'
            } else if (totalPercentage > 100) {
                totalEl.style.color = '#e74c3c'
            } else if (totalPercentage >= 80) {
                totalEl.style.color = '#f39c12'
            } else {
                totalEl.style.color = '#f39c12'
            }
        }
    }

    // Update center filter dropdown
    const updateCenterFilter = () => {
        const selectEl = document.getElementById('center-filter')
        if (!selectEl) return

        selectEl.innerHTML = ''

        const allOption = document.createElement('option')
        allOption.value = 'all'
        allOption.textContent = 'All Centers'
        allOption.selected = selectedCenter === 'all'
        selectEl.appendChild(allOption)

        centers.forEach(center => {
            const option = document.createElement('option')
            option.value = center.id
            option.textContent = center.name
            option.selected = selectedCenter === center.id.toString()
            selectEl.appendChild(option)
        })
    }

    // Filter and update table
    const updateTable = () => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        let filteredData = criteriaData

        if (selectedCenter !== 'all') {
            filteredData = filteredData.filter(item => item.center_id?.toString() === selectedCenter)
        }

        const searchTerm = searchInput?.value?.toLowerCase() || ''
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                (item.name?.toLowerCase().includes(searchTerm)) ||
                (item.center_name?.toLowerCase().includes(searchTerm))
            )
        }

        if (filteredData.length === 0) {
            tableBody.appendChild(createEmptyState())
            return
        }

        filteredData.forEach((item, index) => {
            tableBody.appendChild(createTableRow(item, index + 1))
        })
    }

    // Create empty state
    const createEmptyState = () => {
        return $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: '7' },
                    style: {
                        padding: '60px 20px',
                        textAlign: 'center'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-clipboard-list' },
                                    style: {
                                        fontSize: '48px',
                                        color: '#ccc',
                                        opacity: '0.6'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Criteria Found',
                                    style: {
                                        fontSize: '18px',
                                        color: '#999',
                                        fontWeight: '600'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Add criteria for each center using the button above',
                                    style: {
                                        fontSize: '13px',
                                        color: '#bbb'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Create table row
    const createTableRow = (item, rowNumber) => {
        const percentage = parseFloat(item.percentage) || 0

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #f0f0f0',
                transition: 'all 0.2s ease'
            },
            child: [
                // Row number
                $({
                    tag: 'td',
                    text: rowNumber.toString(),
                    style: {
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#999',
                        width: '50px',
                        fontWeight: '500'
                    }
                }),
                // Criteria Name
                $({
                    tag: 'td',
                    text: item.name || '—',
                    style: {
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: '#2c3e50',
                        fontWeight: '600',
                        minWidth: '200px'
                    },
                    title: item.name
                }),
                // Center
                $({
                    tag: 'td',
                    text: item.center_name || '—',
                    style: {
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: '#2980b9',
                        fontWeight: '500',
                        minWidth: '150px'
                    }
                }),
                // Center Code
                $({
                    tag: 'td',
                    text: item.center_code || '—',
                    style: {
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: '#7f8c8d',
                        minWidth: '80px',
                        fontWeight: '500'
                    }
                }),
                // Description
                $({
                    tag: 'td',
                    text: item.description || '—',
                    style: {
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: '#7f8c8d',
                        maxWidth: '300px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        fontStyle: 'italic'
                    },
                    title: item.description
                }),
                // Percentage
                $({
                    tag: 'td',
                    style: {
                        padding: '12px',
                        textAlign: 'center',
                        width: '100px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: percentage === 100 ? 'rgba(46, 204, 113, 0.12)' :
                                    percentage >= 50 ? 'rgba(243, 156, 18, 0.12)' :
                                        'rgba(41, 128, 185, 0.12)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                border: `1px solid ${percentage === 100 ? 'rgba(46, 204, 113, 0.25)' :
                                    percentage >= 50 ? 'rgba(243, 156, 18, 0.25)' :
                                        'rgba(41, 128, 185, 0.25)'}`
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: percentage.toFixed(2) + '%',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: percentage === 100 ? '#27ae60' :
                                            percentage >= 50 ? '#f39c12' : '#2980b9'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Progress bar
                $({
                    tag: 'td',
                    style: {
                        padding: '12px 16px',
                        width: '150px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '6px',
                                backgroundColor: '#ecf0f1',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: percentage + '%',
                                        height: '100%',
                                        backgroundColor: percentage === 100 ? '#2ecc71' :
                                            percentage >= 70 ? '#3498db' :
                                                percentage >= 40 ? '#f39c12' : '#e74c3c',
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Actions
                $({
                    tag: 'td',
                    style: {
                        padding: '12px',
                        textAlign: 'center',
                        width: '100px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'center'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    att: { className: 'fa-solid fa-pen-to-square' },
                                    style: {
                                        backgroundColor: 'rgba(52, 152, 219, 0.08)',
                                        border: '1px solid rgba(52, 152, 219, 0.2)',
                                        color: '#3498db',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'all 0.2s ease',
                                        width: '32px',
                                        height: '32px'
                                    },
                                    title: 'Edit Criteria',
                                    event: {
                                        type: 'click',
                                        method: () => openEditModal(item)
                                    },
                                    elementHandler: (el) => {
                                        el.addEventListener('mouseenter', () => {
                                            el.style.backgroundColor = 'rgba(52, 152, 219, 0.15)'
                                            el.style.transform = 'scale(1.1)'
                                        })
                                        el.addEventListener('mouseleave', () => {
                                            el.style.backgroundColor = 'rgba(52, 152, 219, 0.08)'
                                            el.style.transform = 'scale(1)'
                                        })
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    att: { className: 'fa-solid fa-trash-can' },
                                    style: {
                                        backgroundColor: 'rgba(231, 76, 60, 0.08)',
                                        border: '1px solid rgba(231, 76, 60, 0.2)',
                                        color: '#e74c3c',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'all 0.2s ease',
                                        width: '32px',
                                        height: '32px'
                                    },
                                    title: 'Delete Criteria',
                                    event: {
                                        type: 'click',
                                        method: () => deleteCriteria(item)
                                    },
                                    elementHandler: (el) => {
                                        el.addEventListener('mouseenter', () => {
                                            el.style.backgroundColor = 'rgba(231, 76, 60, 0.15)'
                                            el.style.transform = 'scale(1.1)'
                                        })
                                        el.addEventListener('mouseleave', () => {
                                            el.style.backgroundColor = 'rgba(231, 76, 60, 0.08)'
                                            el.style.transform = 'scale(1)'
                                        })
                                    }
                                })
                            ]
                        })
                    ]
                })
            ],
            event: {
                type: 'mouseenter',
                method: (e) => { e.currentTarget.style.backgroundColor = '#fafbfc' }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => { e.currentTarget.style.backgroundColor = '#ffffff' }
            }
        })
    }

    // Open add/edit modal
    const openAddModal = () => {
        if (totalPercentage >= 100) {
            showNotification('Total percentage has reached 100%. Cannot add more criteria.', 'error')
            return
        }
        openEditModal(null)
    }

    // Open edit modal
    const openEditModal = (item) => {
        if (modalElement) modalElement.remove()

        const formData = {
            name: item?.name || '',
            description: item?.description || '',
            percentage: item?.percentage || '',
            centerId: item?.center_id || ''
        }

        let nameInput, descInput, percentInput, centerSelect

        modalElement = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '5000',
                backdropFilter: 'blur(4px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '550px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #eef2f7'
                    },
                    child: [
                        // Header
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid #eef2f7',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: item ? 'Edit Criteria' : 'Add New Criteria',
                                    style: {
                                        color: '#2c3e50',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        margin: '0'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-times' },
                                    style: {
                                        fontSize: '20px',
                                        color: '#bdc3c7',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: { type: 'click', method: closeModal },
                                    elementHandler: (el) => {
                                        el.addEventListener('mouseenter', () => {
                                            el.style.color = '#2c3e50'
                                            el.style.backgroundColor = '#f5f6fa'
                                        })
                                        el.addEventListener('mouseleave', () => {
                                            el.style.color = '#bdc3c7'
                                            el.style.backgroundColor = 'transparent'
                                        })
                                    }
                                })
                            ]
                        }),
                        // Form Body
                        $({
                            tag: 'div',
                            style: { padding: '24px' },
                            child: [
                                // Criteria Name
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Criteria Name',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#7f8c8d',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'text',
                                                placeholder: 'Enter criteria name...',
                                                value: formData.name
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e0e4e8',
                                                borderRadius: '8px',
                                                color: '#2c3e50',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                                boxSizing: 'border-box'
                                            },
                                            elementHandler: (el) => {
                                                nameInput = el
                                                el.addEventListener('focus', () => {
                                                    el.style.borderColor = '#3498db'
                                                    el.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)'
                                                })
                                                el.addEventListener('blur', () => {
                                                    el.style.borderColor = '#e0e4e8'
                                                    el.style.boxShadow = 'none'
                                                })
                                            }
                                        })
                                    ]
                                }),
                                // Center
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Center',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#7f8c8d',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'select',
                                            style: {
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e0e4e8',
                                                borderRadius: '8px',
                                                color: '#2c3e50',
                                                fontSize: '14px',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxSizing: 'border-box'
                                            },
                                            elementHandler: (el) => {
                                                centerSelect = el
                                                el.innerHTML = '<option value="">-- Select Center --</option>'
                                                centers.forEach(center => {
                                                    const opt = document.createElement('option')
                                                    opt.value = center.id
                                                    opt.textContent = center.name + ' (' + center.code + ')'
                                                    if (center.id.toString() === formData.centerId.toString()) {
                                                        opt.selected = true
                                                    }
                                                    el.appendChild(opt)
                                                })
                                                el.addEventListener('focus', () => {
                                                    el.style.borderColor = '#3498db'
                                                    el.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)'
                                                })
                                                el.addEventListener('blur', () => {
                                                    el.style.borderColor = '#e0e4e8'
                                                    el.style.boxShadow = 'none'
                                                })
                                            }
                                        })
                                    ]
                                }),
                                // Description
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Description',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#7f8c8d',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'textarea',
                                            att: {
                                                placeholder: 'Enter description...',
                                                rows: '3'
                                            },
                                            text: formData.description,
                                            style: {
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e0e4e8',
                                                borderRadius: '8px',
                                                color: '#2c3e50',
                                                fontSize: '14px',
                                                outline: 'none',
                                                resize: 'vertical',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                transition: 'all 0.2s ease',
                                                boxSizing: 'border-box'
                                            },
                                            elementHandler: (el) => {
                                                descInput = el
                                                el.addEventListener('focus', () => {
                                                    el.style.borderColor = '#3498db'
                                                    el.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)'
                                                })
                                                el.addEventListener('blur', () => {
                                                    el.style.borderColor = '#e0e4e8'
                                                    el.style.boxShadow = 'none'
                                                })
                                            }
                                        })
                                    ]
                                }),
                                // Percentage
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '24px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: `Percentage (Remaining: ${(100 - totalPercentage).toFixed(2)}%)`,
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#7f8c8d',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'number',
                                                placeholder: 'Enter percentage...',
                                                min: '0',
                                                max: item ? (100 - totalPercentage + parseFloat(item.percentage || 0)) : (100 - totalPercentage),
                                                step: '0.01',
                                                value: formData.percentage
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e0e4e8',
                                                borderRadius: '8px',
                                                color: '#2c3e50',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                                boxSizing: 'border-box'
                                            },
                                            elementHandler: (el) => {
                                                percentInput = el
                                                el.addEventListener('focus', () => {
                                                    el.style.borderColor = '#f39c12'
                                                    el.style.boxShadow = '0 0 0 3px rgba(243, 156, 18, 0.1)'
                                                })
                                                el.addEventListener('blur', () => {
                                                    el.style.borderColor = '#e0e4e8'
                                                    el.style.boxShadow = 'none'
                                                })
                                            }
                                        })
                                    ]
                                }),
                                // Buttons
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            text: 'Cancel',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #e0e4e8',
                                                borderRadius: '8px',
                                                color: '#7f8c8d',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: { type: 'click', method: closeModal },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = '#e74c3c'
                                                    el.style.color = '#e74c3c'
                                                })
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#e0e4e8'
                                                    el.style.color = '#7f8c8d'
                                                })
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            text: item ? 'Update Criteria' : 'Add Criteria',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#3498db',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: async () => {
                                                    const name = nameInput?.value?.trim()
                                                    const description = descInput?.value?.trim()
                                                    const percentage = percentInput?.value
                                                    const centerId = centerSelect?.value

                                                    if (!name || !description || !percentage || !centerId) {
                                                        showNotification('Please fill in all fields', 'error')
                                                        return
                                                    }

                                                    const percentNum = parseFloat(percentage)
                                                    if (isNaN(percentNum) || percentNum <= 0 || percentNum > 100) {
                                                        showNotification('Please enter a valid percentage (0-100)', 'error')
                                                        return
                                                    }

                                                    let availableTotal = 100 - totalPercentage
                                                    if (item) {
                                                        availableTotal += parseFloat(item.percentage || 0)
                                                    }
                                                    if (percentNum > availableTotal) {
                                                        showNotification(`Maximum allowed is ${availableTotal.toFixed(2)}%`, 'error')
                                                        return
                                                    }

                                                    showLoading()

                                                    const form = new FormData()
                                                    form.append('addCriteriaInHouse', '1')
                                                    form.append('eventId', eventID)
                                                    form.append('scoreId', id)
                                                    form.append('centerId', centerId)
                                                    form.append('name[]', name)
                                                    form.append('description[]', description)
                                                    form.append('percentage[]', percentage)

                                                    try {
                                                        const response = await fetch('/scoreSheet', {
                                                            method: 'POST',
                                                            body: form
                                                        })
                                                        const data = await response.json()

                                                        if (data.status) {
                                                            closeModal()
                                                            showNotification('Criteria saved successfully!', 'success')
                                                            setTimeout(async () => {
                                                                await fetchCriteria()
                                                            }, 500)
                                                        } else {
                                                            showNotification(data.message || 'Error saving criteria', 'error')
                                                        }
                                                    } catch (error) {
                                                        showNotification('Error connecting to server', 'error')
                                                    } finally {
                                                        hideLoading()
                                                    }
                                                }
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.backgroundColor = '#2980b9'
                                                    el.style.transform = 'translateY(-2px)'
                                                    el.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)'
                                                })
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.backgroundColor = '#3498db'
                                                    el.style.transform = 'translateY(0)'
                                                    el.style.boxShadow = 'none'
                                                })
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target === e.currentTarget) closeModal()
                }
            }
        })

        document.body.appendChild(modalElement)
    }

    // Delete criteria
    const deleteCriteria = async (item) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

        showLoading()
        try {
            const form = new FormData()
            form.append('deleteCriteria', '1')
            form.append('criteriaId', item.id)

            const response = await fetch('/scoreSheet', {
                method: 'POST',
                body: form
            })
            const data = await response.json()

            if (data.status) {
                showNotification('Criteria deleted successfully!', 'success')
                await fetchCriteria()
            } else {
                showNotification(data.message || 'Error deleting criteria', 'error')
            }
        } catch (error) {
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    // Header Component
    const Header = () => {
        return $({
            tag: 'div',
            style: {
                padding: '16px 24px',
                borderBottom: '1px solid #eef2f7',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'a',
                            att: { href: '/admin/events' },
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#3498db',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(52, 152, 219, 0.2)',
                                backgroundColor: 'rgba(52, 152, 219, 0.06)',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-arrow-left' }
                                }),
                                $({ tag: 'span', text: 'Back to Events' })
                            ],
                            elementHandler: (el) => {
                                el.addEventListener('mouseenter', () => {
                                    el.style.backgroundColor = 'rgba(52, 152, 219, 0.12)'
                                })
                                el.addEventListener('mouseleave', () => {
                                    el.style.backgroundColor = 'rgba(52, 152, 219, 0.06)'
                                })
                            }
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'h1',
                                    text: name + ' - In-House Score Criteria',
                                    style: {
                                        color: '#2c3e50',
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        margin: '0',
                                        letterSpacing: '-0.5px'
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
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '20px',
                                border: '1px solid #eef2f7'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Total:',
                                    style: {
                                        color: '#7f8c8d',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { id: 'total-percentage-value' },
                                    text: '0.00%',
                                    style: {
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#f39c12'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Toolbar Component
    const Toolbar = () => {
        return $({
            tag: 'div',
            style: {
                padding: '12px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #eef2f7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-magnifying-glass' },
                                    style: {
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#bdc3c7',
                                        fontSize: '14px'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search criteria...',
                                        id: 'search-criteria'
                                    },
                                    style: {
                                        backgroundColor: '#f8f9fa',
                                        border: '1px solid #e0e4e8',
                                        borderRadius: '8px',
                                        padding: '9px 16px 9px 38px',
                                        color: '#2c3e50',
                                        fontSize: '13px',
                                        width: '250px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    elementHandler: (el) => {
                                        searchInput = el
                                        el.addEventListener('focus', () => {
                                            el.style.borderColor = '#3498db'
                                            el.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)'
                                        })
                                        el.addEventListener('blur', () => {
                                            el.style.borderColor = '#e0e4e8'
                                            el.style.boxShadow = 'none'
                                        })
                                    },
                                    event: {
                                        type: 'input',
                                        method: () => updateTable()
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'select',
                            att: { id: 'center-filter' },
                            style: {
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e0e4e8',
                                borderRadius: '8px',
                                padding: '9px 16px',
                                color: '#2c3e50',
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer',
                                minWidth: '200px',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'change',
                                method: (e) => {
                                    selectedCenter = e.target.value
                                    updateTable()
                                }
                            }
                        })
                    ]
                }),
                $({
                    tag: 'button',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-plus' },
                            style: { fontSize: '12px' }
                        }),
                        $({ tag: 'span', text: 'Add Criteria' })
                    ],
                    event: { type: 'click', method: openAddModal },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#2980b9'
                            el.style.transform = 'translateY(-2px)'
                            el.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#3498db'
                            el.style.transform = 'translateY(0)'
                            el.style.boxShadow = 'none'
                        })
                    }
                })
            ]
        })
    }

    // Table Component
    const Table = () => {
        return $({
            tag: 'div',
            style: {
                flex: '1',
                overflow: 'auto',
                backgroundColor: '#f8f9fa'
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '1000px'
                    },
                    child: [
                        $({
                            tag: 'thead',
                            style: {
                                position: 'sticky',
                                top: '0',
                                zIndex: '1'
                            },
                            child: [
                                $({
                                    tag: 'tr',
                                    style: {
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '2px solid #eef2f7'
                                    },
                                    child: [
                                        $({
                                            tag: 'th',
                                            text: '#',
                                            style: {
                                                padding: '14px 12px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                width: '50px',
                                                textAlign: 'center'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Criteria Name',
                                            style: {
                                                padding: '14px 16px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                textAlign: 'left'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Center',
                                            style: {
                                                padding: '14px 16px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                textAlign: 'left'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Code',
                                            style: {
                                                padding: '14px 16px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                textAlign: 'left'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Description',
                                            style: {
                                                padding: '14px 16px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                textAlign: 'left'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Percentage',
                                            style: {
                                                padding: '14px 12px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                width: '100px',
                                                textAlign: 'center'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Progress',
                                            style: {
                                                padding: '14px 16px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                width: '150px',
                                                textAlign: 'left'
                                            }
                                        }),
                                        $({
                                            tag: 'th',
                                            text: 'Actions',
                                            style: {
                                                padding: '14px 12px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#95a5a6',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '2px solid #eef2f7',
                                                width: '100px',
                                                textAlign: 'center'
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        $({
                            tag: 'tbody',
                            elementHandler: (el) => {
                                tableBody = el
                            }
                        })
                    ]
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
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: '999',
            fontFamily: 'Segoe UI, sans-serif'
        },
        elementHandler: async (el) => {
            mainContainer = el
            showLoading()
            try {
                await fetchCenters()
                await fetchCriteria()
            } catch (error) {
                console.error('Error initializing:', error)
            } finally {
                hideLoading()
            }
        },
        child: [
            Header(),
            Toolbar(),
            Table()
        ]
    })
}
import { $ } from "../../../lib/lib.js"

export const Publication = () => {
    let mainTableContainer
    let tableBody
    let modalOverlay
    let publications = [] // Store publications data
    
    // Columns for publication research
    const columns = [
        { field: 'publishedTitle', header: 'Published Title', width: '350px', type: 'text', required: true },
        { field: 'publicationDate', header: 'Date of Publication', width: '150px', type: 'date', required: true },
        { field: 'journalTitle', header: 'Title of Journal / Publication', width: '300px', type: 'text', required: true },
        { field: 'volumeIssue', header: 'Volume & Issue', width: '120px', type: 'text', required: true },
        { field: 'issn', header: 'ISSN / ISBN', width: '130px', type: 'text', required: true },
        { field: 'index', header: 'Index', width: '100px', type: 'select', required: true },
        { field: 'authors', header: 'Author/s', width: '250px', type: 'text', required: true },
        { field: 'campus', header: 'Campus/Center', width: '120px', type: 'select', required: true },
        { field: 'category', header: 'Category', width: '120px', type: 'select', required: true },
        { field: 'doi', header: 'DOI', width: '200px', type: 'text', required: false },
        { field: 'quartile', header: 'Quartile', width: '80px', type: 'select', required: false }
    ]

    // Index types with their colors
    const indexTypes = [
        { value: 'refereed', label: 'Refereed', color: '#ffffff', bgColor: '#2a2a2a' },
        { value: 'scopus', label: 'Scopus', color: '#000000', bgColor: '#ffd700' },
        { value: 'wos', label: 'WOS', color: '#ffffff', bgColor: '#4caf50' }
    ]

    // Quartile options
    const quartileOptions = ['Q1', 'Q2', 'Q3', 'Q4', 'N/A']

    // Campus options
    const campusOptions = [
        'Roxas City Main', 'Dayao', 'Burias', 'Pontevedra', 'Sigma', 'Pilar',
        'Tapaz', 'Dumarao', 'Crop Science Research & Developement C(CSRDC)',
        'Livestock Research & Development C(LRDC)', 'Fisheries Research & Development C(FRDC)',
        'Food and Industrial Technology Research & Development C(FITRDC)', 'Social Science Research & Development C(SSRDC)',
        'Machinery and Agricultural Technology Engineering C(MATEC)', 'Coconut Research and Development C(Coco RDC)', 'Extension (Extension)'
    ]

    // Category options
    const categoryOptions = [
        'Agricultural Machinery', 'Development', 'Natural/Biological', 'Engineering', 'Extension', 'Food',
        'Industrial', 'Information Technology', 'Social Science'
    ]

    const getMainContainer = (el) => {
        mainTableContainer = el
    }

    const getTableBody = (el) => {
        tableBody = el
        updateTableDisplay()
    }

    // Function to update table display based on publications data
    const updateTableDisplay = () => {
        if (!tableBody) return
        
        // Clear table body
        tableBody.innerHTML = ''
        
        if (publications.length === 0) {
            // Show empty state
            const emptyState = createEmptyState()
            tableBody.appendChild(emptyState)
        } else {
            // Populate table with publications
            publications.forEach(pub => {
                const row = createPublicationRow(pub)
                tableBody.appendChild(row)
            })
        }
    }

    // Create empty state
    const createEmptyState = () => {
        return $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: {
                        padding: '0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '350px',
                                width: '100%',
                                color: '#888',
                                fontFamily: 'Segoe UI, sans-serif'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        position: 'relative',
                                        width: '160px',
                                        height: '160px',
                                        marginBottom: '24px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-book-open' },
                                            style: { 
                                                fontSize: '100px', 
                                                color: 'deepskyblue',
                                                opacity: 0.2,
                                                position: 'absolute',
                                                left: '0',
                                                top: '0',
                                                transform: 'rotate(-5deg)'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-scroll' },
                                            style: { 
                                                fontSize: '70px', 
                                                color: '#ffd700',
                                                opacity: 0.25,
                                                position: 'absolute',
                                                right: '-10px',
                                                bottom: '0',
                                                transform: 'rotate(10deg)'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-award' },
                                            style: { 
                                                fontSize: '50px', 
                                                color: '#4caf50',
                                                opacity: 0.3,
                                                position: 'absolute',
                                                left: '-15px',
                                                bottom: '10px',
                                                transform: 'rotate(-15deg)'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Published Research Found',
                                    style: { 
                                        fontSize: '26px', 
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#fff',
                                        letterSpacing: '-0.5px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Published research papers in refereed journals, Scopus, WOS, and other',
                                    style: { 
                                        fontSize: '15px', 
                                        opacity: 0.7,
                                        textAlign: 'center',
                                        lineHeight: '1.6'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'indexed publications will be displayed here',
                                    style: { 
                                        fontSize: '15px', 
                                        opacity: 0.7,
                                        marginBottom: '30px',
                                        textAlign: 'center'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        gap: '15px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Create publication row
    const createPublicationRow = (publication) => {
        const cells = columns.map(col => {
            let cellContent = publication[col.field] || '—'
            let cellStyle = {
                padding: '16px 12px',
                fontSize: '13px',
                color: '#ddd',
                borderBottom: '1px solid #444',
                whiteSpace: 'nowrap',
                fontFamily: 'Segoe UI, sans-serif'
            }

            if (col.field === 'index') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createIndexBadge(cellContent)]
                })
            }

            if (col.field === 'publicationDate' && cellContent !== '—') {
                cellContent = formatPublicationDate(cellContent)
            }

            return $({
                tag: 'td',
                style: cellStyle,
                text: cellContent
            })
        })

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#2d2d2d',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#333'
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                }
            }
        })
    }

    // Function to create index badge with color coding
    const createIndexBadge = (indexType) => {
        const indexConfig = indexTypes.find(i => i.value === indexType) || indexTypes[0]
        
        return $({
            tag: 'span',
            att: { className: `index-badge index-${indexType}` },
            style: {
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                backgroundColor: indexConfig.bgColor,
                color: indexConfig.color,
                border: indexType === 'refereed' ? '1px solid #444' : 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            text: indexConfig.label
        })
    }

    // Open add publication modal
    const openAddPublicationModal = () => {
        const modal = createPublicationModal()
        document.body.appendChild(modal)
        setTimeout(() => {
            modalOverlay.style.opacity = '1'
        }, 10)
    }

    // Close modal
    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.style.opacity = '0'
            setTimeout(() => {
                if (modalOverlay && modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay)
                }
            }, 300)
        }
    }

    // Create publication modal
    const createPublicationModal = () => {
        // Create form fields grid children
        const formFieldsGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
            },
            child: columns.map(col => createFormField(col))
        })

        // Create form actions
        const formActions = $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px',
                borderTop: '1px solid #444',
                paddingTop: '24px'
            },
            child: [
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        backgroundColor: 'transparent',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        color: '#aaa',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    text: 'Cancel',
                    event: {
                        type: 'click',
                        method: closeModal
                    }
                }),
                $({
                    tag: 'button',
                    att: { type: 'submit' },
                    style: {
                        backgroundColor: 'deepskyblue',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 32px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-save' }
                        }),
                        $({
                            tag: 'span',
                            text: 'Save Publication'
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.preventDefault()
                            savePublication()
                        }
                    }
                })
            ]
        })

        // Create form
        const form = $({
            tag: 'form',
            att: { id: 'publicationForm' },
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            },
            child: [
                formFieldsGrid,
                formActions
            ]
        })

        // Create modal header close button
        const closeButton = $({
            tag: 'button',
            style: {
                background: 'none',
                border: 'none',
                color: '#aaa',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 8px',
                transition: 'color 0.2s ease'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-times' }
                })
            ],
            event: {
                type: 'click',
                method: closeModal
            }
        })

        // Create modal header
        const modalHeader = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderBottom: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#2a2a2a'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-plus-circle' },
                            style: { color: 'deepskyblue', fontSize: '24px' }
                        }),
                        $({
                            tag: 'h2',
                            text: 'Add New Publication',
                            style: {
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0',
                                letterSpacing: '-0.5px'
                            }
                        })
                    ]
                }),
                closeButton
            ]
        })

        // Create modal body
        const modalBody = $({
            tag: 'div',
            style: {
                padding: '24px',
                overflow: 'auto',
                maxHeight: 'calc(90vh - 140px)'
            },
            child: [form]
        })

        // Create modal content
        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '1000px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                border: '1px solid #444',
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                modalHeader,
                modalBody
            ]
        })

        modalOverlay = $({
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
                zIndex: '9999',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                backdropFilter: 'blur(5px)'
            },
            child: [modalContent]
        })

        return modalOverlay
    }

    // Create form field based on column type
    const createFormField = (column) => {
        const fieldId = `field-${column.field}`
        let inputElement

        // Common label style
        const labelStyle = {
            display: 'block',
            marginBottom: '8px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.3px'
        }

        // Common input style
        const inputBaseStyle = {
            width: '100%',
            padding: '12px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
        }

        // Create different input types
        if (column.type === 'select') {
            let options = []
            
            if (column.field === 'index') {
                options = indexTypes
            } else if (column.field === 'quartile') {
                options = quartileOptions.map(q => ({ value: q, label: q }))
            } else if (column.field === 'campus') {
                options = campusOptions.map(c => ({ value: c, label: c }))
            } else if (column.field === 'category') {
                options = categoryOptions.map(c => ({ value: c, label: c }))
            }

            inputElement = $({
                tag: 'select',
                att: {
                    id: fieldId,
                    name: fieldId,
                    required: column.required ? true : undefined
                },
                style: {
                    ...inputBaseStyle,
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                },
                child: [
                    $({
                        tag: 'option',
                        att: { value: '', disabled: true, selected: true },
                        text: `Select ${column.header}`
                    }),
                    ...options.map(opt => 
                        $({
                            tag: 'option',
                            att: { value: opt.value || opt },
                            text: opt.label || opt
                        })
                    )
                ]
            })
        } else if (column.type === 'date') {
            inputElement = $({
                tag: 'input',
                att: {
                    type: 'date',
                    id: fieldId,
                    name: fieldId,
                    required: column.required ? true : undefined
                },
                style: inputBaseStyle
            })
        } else {
            inputElement = $({
                tag: 'input',
                att: {
                    type: column.type || 'text',
                    id: fieldId,
                    name: fieldId,
                    placeholder: `${column.header}`,
                    required: column.required ? true : undefined
                },
                style: inputBaseStyle
            })
        }

        // Create label with optional asterisk
        const labelChildren = [
            $({
                tag: 'span',
                text: column.header
            })
        ]

        if (column.required) {
            labelChildren.push(
                $({
                    tag: 'span',
                    text: ' *',
                    style: { color: 'deepskyblue', marginLeft: '4px' }
                })
            )
        }

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                $({
                    tag: 'label',
                    att: { for: fieldId },
                    style: labelStyle,
                    child: labelChildren
                }),
                inputElement
            ]
        })
    }

    // Update the savePublication function to properly get form data
    const savePublication = () => {
        const form = document.getElementById('publicationForm')
        if (!form) return

        // Get form data
        const newPublication = {}
        
        columns.forEach(col => {
            const fieldId = `field-${col.field}`
            const field = form.elements[fieldId]
            if (field) {
                const value = field.value
                if (value) {
                    newPublication[col.field] = value
                }
            }
        })

        // Validate required fields
        const missingRequired = columns
            .filter(col => col.required && !newPublication[col.field])
            .map(col => col.header)

        if (missingRequired.length > 0) {
            alert(`Please fill in required fields: ${missingRequired.join(', ')}`)
            return
        }

        // Add to publications array
        publications.push(newPublication)
        
        // Update table display
        updateTableDisplay()
        
        // Close modal
        closeModal()
        
        // Show success message (optional)
        console.log('Publication added:', newPublication)
    }

    // Filter and search bar with index filter
    const FilterBar = () => {
        return $({
            tag: 'div',
            att: { className: 'filter-bar' },
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444',
                flexWrap: 'wrap',
                gap: '15px'
            },
            child: [
                // Left section - Title and filter buttons
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-book' },
                                    style: { color: 'deepskyblue', fontSize: '24px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Publications',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        margin: '0',
                                        letterSpacing: '-0.5px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'record-count' },
                                    style: {
                                        backgroundColor: '#333',
                                        color: '#aaa',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #444'
                                    },
                                    text: `${publications.length} publication${publications.length !== 1 ? 's' : ''}`
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '8px',
                                backgroundColor: '#333',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid #444'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'All',
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Refereed',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Scopus',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'WOS',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                
                // Right section - Search, filters, and action buttons
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    },
                    child: [
                        // Search input
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-magnifying-glass' },
                                    style: {
                                        position: 'absolute',
                                        left: '14px',
                                        color: '#666',
                                        fontSize: '14px',
                                        zIndex: '1'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search publications...',
                                        className: 'publication-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '220px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            console.log('Searching:', e.target.value)
                                        }
                                    }
                                })
                            ]
                        }),
                        
                        // Index filter dropdown
                        $({
                            tag: 'select',
                            att: {
                                className: 'index-filter'
                            },
                            style: {
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '30px',
                                padding: '10px 32px 10px 16px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                minWidth: '130px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Indexes' }),
                                ...indexTypes.map(index => 
                                    $({ tag: 'option', att: { value: index.value }, text: index.label })
                                )
                            ]
                        }),
                        
                        // Quartile filter dropdown
                        $({
                            tag: 'select',
                            att: {
                                className: 'quartile-filter'
                            },
                            style: {
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '30px',
                                padding: '10px 32px 10px 16px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                minWidth: '120px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Quartiles' }),
                                ...quartileOptions.map(quartile => 
                                    $({ tag: 'option', att: { value: quartile }, text: quartile })
                                )
                            ]
                        }),
                        
                        // Action buttons group
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                borderLeft: '1px solid #444',
                                paddingLeft: '12px',
                                marginLeft: '4px'
                            },
                            child: [
                                // Add Publication button
                                $({
                                    tag: 'button',
                                    att: { className: 'add-publication-btn' },
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '30px',
                                        padding: '10px 20px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0, 191, 255, 0.3)'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-plus-circle' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Add Publication'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: openAddPublicationModal
                                    }
                                }),
                                
                                // Import Publications button
                                $({
                                    tag: 'button',
                                    att: { className: 'import-btn' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 20px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-file-import' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Import'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            console.log('Import publications clicked')
                                        }
                                    }
                                }),
                                
                                // Export button
                                $({
                                    tag: 'button',
                                    att: { className: 'export-btn' },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 20px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-download' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Export'
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Statistics cards for publication metrics
    const StatsCards = () => {
        const stats = [
            { 
                label: 'Total Publications', 
                value: publications.length.toString(), 
                icon: 'fa-book',
                color: 'deepskyblue',
                subtext: 'All time'
            },
            { 
                label: 'Scopus', 
                value: publications.filter(p => p.index === 'scopus').length.toString(), 
                icon: 'fa-magnifying-glass',
                color: '#ffd700',
                subtext: 'Yellow',
                textColor: '#000000'
            },
            { 
                label: 'WOS', 
                value: publications.filter(p => p.index === 'wos').length.toString(), 
                icon: 'fa-globe',
                color: '#4caf50',
                subtext: 'Green'
            },
            { 
                label: 'Refereed', 
                value: publications.filter(p => p.index === 'refereed').length.toString(), 
                icon: 'fa-check-circle',
                color: '#ffffff',
                subtext: 'White',
                borderColor: '#444'
            }
        ]

        const statCards = stats.map(stat => {
            return $({
                tag: 'div',
                att: { className: 'stat-card' },
                style: {
                    backgroundColor: '#2d2d2d',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: '1',
                    minWidth: '200px',
                    border: `1px solid ${stat.borderColor || '#444'}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '100px',
                            height: '100px',
                            background: `radial-gradient(circle at top right, ${stat.color}20, transparent 70%)`,
                            borderRadius: '50%',
                            zIndex: '0'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${stat.color}30`,
                            position: 'relative',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: `fa-solid ${stat.icon}` },
                                style: { 
                                    color: stat.color, 
                                    fontSize: '28px',
                                    textShadow: stat.textColor === '#000000' ? 'none' : '0 2px 4px rgba(0,0,0,0.2)'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '8px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: stat.value,
                                        style: {
                                            fontSize: '34px',
                                            fontWeight: '700',
                                            color: '#fff',
                                            lineHeight: '1.2',
                                            letterSpacing: '-1px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: stat.subtext,
                                        style: {
                                            fontSize: '11px',
                                            color: '#666',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '13px',
                                    color: '#aaa',
                                    fontWeight: '500'
                                }
                            })
                        ]
                    })
                ]
            })
        })

        return $({
            tag: 'div',
            att: { className: 'stats-cards' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            },
            child: statCards
        })
    }

    // Table header component
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#aaa',
                    backgroundColor: '#2d2d2d',
                    borderBottom: '2px solid #444',
                    whiteSpace: 'nowrap',
                    minWidth: col.width,
                    position: 'sticky',
                    top: '0',
                    zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            cursor: 'pointer',
                            userSelect: 'none'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-arrow-up-wide-short' },
                                style: { 
                                    fontSize: '11px', 
                                    color: '#555',
                                    opacity: '0.5',
                                    transition: 'all 0.2s ease'
                                }
                            })
                        ],
                        event: {
                            type: 'mouseenter',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid')
                                if (icon) icon.style.color = 'deepskyblue'
                            }
                        },
                        event2: {
                            type: 'mouseleave',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid')
                                if (icon) icon.style.color = '#555'
                            }
                        }
                    })
                ]
            })
        })

        return $({
            tag: 'thead',
            child: [
                $({
                    tag: 'tr',
                    child: headerCells
                })
            ]
        })
    }

    // Main table component
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 200px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0',
                        minWidth: 'max-content'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            elementHandler: getTableBody
                        })
                    ]
                })
            ]
        })
    }

    return $({
        tag: 'div',
        att: { className: 'publication-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/publication.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    })
}

// Utility functions for publications
export const formatPublicationDate = (date) => {
    if (!date) return '—'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    })
}

export const getIndexColor = (indexType) => {
    const colors = {
        'refereed': { bg: '#2a2a2a', text: '#ffffff', border: '#444' },
        'scopus': { bg: '#ffd700', text: '#000000' },
        'wos': { bg: '#4caf50', text: '#ffffff' }
    }
    return colors[indexType] || colors.refereed
}

export const createIndexBadgeElement = (indexType) => {
    const config = getIndexColor(indexType)
    const label = indexType.charAt(0).toUpperCase() + indexType.slice(1)
    
    return $({
        tag: 'span',
        att: { className: `index-badge index-${indexType}` },
        style: {
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-block',
            backgroundColor: config.bg,
            color: config.text,
            border: config.border ? `1px solid ${config.border}` : 'none'
        },
        text: label
    })
}

export const getPublicationStats = (data) => {
    // This function will calculate statistics from the data
    // Will be implemented when backend data is available
    return {
        total: 0,
        scopus: 0,
        wos: 0,
        refereed: 0
    }
}
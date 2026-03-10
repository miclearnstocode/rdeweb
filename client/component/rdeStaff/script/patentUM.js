import { $ } from "../../../lib/lib.js";

export const PatentUM = () => {
    let mainTableContainer;
    let tableBody;
    
    // Columns for patent and utility model
    const columns = [
        { field: 'productName', header: 'Product Name', width: '250px' },
        { field: 'methods', header: 'Methods / Process', width: '280px' },
        { field: 'patentNumber', header: 'Patent Number', width: '150px' },
        { field: 'productDescription', header: 'Product Description', width: '300px' },
        { field: 'benefitingIndustry', header: 'Benefiting Industry / Community', width: '280px' },
        { field: 'status', header: 'Status', width: '120px' },
        { field: 'filingDate', header: 'Filing Date', width: '130px' },
        { field: 'grantDate', header: 'Grant Date', width: '130px' },
        { field: 'inventors', header: 'Inventors', width: '250px' },
        { field: 'assignee', header: 'Assignee', width: '200px' },
        { field: 'campus', header: 'Campus/Center', width: '120px' },
        { field: 'type', header: 'Type', width: '120px' }
    ];

    // Patent/UM status options
    const statusOptions = [
        { value: 'filed', label: 'Filed', color: '#ff9800' },
        { value: 'published', label: 'Published', color: '#2196f3' },
        { value: 'granted', label: 'Granted', color: '#4caf50' },
        { value: 'pending', label: 'Pending', color: '#9c27b0' },
        { value: 'expired', label: 'Expired', color: '#f44336' }
    ];

    // Type options
    const typeOptions = [
        { value: 'patent', label: 'Patent', icon: 'fa-file-invoice' },
        { value: 'utility_model', label: 'Utility Model', icon: 'fa-cogs' },
        { value: 'industrial_design', label: 'Industrial Design', icon: 'fa-paint-brush' },
        { value: 'invention', label: 'Invention', icon: 'fa-lightbulb' }
    ];

    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    const getTableBody = (el) => {
        tableBody = el;
        
        // Create empty state with patent/UM specific message
        const emptyState = $({
            tag: 'div',
            att: { className: 'empty-state' },
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
                        width: '180px',
                        height: '180px',
                        marginBottom: '24px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-certificate' },
                            style: { 
                                fontSize: '100px', 
                                color: 'deepskyblue',
                                opacity: 0.2,
                                position: 'absolute',
                                left: '0',
                                top: '0',
                                transform: 'rotate(-10deg)'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-gears' },
                            style: { 
                                fontSize: '80px', 
                                color: '#4caf50',
                                opacity: 0.2,
                                position: 'absolute',
                                right: '-10px',
                                bottom: '10px',
                                transform: 'rotate(15deg)'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-trophy' },
                            style: { 
                                fontSize: '60px', 
                                color: '#ffd700',
                                opacity: 0.25,
                                position: 'absolute',
                                left: '-15px',
                                bottom: '20px',
                                transform: 'rotate(-20deg)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#fff',
                                backgroundColor: 'rgba(0,191,255,0.2)',
                                padding: '8px 16px',
                                borderRadius: '30px',
                                border: '1px solid deepskyblue',
                                whiteSpace: 'nowrap'
                            },
                            text: 'IP'
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: 'No Patent / Utility Model Records',
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
                    text: 'Patents, utility models, industrial designs, and inventions',
                    style: { 
                        fontSize: '15px', 
                        opacity: 0.7,
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'with intellectual property protection will be displayed here',
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
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '14px 32px',
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0, 191, 255, 0.2)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-plus-circle' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add Patent/UM'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Add patent/UM clicked');
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '30px',
                                padding: '14px 32px',
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-import' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Bulk Import'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Bulk import clicked');
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '30px',
                                padding: '14px 32px',
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-download' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Download Template'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Download template clicked');
                                }
                            }
                        })
                    ]
                })
            ]
        });
        el.appendChild(emptyState);
    };

    // Function to create status badge with color coding
    const createStatusBadge = (status) => {
        const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0];
        
        return $({
            tag: 'span',
            att: { className: `status-badge status-${status}` },
            style: {
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                backgroundColor: `${statusConfig.color}20`,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.color}40`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            text: statusConfig.label
        });
    };

    // Function to create type badge with icon
    const createTypeBadge = (type) => {
        const typeConfig = typeOptions.find(t => t.value === type) || typeOptions[0];
        
        return $({
            tag: 'span',
            att: { className: `type-badge type-${type}` },
            style: {
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#333',
                color: '#ddd',
                border: '1px solid #444',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${typeConfig.icon}` },
                    style: { fontSize: '11px', color: 'deepskyblue' }
                }),
                $({
                    tag: 'span',
                    text: typeConfig.label
                })
            ]
        });
    };

    // Filter and search bar
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
                                    att: { className: 'fa-solid fa-file-invoice' },
                                    style: { color: 'deepskyblue', fontSize: '24px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Patents & Utility Models',
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
                                    text: '0 records'
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
                                    text: 'Patents',
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
                                    text: 'Utility Models',
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
                                    text: 'Industrial Design',
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
                                        placeholder: 'Search patents...',
                                        className: 'patent-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '260px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            console.log('Searching:', e.target.value);
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'select',
                            att: {
                                className: 'status-filter'
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
                                minWidth: '140px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Status' }),
                                ...statusOptions.map(status => 
                                    $({ tag: 'option', att: { value: status.value }, text: status.label })
                                )
                            ]
                        }),
                        $({
                            tag: 'select',
                            att: {
                                className: 'type-filter'
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
                                minWidth: '150px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Types' }),
                                ...typeOptions.map(type => 
                                    $({ tag: 'option', att: { value: type.value }, text: type.label })
                                )
                            ]
                        }),
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
        });
    };

    // Statistics cards
    const StatsCards = () => {
        const stats = [
            { 
                label: 'Total IP Records', 
                value: '0', 
                icon: 'fa-file-invoice',
                color: 'deepskyblue',
                subtext: 'All time'
            },
            { 
                label: 'Patents', 
                value: '0', 
                icon: 'fa-certificate',
                color: '#4caf50',
                subtext: 'Granted & Pending'
            },
            { 
                label: 'Utility Models', 
                value: '0', 
                icon: 'fa-cogs',
                color: '#ff9800',
                subtext: 'Filed'
            },
            { 
                label: 'Granted', 
                value: '0', 
                icon: 'fa-trophy',
                color: '#ffd700',
                subtext: 'Approved',
                textColor: '#000000'
            }
        ];

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
                    border: '1px solid #444',
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
            });
        });

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
        });
    };

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
                                const icon = e.currentTarget.querySelector('.fa-solid');
                                if (icon) icon.style.color = 'deepskyblue';
                            }
                        },
                        event2: {
                            type: 'mouseleave',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid');
                                if (icon) icon.style.color = '#555';
                            }
                        }
                    })
                ]
            });
        });

        return $({
            tag: 'thead',
            child: [
                $({
                    tag: 'tr',
                    child: headerCells
                })
            ]
        });
    };

    // Sample data row (for demonstration)
    const SampleDataRow = () => {
        const cells = columns.map(col => {
            let cellContent = '—';
            let cellStyle = {
                padding: '16px 12px',
                fontSize: '13px',
                color: '#ddd',
                borderBottom: '1px solid #444',
                whiteSpace: 'nowrap',
                fontFamily: 'Segoe UI, sans-serif'
            };

            if (col.field === 'status') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createStatusBadge('granted')]
                });
            }

            if (col.field === 'type') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createTypeBadge('patent')]
                });
            }

            if (col.field === 'productName') cellContent = 'Solar-Powered Irrigation System';
            if (col.field === 'methods') cellContent = 'Photovoltaic cells, water pump controller, moisture sensors';
            if (col.field === 'patentNumber') cellContent = 'PH/UT/2025/00123';
            if (col.field === 'productDescription') cellContent = 'An automated irrigation system using renewable energy';
            if (col.field === 'benefitingIndustry') cellContent = 'Agriculture, Farming Communities';
            if (col.field === 'filingDate') cellContent = 'Jan 15, 2025';
            if (col.field === 'grantDate') cellContent = 'Mar 20, 2025';
            if (col.field === 'inventors') cellContent = 'Dr. Juan Dela Cruz, Engr. Maria Santos';
            if (col.field === 'assignee') cellContent = 'CAPSU - Pilar Campus';
            if (col.field === 'campus') cellContent = 'Pilar';

            return $({
                tag: 'td',
                style: cellStyle,
                text: cellContent
            });
        });

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
                    e.currentTarget.style.backgroundColor = '#333';
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d2d';
                }
            }
        });
    };

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
        });
    };

    return $({
        tag: 'div',
        att: { className: 'patent-um-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/patentUM.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    });
};

// Utility functions for patent/utility model
export const formatPatentDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
};

export const getStatusColor = (status) => {
    const colors = {
        'filed': '#ff9800',
        'published': '#2196f3',
        'granted': '#4caf50',
        'pending': '#9c27b0',
        'expired': '#f44336'
    };
    return colors[status] || '#9e9e9e';
};

export const getPatentStats = (data) => {
    // This function will calculate statistics from the data
    // Will be implemented when backend data is available
    return {
        total: 0,
        patents: 0,
        utilityModels: 0,
        industrialDesigns: 0,
        granted: 0,
        pending: 0
    };
};
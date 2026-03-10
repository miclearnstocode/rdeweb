import { $ } from "../../../lib/lib.js";

export const PresentationResearch = () => {
    let mainTableContainer;
    let tableBody;
    
    // Columns for presentation research
    const columns = [
        { field: 'dateCompleted', header: 'Date of Completion (MMM-DD-YYYY)', width: '150px' },
        { field: 'title', header: 'Title of Research', width: '300px' },
        { field: 'forumTitle', header: 'Title of Forum', width: '250px' },
        { field: 'venue', header: 'Venue', width: '200px' },
        { field: 'forumType', header: 'Forum Type', width: '150px' },
        { field: 'presentationDate', header: 'Date of Presentation', width: '150px' },
        { field: 'presentationType', header: 'Presentation Type', width: '180px' },
        { field: 'authors', header: 'Author/s', width: '250px' },
        { field: 'campus', header: 'Campus/Center', width: '120px' },
        { field: 'category', header: 'Category', width: '120px' }
    ];

    // Presentation type options
    const presentationTypes = [
        'University',
        'International Conference',
        'National Conference',
        'Regional Conference'
    ];

    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    const getTableBody = (el) => {
        tableBody = el;
        
        // Create empty state with presentation research specific message
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
                        width: '120px',
                        height: '120px',
                        marginBottom: '24px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-chalkboard-user' },
                            style: { 
                                fontSize: '80px', 
                                color: 'deepskyblue',
                                opacity: 0.3,
                                position: 'absolute',
                                left: '0',
                                top: '0'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-earth-asia' },
                            style: { 
                                fontSize: '50px', 
                                color: '#4caf50',
                                opacity: 0.4,
                                position: 'absolute',
                                right: '-10px',
                                bottom: '-10px'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-location-dot' },
                            style: { 
                                fontSize: '40px', 
                                color: '#ff9800',
                                opacity: 0.4,
                                position: 'absolute',
                                left: '-15px',
                                bottom: '0'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: 'No Presented Research Found',
                    style: { 
                        fontSize: '24px', 
                        marginBottom: '12px',
                        fontWeight: '600',
                        color: '#fff',
                        letterSpacing: '0.5px'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Research papers presented at international pitching, Capiz State University,',
                    style: { 
                        fontSize: '14px', 
                        opacity: 0.7,
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'and presentations outside CAPSU will appear here',
                    style: { 
                        fontSize: '14px', 
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
                                padding: '12px 28px',
                                color: '#fff',
                                fontSize: '14px',
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
                                    text: 'Add Presentation'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Add presentation clicked');
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '30px',
                                padding: '12px 28px',
                                color: '#fff',
                                fontSize: '14px',
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
                        })
                    ]
                })
            ]
        });
        el.appendChild(emptyState);
    };

    // Filter and search bar with presentation type filter
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
                                    att: { className: 'fa-solid fa-person-chalkboard' },
                                    style: { color: 'deepskyblue', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Presented Research',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '22px',
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
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
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
                                    text: 'International',
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
                                    text: 'Local',
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
                                    text: 'Outside CAPSU',
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
                                        placeholder: 'Search presentations...',
                                        className: 'presentation-search-input'
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
                                className: 'presentation-type-filter'
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
                                minWidth: '180px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Presentation Types' }),
                                ...presentationTypes.map(type => 
                                    $({ tag: 'option', att: { value: type.toLowerCase().replace(/\s+/g, '_') }, text: type })
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

    // Statistics cards for presentation metrics
    const StatsCards = () => {
        const stats = [
            { 
                label: 'Total Presentations', 
                value: '0', 
                icon: 'fa-presentation-screen',
                color: 'deepskyblue',
                subtext: 'All time'
            },
            { 
                label: 'International Pitching', 
                value: '0', 
                icon: 'fa-earth-asia',
                color: '#4caf50',
                subtext: 'Global reach'
            },
            { 
                label: 'Capiz State University', 
                value: '0', 
                icon: 'fa-building-columns',
                color: '#ff9800',
                subtext: 'Local institutions'
            },
            { 
                label: 'Outside CAPSU', 
                value: '0', 
                icon: 'fa-location-dot',
                color: '#e91e63',
                subtext: 'External venues'
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
                            width: '80px',
                            height: '80px',
                            background: `radial-gradient(circle at top right, ${stat.color}20, transparent 70%)`,
                            borderRadius: '50%',
                            zIndex: '0'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '54px',
                            height: '54px',
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
                                style: { color: stat.color, fontSize: '26px' }
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
                                            fontSize: '32px',
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
                    padding: '16px 10px',
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

    // Timeline view for presentations
    const TimelineView = () => {
        const years = ['2025', '2024', '2023'];
        
        return $({
            tag: 'div',
            att: { className: 'timeline-view' },
            style: {
                display: 'none', // Hidden by default, can be toggled
                padding: '20px',
                backgroundColor: '#2d2d2d',
                borderBottom: '1px solid #444'
            },
            child: years.map(year => {
                return $({
                    tag: 'div',
                    style: {
                        marginBottom: '16px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: '10px',
                                padding: '0 10px'
                            },
                            text: year
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        backgroundColor: '#333',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        border: '1px solid #444',
                                        color: '#aaa',
                                        fontSize: '13px'
                                    },
                                    text: 'No presentations yet'
                                })
                            ]
                        })
                    ]
                });
            })
        });
    };

    // Main table component
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 200px)', // Adjust based on header + stats
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
        att: { className: 'presentation-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/presentationResearch.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    });
};

// Utility functions for presentation research
export const formatPresentationDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
    }).replace(/,/g, '');
};

export const getPresentationTypeColor = (type) => {
    const colors = {
        'international_pitching': '#4caf50',
        'capizState_university_local': '#ff9800',
        'presentation_outside_capsu': '#e91e63',
        'international_conference': '#2196f3',
        'national_conference': '#9c27b0',
        'regional_conference': '#00bcd4'
    };
    return colors[type] || '#aaa';
};

export const getPresentationStats = (data) => {
    // This function will calculate statistics from the data
    // Will be implemented when backend data is available
    return {
        total: 0,
        internationalPitching: 0,
        capizStateUniversity: 0,
        outsideCAPSU: 0
    };
};
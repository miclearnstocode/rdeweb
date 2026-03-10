import { $ } from "../../../lib/lib.js";

export const ProposedResearch = () => {
    let mainTableContainer;
    let tableBody;
    
    // Columns for proposed research (based on the provided header)
    const columns = [
        { field: 'year', header: 'YEAR', width: '70px' },
        { field: 'paperTrailNo', header: 'PAPER TRAIL NO.', width: '100px' },
        { field: 'campus', header: 'CAMPUS/CENTER', width: '120px' },
        { field: 'category', header: 'CATEGORY', width: '120px' },
        { field: 'title', header: 'TITLE', width: '300px' },
        { field: 'authors', header: 'AUTHOR/S', width: '250px' },
        { field: 'facultyResearcher', header: 'FACULTY RESEARCHER', width: '180px' },
        { field: 'academicRank', header: 'Academic Rank', width: '100px' },
        { field: 'nonAcademicRank', header: 'Non-Academic Rank', width: '120px' },
        { field: 'jobOrder', header: 'Job Order', width: '80px' },
        { field: 'dateStarted', header: 'Date Started (MMM-DD-YYYY)', width: '150px' }
    ];

    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    const getTableBody = (el) => {
        tableBody = el;
        
        // Create empty state with proposed research specific message
        const emptyState = $({
            tag: 'div',
            att: { className: 'empty-state' },
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-flask' },
                    style: { 
                        fontSize: '64px', 
                        marginBottom: '20px', 
                        opacity: 0.5,
                        color: 'deepskyblue'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Proposed Research Found',
                    style: { 
                        fontSize: '20px', 
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Research papers presented in in-house review or symposium will appear here',
                    style: { 
                        fontSize: '14px', 
                        opacity: 0.7,
                        maxWidth: '500px',
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        marginTop: '30px',
                        display: 'flex',
                        gap: '15px'
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '10px 24px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                border: '1px solid transparent'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-plus' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add Proposed Research'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Add proposed research clicked');
                                    // Will implement later
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '20px',
                                padding: '10px 24px',
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
                                    att: { className: 'fa-solid fa-upload' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Import Data'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Import data clicked');
                                    // Will implement later
                                }
                            }
                        })
                    ]
                })
            ]
        });
        el.appendChild(emptyState);
    };

    // Filter and search bar
    const FilterBar = () => {
        return $({
            tag: 'div',
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
                        gap: '15px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-lines' },
                                    style: { color: 'deepskyblue', fontSize: '20px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Proposed Research',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: '500',
                                        margin: '0'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '10px',
                                backgroundColor: '#333',
                                padding: '4px',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'All',
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'In-House Review',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Symposium',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
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
                        alignItems: 'center'
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
                                        left: '12px',
                                        color: '#666',
                                        fontSize: '14px'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search proposed research...',
                                        className: 'research-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '20px',
                                        padding: '10px 16px 10px 40px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '250px',
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
                            tag: 'button',
                            att: { className: 'filter-btn' },
                            style: {
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '20px',
                                padding: '10px 16px',
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
                                    att: { className: 'fa-solid fa-filter' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Filter'
                                })
                            ]
                        }),
                        $({
                            tag: 'button',
                            att: { className: 'export-btn' },
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '20px',
                                padding: '10px 16px',
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
            { label: 'Total Proposed', value: '0', icon: 'fa-file-lines', color: 'deepskyblue' },
            { label: 'In-House Review', value: '0', icon: 'fa-users', color: '#ff9800' },
            { label: 'Symposium', value: '0', icon: 'fa-microphone', color: '#4caf50' },
            { label: 'This Year', value: '0', icon: 'fa-calendar', color: '#e91e63' }
        ];

        const statCards = stats.map(stat => {
            return $({
                tag: 'div',
                style: {
                    backgroundColor: '#333',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flex: '1',
                    minWidth: '180px',
                    border: '1px solid #444',
                    transition: 'transform 0.2s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: `${stat.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: `fa-solid ${stat.icon}` },
                                style: { color: stat.color, fontSize: '24px' }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { display: 'flex', flexDirection: 'column' },
                        child: [
                            $({
                                tag: 'span',
                                text: stat.value,
                                style: {
                                    fontSize: '28px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    lineHeight: '1.2'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '13px',
                                    color: '#aaa',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }
                            })
                        ]
                    })
                ]
            });
        });

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444',
                flexWrap: 'wrap'
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
                    padding: '14px 8px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#bbb',
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
                            gap: '6px',
                            cursor: 'pointer'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-sort' },
                                style: { 
                                    fontSize: '10px', 
                                    color: '#666',
                                    opacity: '0.5'
                                }
                            })
                        ]
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

    // Sample loading skeleton rows
    const LoadingSkeleton = () => {
        const skeletonRows = [];
        
        for (let i = 0; i < 5; i++) {
            const cells = columns.map(() => {
                return $({
                    tag: 'td',
                    style: {
                        padding: '16px 8px',
                        borderBottom: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'skeleton-cell' },
                            style: {
                                height: '16px',
                                width: '80%',
                                backgroundColor: '#333',
                                borderRadius: '4px'
                            }
                        })
                    ]
                });
            });

            skeletonRows.push(
                $({
                    tag: 'tr',
                    style: { backgroundColor: '#2a2a2a' },
                    child: cells
                })
            );
        }

        return $({
            tag: 'tbody',
            child: skeletonRows
        });
    };

    // Main table component
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 180px)', // Adjust based on header + stats
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
        att: { className: 'proposed-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/proposedResearch.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    });
};

// Utility functions for later use
export const formatProposedDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
    }).replace(/,/g, '');
};

export const getProposedResearchStats = (data) => {
    // This function will calculate statistics from the data
    // Will be implemented when backend data is available
    return {
        total: 0,
        inHouseReview: 0,
        symposium: 0,
        thisYear: 0
    };
};
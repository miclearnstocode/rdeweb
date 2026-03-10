import { $ } from "../../../lib/lib.js";

export const Utilization = () => {
    let mainTableContainer;
    let tableBody;
    
    // Columns for utilization and extension programs
    const columns = [
        { field: 'programTitle', header: 'Program Title', width: '300px' },
        { field: 'dateConducted', header: 'Date Conducted', width: '150px' },
        { field: 'traineesCount', header: 'No. of Trainees/Beneficiaries', width: '200px' },
        { field: 'supportDocs', header: 'Link to Support Documents', width: '180px' },
        { field: 'beneficiaryType', header: 'Beneficiary Type', width: '180px' },
        { field: 'beneficiarySector', header: 'Industry/Sector', width: '200px' },
        { field: 'beneficiaryName', header: 'Beneficiary/Community', width: '220px' },
        { field: 'programType', header: 'Program Type', width: '150px' },
        { field: 'implementingCampus', header: 'Implementing Campus', width: '150px' },
        { field: 'researchUtilized', header: 'Research Utilized', width: '250px' },
        { field: 'outcome', header: 'Outcome/Impact', width: '250px' },
        { field: 'fundingSource', header: 'Funding Source', width: '180px' }
    ];

    // Beneficiary types
    const beneficiaryTypes = [
        { value: 'industry', label: 'Industry', icon: 'fa-industry', color: '#4caf50' },
        { value: 'community', label: 'Community', icon: 'fa-people-group', color: '#2196f3' },
        { value: 'extension', label: 'Extension', icon: 'fa-hand-holding-heart', color: '#ff9800' },
        { value: 'academic', label: 'Academic', icon: 'fa-school', color: '#9c27b0' },
        { value: 'government', label: 'Government', icon: 'fa-building-flag', color: '#e91e63' },
        { value: 'private', label: 'Private Sector', icon: 'fa-briefcase', color: '#00bcd4' }
    ];

    // Program types
    const programTypes = [
        { value: 'training', label: 'Training', icon: 'fa-chalkboard-user' },
        { value: 'seminar', label: 'Seminar', icon: 'fa-users' },
        { value: 'workshop', label: 'Workshop', icon: 'fa-screwdriver-wrench' },
        { value: 'forum', label: 'Forum', icon: 'fa-comments' },
        { value: 'consultancy', label: 'Consultancy', icon: 'fa-handshake' },
        { value: 'technology_transfer', label: 'Technology Transfer', icon: 'fa-arrow-right-arrow-left' },
        { value: 'extension_service', label: 'Extension Service', icon: 'fa-tree' },
        { value: 'community_outreach', label: 'Community Outreach', icon: 'fa-heart' }
    ];

    // Industry sectors
    const industrySectors = [
        'Agriculture', 'Fisheries', 'Livestock', 'Food Processing',
        'Manufacturing', 'Information Technology'
    ];

    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    const getTableBody = (el) => {
        tableBody = el;
        
        // Create empty state with utilization/extension specific message
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
                        width: '200px',
                        height: '200px',
                        marginBottom: '24px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-hand-holding-heart' },
                            style: { 
                                fontSize: '100px', 
                                color: 'deepskyblue',
                                opacity: 0.2,
                                position: 'absolute',
                                left: '0',
                                top: '20px',
                                transform: 'rotate(-5deg)'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-people-arrows' },
                            style: { 
                                fontSize: '90px', 
                                color: '#4caf50',
                                opacity: 0.2,
                                position: 'absolute',
                                right: '0',
                                bottom: '20px',
                                transform: 'rotate(10deg)'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-seedling' },
                            style: { 
                                fontSize: '70px', 
                                color: '#ff9800',
                                opacity: 0.25,
                                position: 'absolute',
                                left: '20px',
                                bottom: '0',
                                transform: 'rotate(-15deg)'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-building' },
                            style: { 
                                fontSize: '60px', 
                                color: '#e91e63',
                                opacity: 0.2,
                                position: 'absolute',
                                right: '30px',
                                top: '0',
                                transform: 'rotate(20deg)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80px',
                                height: '80px',
                                backgroundColor: 'rgba(0,191,255,0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed deepskyblue',
                                animation: 'pulse 2s infinite'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chart-line' },
                                    style: { fontSize: '30px', color: 'deepskyblue' }
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: 'No Utilization / Extension Programs',
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
                    text: 'Training programs, extension services, technology transfer, and community',
                    style: { 
                        fontSize: '15px', 
                        opacity: 0.7,
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'outreach activities benefiting industry and communities will be displayed here',
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
                        gap: '20px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                borderRadius: '40px',
                                padding: '14px 36px',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 20px rgba(0, 191, 255, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-circle-plus' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add Program'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Add program clicked');
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: '2px solid #444',
                                borderRadius: '40px',
                                padding: '14px 36px',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-cloud-upload-alt' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Import Programs'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Import programs clicked');
                                }
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        marginTop: '30px',
                        display: 'flex',
                        gap: '30px',
                        color: '#666',
                        fontSize: '13px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-industry' }, style: { color: '#4caf50' } }),
                                $({ tag: 'span', text: 'Industry' })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-people-group' }, style: { color: '#2196f3' } }),
                                $({ tag: 'span', text: 'Community' })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-hand-holding-heart' }, style: { color: '#ff9800' } }),
                                $({ tag: 'span', text: 'Extension' })
                            ]
                        })
                    ]
                })
            ]
        });
        el.appendChild(emptyState);
    };

    // Function to create beneficiary type badge
    const createBeneficiaryBadge = (type) => {
        const typeConfig = beneficiaryTypes.find(t => t.value === type) || beneficiaryTypes[0];
        
        return $({
            tag: 'span',
            att: { className: `beneficiary-badge beneficiary-${type}` },
            style: {
                padding: '6px 12px',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: `${typeConfig.color}15`,
                color: typeConfig.color,
                border: `1px solid ${typeConfig.color}30`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${typeConfig.icon}` },
                    style: { fontSize: '12px' }
                }),
                $({
                    tag: 'span',
                    text: typeConfig.label
                })
            ]
        });
    };

    // Function to create program type badge
    const createProgramTypeBadge = (type) => {
        const typeConfig = programTypes.find(t => t.value === type) || programTypes[0];
        
        return $({
            tag: 'span',
            att: { className: `program-type-badge` },
            style: {
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#333',
                color: '#aaa',
                border: '1px solid #444'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${typeConfig.icon}` },
                    style: { fontSize: '10px', color: 'deepskyblue' }
                }),
                $({
                    tag: 'span',
                    text: typeConfig.label
                })
            ]
        });
    };

    // Function to create document link button
    const createDocLink = (url, label = 'View Document') => {
        return $({
            tag: 'a',
            att: {
                href: url || '#',
                target: '_blank',
                className: 'doc-link'
            },
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#333',
                borderRadius: '20px',
                color: 'deepskyblue',
                textDecoration: 'none',
                fontSize: '12px',
                border: '1px solid #444',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-file-pdf' },
                    style: { fontSize: '12px' }
                }),
                $({
                    tag: 'span',
                    text: label
                })
            ],
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#444';
                    e.currentTarget.style.borderColor = 'deepskyblue';
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.borderColor = '#444';
                }
            }
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
                                    att: { className: 'fa-solid fa-hands-helping' },
                                    style: { color: 'deepskyblue', fontSize: '24px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Utilization & Extension',
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
                                    text: '0 programs'
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
                                    text: 'Industry',
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
                                    text: 'Community',
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
                                    text: 'Extension',
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
                                        placeholder: 'Search programs...',
                                        className: 'utilization-search-input'
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
                                className: 'beneficiary-filter'
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
                                minWidth: '160px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Beneficiaries' }),
                                ...beneficiaryTypes.map(type => 
                                    $({ tag: 'option', att: { value: type.value }, text: type.label })
                                )
                            ]
                        }),
                        $({
                            tag: 'select',
                            att: {
                                className: 'sector-filter'
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
                                $({ tag: 'option', att: { value: '' }, text: 'All Sectors' }),
                                ...industrySectors.map(sector => 
                                    $({ tag: 'option', att: { value: sector.toLowerCase().replace(/\s+/g, '_') }, text: sector })
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
                label: 'Total Programs', 
                value: '0', 
                icon: 'fa-calendar-alt',
                color: 'deepskyblue',
                subtext: 'All time'
            },
            { 
                label: 'Total Beneficiaries', 
                value: '0', 
                icon: 'fa-users',
                color: '#4caf50',
                subtext: 'Individuals'
            },
            { 
                label: 'Industry Partners', 
                value: '0', 
                icon: 'fa-industry',
                color: '#ff9800',
                subtext: 'Companies'
            },
            { 
                label: 'Communities Served', 
                value: '0', 
                icon: 'fa-people-group',
                color: '#e91e63',
                subtext: 'Barangays'
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
                                    fontSize: '28px'
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

            if (col.field === 'beneficiaryType') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createBeneficiaryBadge('industry')]
                });
            }

            if (col.field === 'programType') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createProgramTypeBadge('training')]
                });
            }

            if (col.field === 'supportDocs') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createDocLink('#', 'Training Report.pdf')]
                });
            }

            if (col.field === 'programTitle') cellContent = 'Skills Training for Farmers on Modern Agricultural Techniques';
            if (col.field === 'dateConducted') cellContent = 'Mar 15-17, 2025';
            if (col.field === 'traineesCount') cellContent = '45 participants';
            if (col.field === 'beneficiarySector') cellContent = 'Agriculture';
            if (col.field === 'beneficiaryName') cellContent = 'Pilar Farmers Association';
            if (col.field === 'implementingCampus') cellContent = 'Pilar Campus';
            if (col.field === 'researchUtilized') cellContent = 'Organic Farming Technology';
            if (col.field === 'outcome') cellContent = 'Increased crop yield by 30%';
            if (col.field === 'fundingSource') cellContent = 'DA-RFO VI';

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
        att: { className: 'utilization-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/utilization.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    });
};

// Utility functions for utilization/extension
export const formatUtilizationDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
};

export const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '—';
    if (!endDate) return formatUtilizationDate(startDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const getBeneficiaryColor = (type) => {
    const colors = {
        'industry': '#4caf50',
        'community': '#2196f3',
        'extension': '#ff9800',
        'academic': '#9c27b0',
        'government': '#e91e63',
        'private': '#00bcd4'
    };
    return colors[type] || '#9e9e9e';
};

export const getUtilizationStats = (data) => {
    // This function will calculate statistics from the data
    // Will be implemented when backend data is available
    return {
        totalPrograms: 0,
        totalBeneficiaries: 0,
        industryPartners: 0,
        communitiesServed: 0,
        byType: {
            industry: 0,
            community: 0,
            extension: 0,
            academic: 0,
            government: 0,
            private: 0
        }
    };
};
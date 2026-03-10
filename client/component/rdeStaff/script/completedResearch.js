import { $ } from "../../../lib/lib.js";

export const CompletedResearch = () => {
    let mainTableContainer;
    let tableBody;
    
    // Sample header columns based on the Excel structure
    const columns = [
        { field: 'paperTrailNo', header: 'PAPER TRAIL NO.', width: '80px' },
        { field: 'campus', header: 'CAMPUS/CENTER', width: '100px' },
        { field: 'category', header: 'CATEGORY', width: '100px' },
        { field: 'title', header: 'TITLE', width: '250px' },
        { field: 'authors', header: 'AUTHOR/S', width: '200px' },
        { field: 'facultyResearcher', header: 'FACULTY RESEARCHER', width: '150px' },
        { field: 'academicRank', header: 'Academic Rank', width: '80px' },
        { field: 'nonAcademicRank', header: 'Non-Academic Rank', width: '100px' },
        { field: 'jobOrder', header: 'Job Order', width: '60px' },
        { field: 'dateStarted', header: 'Date Started (MMM-DD-YYYY)', width: '130px' },
        { field: 'dateCompleted', header: 'Date of Completion (MMM-DD-YYYY)', width: '140px' },
        { field: 'forumTitle', header: 'Title of Forum', width: '150px' },
        { field: 'venue', header: 'Venue', width: '120px' },
        { field: 'forumType', header: 'Forum Type', width: '100px' },
        { field: 'presentationDate', header: 'Date of Presentation', width: '120px' },
        { field: 'publishedTitle', header: 'Published Title', width: '150px' },
        { field: 'publicationDate', header: 'Date of Publication', width: '120px' },
        { field: 'journalTitle', header: 'Title of Journal / Publication', width: '180px' },
        { field: 'volumeIssue', header: 'Volume & Issue', width: '90px' },
        { field: 'issn', header: 'ISSN / ISBN', width: '100px' },
        { field: 'index', header: 'Index', width: '80px' },
        { field: 'productName', header: 'Product Name / Methods / Process / Technology', width: '200px' },
        { field: 'patentNumber', header: 'Patent Number / Product Description', width: '180px' },
        { field: 'benefitingIndustry', header: 'Benefiting Industry / Community', width: '160px' },
        { field: 'supportDocs1', header: 'Link to Support Documents', width: '120px' },
        { field: 'programTitle', header: 'Program Title', width: '150px' },
        { field: 'dateConducted', header: 'Date Conducted', width: '120px' },
        { field: 'traineesCount', header: 'No. of Trainees/Beneficiaries', width: '140px' },
        { field: 'supportDocs2', header: 'Link to Support Documents', width: '120px' }
    ];

    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    const getTableBody = (el) => {
        tableBody = el;
        // Add empty state message
        const emptyState = $({
            tag: 'div',
            att: { className: 'empty-state' },
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-folder-open' },
                    style: { fontSize: '48px', marginBottom: '16px', opacity: 0.5 }
                }),
                $({
                    tag: 'div',
                    text: 'No completed research records found',
                    style: { fontSize: '16px', marginBottom: '8px' }
                }),
                $({
                    tag: 'div',
                    text: 'Completed research projects will appear here',
                    style: { fontSize: '14px', opacity: 0.7 }
                })
            ]
        });
        el.appendChild(emptyState);
    };

    // Search and filter functionality
    const SearchBar = () => {
        const searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                placeholder: 'Search research...',
                className: 'research-search-input'
            },
            style: {
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid #444',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '14px',
                width: '250px',
                outline: 'none',
                transition: 'all 0.3s ease'
            },
            event: {
                type: 'input',
                method: (e) => {
                    // Search functionality will be implemented when data is available
                    console.log('Searching:', e.target.value);
                }
            }
        });

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
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
                            att: { className: 'fa-solid fa-table' },
                            style: { color: 'deepskyblue', fontSize: '20px' }
                        }),
                        $({
                            tag: 'h2',
                            text: 'Completed Research',
                            style: {
                                color: '#fff',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '20px',
                                fontWeight: '500',
                                margin: '0'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'research-count' },
                            style: {
                                backgroundColor: '#444',
                                color: '#ddd',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            },
                            text: '0 records'
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px' },
                    child: [
                        searchInput,
                        $({
                            tag: 'button',
                            att: { className: 'export-btn' },
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '20px',
                                padding: '8px 16px',
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
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    console.log('Export clicked');
                                }
                            }
                        })
                    ]
                })
            ]
        });
    };

    // Table header with column names
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '12px 8px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#bbb',
                    backgroundColor: '#333',
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
                        style: { display: 'flex', alignItems: 'center', gap: '4px' },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
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
                    style: { backgroundColor: '#333' },
                    child: headerCells
                })
            ]
        });
    };

    // Sample row for demonstration (will be replaced with actual data)
    const SampleRow = () => {
        const cells = columns.map((col, index) => {
            let cellContent = '';
            
            // Sample data based on column
            if (index === 0) cellContent = '2025';
            else if (index === 1) cellContent = 'Pilar';
            else if (index === 2) cellContent = 'Social Science';
            else if (index === 3) cellContent = 'Sample Research Title';
            else cellContent = '—';

            return $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#ddd',
                    borderBottom: '1px solid #444',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Segoe UI, sans-serif'
                },
                text: cellContent
            });
        });

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#2d2d2d',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#3a3a3a';
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
                height: 'calc(100% - 73px)', // Subtract header height
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
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/completedResearch.css',
        elementHandler: getMainContainer,
        child: [
            SearchBar(),
            DataTable()
        ]
    });
};

// Export utility functions for later use
export const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
    }).replace(/,/g, '');
};

export const renderResearchRow = (data) => {
    // This function will be used to render actual data rows
    // Will be implemented when backend data is available
    return null;
};
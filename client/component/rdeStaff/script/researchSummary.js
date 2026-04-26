import { $ } from "../../../lib/lib.js";

export const Summary = () => {
    let mainTableContainer;
    let tableBody;
    let researchData = [];
    let filteredData = [];
    let isLoading = false;
    let stats = {
        total: 0,
        patents: 0,
        utilityModels: 0,
        copyrights: 0,
        extensionServices: 0
    };

    // Filter state
    let filters = {
        utilizationType: 'All',
        search: ''
    };

    // Index types with their colors (matched with publication module)
    const indexTypes = [
        { value: 'refereed', label: 'Refereed', color: '#ffffff', bgColor: '#2a2a2a' },
        { value: 'scopus', label: 'Scopus', color: '#000000', bgColor: '#ffd700' },
        { value: 'wos', label: 'WOS', color: '#ffffff', bgColor: '#4caf50' }
    ];

    // Header columns based on structure provided by user
    const columns = [
        { field: 'paperTrailNo', header: 'PAPER TRAIL NO.', width: '80px' },
        { field: 'campus', header: 'CAMPUS/CENTER', width: '100px' },
        { field: 'category', header: 'CATEGORY', width: '150px' },
        { field: 'title', header: 'TITLE', width: '200px' },
        { field: 'authors', header: 'AUTHOR/S', width: '200px' },
        { field: 'facultyResearcher', header: 'FACULTY RESEARCHER', width: '200px' },
        { field: 'academicRank', header: 'Academic Rank', width: '150px' },
        { field: 'nonAcademicRank', header: 'Non-Academic Rank', width: '150px' },
        { field: 'jobOrder', header: 'Job Order', width: '100px' },
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
        { field: 'index', header: 'Index', width: '100px' },
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
        fetchData();
    };

    const getTableBody = (el) => {
        tableBody = el;
    };

    const fetchData = async () => {
        if (isLoading) return;
        isLoading = true;

        try {
            const formData = new FormData();
            formData.append('action', 'fetch');

            if (filters.utilizationType !== 'All') {
                formData.append('utilization_type', filters.utilizationType);
            }
            if (filters.search) {
                formData.append('search', filters.search);
            }

            const response = await fetch('/summary', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status) {
                researchData = result.data || [];
                filteredData = [...researchData];
                if (result.stats) {
                    stats = result.stats;
                    updateStatsUI();
                }
                renderTable();

                const countEl = document.querySelector('.research-count');
                if (countEl) countEl.textContent = `${researchData.length} records`;
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            isLoading = false;
        }
    };

    const renderTable = () => {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (filteredData.length === 0) {
            showEmptyState(tableBody);
            return;
        }

        filteredData.forEach(item => {
            const row = renderResearchRow(item);
            if (row) tableBody.appendChild(row);
        });
    };

    const updateStatsUI = () => {
        if (!mainTableContainer) return;
        const statsContainer = mainTableContainer.querySelector('.stats-row-container');
        if (statsContainer) {
            const newStatsRow = StatsRow();
            statsContainer.replaceWith(newStatsRow);
        }
    };

    const StatsRow = () => {
        const createStatCard = (title, value, icon, color) => {
            return $({
                tag: 'div',
                style: {
                    flex: '1', minWidth: '200px', backgroundColor: '#333',
                    borderRadius: '16px', padding: '20px', display: 'flex',
                    flexDirection: 'column', gap: '12px', border: '1px solid #444',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                        child: [
                            $({ tag: 'span', text: title, style: { color: '#aaa', fontSize: '13px', fontWeight: '500' } }),
                            $({ tag: 'span', att: { className: `fa-solid ${icon}` }, style: { color: color, fontSize: '18px' } })
                        ]
                    }),
                    $({
                        tag: 'div',
                        text: value.toString(),
                        style: { color: '#fff', fontSize: '28px', fontWeight: '700', fontFamily: 'Segoe UI, sans-serif' }
                    })
                ]
            });
        };

        return $({
            tag: 'div',
            att: { className: 'stats-row-container' },
            style: {
                display: 'flex', gap: '20px', padding: '24px',
                backgroundColor: '#2a2a2a', overflowX: 'auto',
                borderBottom: '1px solid #444'
            },
            child: [
                createStatCard('Total Research', researchData.length, 'fa-book', '#00bcd4'),
                createStatCard('Patents', stats.patents, 'fa-file-invoice', '#ff9800'),
                createStatCard('Utility Models', stats.utilityModels, 'fa-cogs', '#e91e63'),
                createStatCard('Copyrights', stats.copyrights, 'fa-copyright', '#9c27b0'),
                createStatCard('Extension Services', stats.extensionServices, 'fa-hand-holding-heart', '#4caf50')
            ]
        });
    };

    const showEmptyState = (el) => {
        const emptyState = $({
            tag: 'div',
            att: { className: 'empty-state' },
            style: {
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '200px', width: '100%',
                color: '#888', fontFamily: 'Segoe UI, sans-serif'
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
                })
            ]
        });
        el.appendChild(emptyState);
    };

    const SearchBar = () => {
        const searchInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Search research...', className: 'research-search-input' },
            style: {
                backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid #444',
                borderRadius: '20px', padding: '8px 16px', color: '#fff',
                fontSize: '14px', width: '250px', outline: 'none', transition: 'all 0.3s ease'
            },
            event: {
                type: 'input',
                method: (e) => {
                    const term = e.target.value.toLowerCase();
                    filteredData = researchData.filter(item =>
                        item.title?.toLowerCase().includes(term) ||
                        item.authors?.toLowerCase().includes(term) ||
                        item.paperTrailNo?.toLowerCase().includes(term)
                    );
                    renderTable();
                }
            }
        });

        const filterSelectStyle = {
            backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid #444',
            borderRadius: '20px', padding: '8px 16px', color: '#afafafff',
            fontSize: '13px', outline: 'none', cursor: 'pointer',
            transition: 'all 0.3s ease', appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px',
            paddingRight: '36px'
        };

        const utilizationFilter = $({
            tag: 'select',
            style: filterSelectStyle,
            child: [
                $({ tag: 'option', att: { value: 'All' }, text: 'All Utilization Types' }),
                $({ tag: 'option', att: { value: 'Patent' }, text: 'Patent' }),
                $({ tag: 'option', att: { value: 'Copyright' }, text: 'Copyright' }),
                $({ tag: 'option', att: { value: 'UM' }, text: 'Utility Models (UM)' }),
                $({ tag: 'option', att: { value: 'Extension Services' }, text: 'Extension Services' })
            ],
            event: {
                type: 'change',
                method: (e) => {
                    filters.utilizationType = e.target.value;
                    fetchData();
                }
            }
        });

        return $({
            tag: 'div',
            style: {
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 24px', backgroundColor: '#2a2a2a', borderBottom: '1px solid #444'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    child: [
                        $({ tag: 'span', att: { className: 'fa-solid fa-chart-line' }, style: { color: '#4caf50', fontSize: '20px' } }),
                        $({ tag: 'h2', text: 'Overall Research Summary', style: { color: '#fff', fontSize: '20px', fontWeight: '500', margin: '0' } }),
                        $({ tag: 'span', att: { className: 'research-count' }, style: { backgroundColor: '#444', color: '#ddd', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }, text: '0 records' })
                    ]
                }),
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', alignItems: 'center' },
                    child: [
                        utilizationFilter,
                        searchInput
                    ]
                })
            ]
        });
    };

    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600',
                    color: '#bbb', backgroundColor: '#333', borderBottom: '2px solid #444',
                    whiteSpace: 'nowrap', minWidth: col.width, position: 'sticky', top: '0', zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px'
                },
                child: [$({ tag: 'span', text: col.header })]
            });
        });

        return $({ tag: 'thead', child: [$({ tag: 'tr', style: { backgroundColor: '#333' }, child: headerCells })] });
    };

    const createIndexBadge = (indexType) => {
        const val = indexType ? indexType.trim().toLowerCase() : '';
        if (val === '—' || !val) return '—';

        const indexConfig = indexTypes.find(i => i.value === val) || {
            label: indexType,
            bgColor: '#2d2d2d',
            color: '#ffffff'
        };

        return $({
            tag: 'span',
            style: {
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                display: 'inline-block',
                backgroundColor: indexConfig.bgColor,
                color: indexConfig.color,
                border: !indexTypes.some(i => i.value === val) ? '1px solid #444' : 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            text: indexConfig.label
        });
    };

    const openFileViewer = (url, label) => {
        const isImage = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(url) || (url.includes('googleusercontent') && !url.endsWith('.pdf'));
        const overlay = $({
            tag: 'div',
            att: { className: 'completed-research-file-viewer' },
            style: {
                position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.88)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '9999', padding: '20px'
            },
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target === overlay) document.body.removeChild(overlay);
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '90vw', maxWidth: '1040px', minWidth: '720px', maxHeight: '80vh', minHeight: '660px', height: 'auto', backgroundColor: '#111',
                        border: '1px solid #333', borderRadius: '16px', overflow: 'hidden', display: 'flex',
                        flexDirection: 'column', boxSizing: 'border-box'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 18px', backgroundColor: '#171717', borderBottom: '1px solid #333'
                            },
                            child: [
                                $({ tag: 'div', text: label, style: { color: '#fff', fontSize: '14px', fontWeight: '600' } }),
                                $({
                                    tag: 'button',
                                    text: 'Close',
                                    style: {
                                        backgroundColor: 'transparent', border: '1px solid #444',
                                        borderRadius: '12px', color: '#ddd', padding: '8px 14px', cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => document.body.removeChild(overlay)
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { flex: '1 1 auto', minHeight: '520px', height: 'calc(80vh - 72px)', overflow: 'hidden', backgroundColor: '#000' },
                            child: isImage ? [
                                $({
                                    tag: 'img',
                                    att: { src: url, alt: label },
                                    style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }
                                })
                            ] : [
                                $({
                                    tag: 'iframe',
                                    att: { src: url, title: label, frameborder: '0', allowfullscreen: 'true' },
                                    style: { width: '100%', height: '100%', border: 'none' }
                                })
                            ]
                        })
                    ]
                })]
        });
        document.body.appendChild(overlay);
    };

    const renderResearchRow = (data) => {
        const cells = columns.map(col => {
            const multiLineFields = ['authors', 'facultyResearcher', 'academicRank', 'nonAcademicRank', 'jobOrder', 'benefitingIndustry'];
            let content;

            const rawValue = data[col.field];

            const isWrappingField = ['title', 'publishedTitle', 'journalTitle', 'programTitle', 'supportDocs1', 'supportDocs2', 'campus', 'forumTitle', 'venue'].includes(col.field);
            const isUrlField = ['supportDocs1', 'supportDocs2'].includes(col.field);

            if (isUrlField && rawValue && rawValue !== '—') {
                let items = [];
                try {
                    if (Array.isArray(rawValue)) {
                        items = rawValue;
                    } else if (typeof rawValue === 'object' && rawValue !== null) {
                        items = rawValue;
                    } else if (typeof rawValue === 'string' && (rawValue.trim().startsWith('[') || rawValue.trim().startsWith('{'))) {
                        items = JSON.parse(rawValue);
                    } else if (typeof rawValue === 'string') {
                        items = rawValue.split(', ').map(url => ({ name: url, url: url }));
                    }
                } catch (e) {
                    if (typeof rawValue === 'string') {
                        items = rawValue.split(', ').map(url => ({ name: url, url: url }));
                    }
                }

                content = $({
                    tag: 'div',
                    style: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 0' },
                    child: items.map(item => $({
                        tag: 'button',
                        att: { type: 'button', title: item.name },
                        style: {
                            width: '36px', height: '36px', display: 'inline-flex', alignItems: 'center',
                            justifyContent: 'center', color: '#00bcd4', backgroundColor: 'rgba(0,188,212,0.08)',
                            border: '1px solid rgba(0,188,212,0.2)', borderRadius: '50%', cursor: 'pointer',
                            padding: '0', transition: 'transform 0.15s ease'
                        },
                        child: [$({ tag: 'span', att: { className: 'fa-solid fa-file-lines' }, style: { color: '#00bcd4', fontSize: '16px' } })],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.preventDefault();
                                openFileViewer(item.url, item.name);
                            }
                        },
                        event2: {
                            type: 'mouseenter',
                            method: (e) => e.currentTarget.style.transform = 'scale(1.05)'
                        },
                        event3: {
                            type: 'mouseleave',
                            method: (e) => e.currentTarget.style.transform = 'scale(1)'
                        }
                    }))
                });
            } else if (col.field === 'index') {
                content = createIndexBadge(rawValue);
            } else if (multiLineFields.includes(col.field) && rawValue && rawValue !== '—') {
                const values = rawValue.split('|');
                content = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                    },
                    child: values.map(val => $({
                        tag: 'span',
                        style: {
                            display: 'block',
                            whiteSpace: 'nowrap',
                            padding: '1px 0'
                        },
                        text: val || '—'
                    }))
                });
            } else {
                content = (rawValue === '—' || !rawValue) ? '—' : rawValue;
            }

            return $({
                tag: 'td',
                style: {
                    padding: '12px 8px', fontSize: '13px', color: '#ddd',
                    borderBottom: '1px solid #444',
                    whiteSpace: isWrappingField ? 'normal' : 'nowrap',
                    wordBreak: isUrlField ? 'break-all' : (isWrappingField ? 'break-word' : 'normal'),
                    fontFamily: 'Segoe UI, sans-serif', verticalAlign: 'top',
                    maxWidth: col.width
                },
                child: typeof content === 'object' ? [content] : [],
                text: typeof content === 'string' ? content : ''
            });
        });

        return $({
            tag: 'tr',
            style: { cursor: 'pointer' },
            child: cells
        });
    };

    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%', height: 'calc(100% - 73px)', overflow: 'auto',
                backgroundColor: '#2a2a2a', position: 'relative'
            },
            child: [
                $({
                    tag: 'table',
                    style: { width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: 'max-content' },
                    child: [TableHeader(), $({ tag: 'tbody', elementHandler: getTableBody })]
                })
            ]
        });
    };

    return $({
        tag: 'div',
        style: { width: '100%', height: '100%', backgroundColor: '#2a2a2a', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        elementHandler: getMainContainer,
        child: [SearchBar(), StatsRow(), DataTable()]
    });
};
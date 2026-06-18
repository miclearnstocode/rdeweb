import { $ } from "../../../lib/lib.js";

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const CompletedResearch = () => {
    let mainTableContainer;
    let tableBody;
    let researchData = [];
    let filteredData = [];
    let isLoading = false;

    // Filter state
    let filters = {
        event_id: 'All',
        center: 'All',
        campus: 'All',
        category: 'All',
        search: ''
    };

    let filterOptions = {
        events: [],
        centers: [],
        campuses: [],
        categories: []
    };

    // Index types with their colors
    const indexTypes = [
        { value: 'refereed', label: 'Refereed', color: '#ffffff', bgColor: '#2a2a2a' },
        { value: 'scopus', label: 'Scopus', color: '#000000', bgColor: '#ffd700' },
        { value: 'wos', label: 'WOS', color: '#ffffff', bgColor: '#4caf50' }
    ];

    const campusOptions = [
        'Roxas City Main',
        'Pilar',
        'Pontevedra',
        'Sigma',
        'Mambusao',
        'Burias',
        'Tapaz',
        'Dayao',
        'Dumarao'
    ];

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

            if (filters.event_id !== 'All') formData.append('event_id', filters.event_id);
            if (filters.center !== 'All') formData.append('center', filters.center);
            if (filters.campus !== 'All') formData.append('campus', filters.campus);
            if (filters.category !== 'All') formData.append('category', filters.category);
            if (filters.search) formData.append('search', filters.search);

            const response = await fetch('/completeresearch', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status) {
                researchData = result.data || [];
                filteredData = [...researchData];

                if (result.filters) {
                    filterOptions = result.filters;
                    updateFilterDropdowns();
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

    const updateFilterDropdowns = () => {
        if (!mainTableContainer) return;

        const eventSelect = mainTableContainer.querySelector('.event-filter-select');
        const centerSelect = mainTableContainer.querySelector('.center-filter-select');
        const campusSelect = mainTableContainer.querySelector('.campus-filter-select');
        const categorySelect = mainTableContainer.querySelector('.category-filter-select');

        if (eventSelect && filterOptions.events.length > 0 && eventSelect.options.length <= 1) {
            filterOptions.events.forEach(ev => {
                const opt = document.createElement('option');
                opt.value = ev.id || ev.name;
                opt.text = ev.name;
                eventSelect.appendChild(opt);
            });
        }

        if (centerSelect && filterOptions.centers.length > 0 && centerSelect.options.length <= 1) {
            filterOptions.centers.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.text = c;
                centerSelect.appendChild(opt);
            });
        }

        if (categorySelect && filterOptions.categories.length > 0 && categorySelect.options.length <= 1) {
            filterOptions.categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.text = c;
                categorySelect.appendChild(opt);
            });
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

    const showEmptyState = (el) => {
        const emptyState = $({
            tag: 'tr',
            style: { backgroundColor: '#ffffff' },
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: {
                        padding: '60px 20px',
                        border: 'none',
                        backgroundColor: '#ffffff'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'empty-state' },
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '200px',
                                width: '100%',
                                color: '#6c757d',
                                fontFamily: 'Segoe UI, sans-serif'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-folder-open' },
                                    style: {
                                        fontSize: '48px',
                                        marginBottom: '16px',
                                        opacity: 0.3,
                                        color: '#0d6efd'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No completed research records found',
                                    style: {
                                        fontSize: '18px',
                                        marginBottom: '8px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Adjust your filters or try a different search term',
                                    style: {
                                        fontSize: '14px',
                                        color: '#6c757d'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        });
        el.appendChild(emptyState);
    };

    const SearchBar = () => {
        const filterSelectStyle = {
            backgroundColor: '#ffffff',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#212529',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        };

        const searchInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Search for research title', className: 'research-search-input' },
            style: {
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#212529',
                fontSize: '14px',
                width: '250px',
                outline: 'none',
                transition: 'all 0.3s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.target.style.borderColor = '#0d6efd';
                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)';
                }
            },
            event2: {
                type: 'blur',
                method: (e) => {
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.boxShadow = 'none';
                }
            },
            event3: {
                type: 'input',
                method: debounce((e) => {
                    filters.search = e.target.value;
                    fetchData();
                }, 400)
            }
        });

        const eventFilter = $({
            tag: 'select',
            att: { className: 'event-filter-select' },
            style: filterSelectStyle,
            child: [$({ tag: 'option', att: { value: 'All' }, text: 'All Events' })],
            event: {
                type: 'change',
                method: (e) => {
                    filters.event_id = e.target.value;
                    fetchData();
                }
            }
        });

        const centerFilter = $({
            tag: 'select',
            att: { className: 'center-filter-select' },
            style: { ...filterSelectStyle, maxWidth: '180px' },
            child: [$({ tag: 'option', att: { value: 'All' }, text: 'All Centers' })],
            event: {
                type: 'change',
                method: (e) => {
                    filters.center = e.target.value;
                    fetchData();
                }
            }
        });

        const campusFilter = $({
            tag: 'select',
            att: { className: 'campus-filter-select' },
            style: filterSelectStyle,
            child: [
                $({ tag: 'option', att: { value: 'All' }, text: 'All Campuses' }),
                ...campusOptions.map(c => $({ tag: 'option', att: { value: c }, text: c }))
            ],
            event: {
                type: 'change',
                method: (e) => {
                    filters.campus = e.target.value;
                    fetchData();
                }
            }
        });

        const categoryFilter = $({
            tag: 'select',
            att: { className: 'category-filter-select' },
            style: filterSelectStyle,
            child: [$({ tag: 'option', att: { value: 'All' }, text: 'All Categories' })],
            event: {
                type: 'change',
                method: (e) => {
                    filters.category = e.target.value;
                    fetchData();
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
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
                flexWrap: 'wrap',
                gap: '12px'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-table' },
                            style: { color: '#0d6efd', fontSize: '20px' }
                        }),
                        $({
                            tag: 'h2',
                            text: 'Completed Research',
                            style: {
                                color: '#212529',
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'research-count' },
                            style: {
                                backgroundColor: '#f1f3f5',
                                color: '#6c757d',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                border: '1px solid #dee2e6'
                            },
                            text: '0 records'
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    },
                    child: [
                        eventFilter,
                        centerFilter,
                        campusFilter,
                        categoryFilter,
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
                    padding: '12px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#495057',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6',
                    whiteSpace: 'nowrap',
                    minWidth: col.width,
                    position: 'sticky',
                    top: '0',
                    zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                },
                child: [$({ tag: 'span', text: col.header })]
            });
        });

        return $({
            tag: 'thead',
            child: [$({
                tag: 'tr',
                style: { backgroundColor: '#f8f9fa' },
                child: headerCells
            })]
        });
    };

    const createIndexBadge = (indexType) => {
        const val = indexType ? indexType.trim().toLowerCase() : '';
        if (val === '—' || !val) return '—';

        const indexConfig = indexTypes.find(i => i.value === val) || {
            label: indexType,
            bgColor: '#e9ecef',
            color: '#212529'
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
                border: !indexTypes.some(i => i.value === val) ? '1px solid #dee2e6' : 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '9999', padding: '20px',
                backdropFilter: 'blur(4px)'
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
                        width: '90vw', maxWidth: '1040px', minWidth: '720px', maxHeight: '80vh', minHeight: '660px', height: 'auto',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e9ecef', borderRadius: '16px', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 18px', backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #e9ecef'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: label,
                                    style: {
                                        color: '#212529',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Close',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        color: '#6c757d',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => document.body.removeChild(overlay)
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                            e.target.style.borderColor = '#0d6efd';
                                            e.target.style.color = '#212529';
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.borderColor = '#dee2e6';
                                            e.target.style.color = '#6c757d';
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                flex: '1 1 auto',
                                minHeight: '520px',
                                height: 'calc(80vh - 72px)',
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa'
                            },
                            child: isImage ? [
                                $({
                                    tag: 'img',
                                    att: { src: url, alt: label },
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }
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
                            justifyContent: 'center', color: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.08)',
                            border: '1px solid rgba(13,110,253,0.2)', borderRadius: '50%', cursor: 'pointer',
                            padding: '0', transition: 'all 0.2s ease'
                        },
                        child: [$({
                            tag: 'span',
                            att: { className: 'fa-solid fa-file-lines' },
                            style: { color: '#0d6efd', fontSize: '16px' }
                        })],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.preventDefault();
                                openFileViewer(item.url, item.name);
                            }
                        },
                        event2: {
                            type: 'mouseenter',
                            method: (e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(13,110,253,0.15)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }
                        },
                        event3: {
                            type: 'mouseleave',
                            method: (e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(13,110,253,0.08)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }
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
                            padding: '1px 0',
                            color: '#212529'
                        },
                        text: val || '—'
                    }))
                });
            } else {
                content = (rawValue === '—' || !rawValue) ? '—' : rawValue;
            }

            const cellStyle = {
                padding: '12px 8px',
                fontSize: '13px',
                color: '#212529',
                borderBottom: '1px solid #f1f3f5',
                whiteSpace: isWrappingField ? 'normal' : 'nowrap',
                wordBreak: isUrlField ? 'break-all' : (isWrappingField ? 'break-word' : 'normal'),
                fontFamily: 'Segoe UI, sans-serif',
                verticalAlign: 'top',
                maxWidth: col.width,
                backgroundColor: '#ffffff'
            };

            return $({
                tag: 'td',
                style: cellStyle,
                child: typeof content === 'object' ? [content] : [],
                text: typeof content === 'string' ? content : ''
            });
        });

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#ffffff',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                }
            }
        });
    };

    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 73px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
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
                    child: [TableHeader(), $({ tag: 'tbody', elementHandler: getTableBody })]
                })
            ]
        });
    };

    return $({
        tag: 'div',
        att: { className: 'completed-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        elementHandler: getMainContainer,
        child: [SearchBar(), DataTable()]
    });
};
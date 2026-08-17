import { $, CustomModal, SearchMethod, ConfirmationModal, ConfirmationAlert, showToast, Toast} from "../../../lib/lib.js";

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate last 10 years
    for (let i = currentYear; i >= currentYear - 10; i--) {
        years.push(i);
    }
    return years;
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

            // Only send non-search filters to server
            if (filters.event_id !== 'All') formData.append('event_id', filters.event_id);
            if (filters.center !== 'All') formData.append('center', filters.center);
            if (filters.campus !== 'All') formData.append('campus', filters.campus);
            if (filters.category !== 'All') formData.append('category', filters.category);
            // Don't send search to server anymore - we'll handle it client-side

            const response = await fetch('/completeresearch', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status) {
                researchData = result.data || [];
                
                if (result.filters) {
                    filterOptions = result.filters;
                    updateFilterDropdowns();
                }
                
                // Apply client-side filtering
                applyFilters();

                const countEl = document.querySelector('.research-count');
                if (countEl) countEl.textContent = `${researchData.length} records`;
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            isLoading = false;
        }
    };

    // Client-side filtering function
    const applyFilters = () => {
        let data = [...researchData];

        // Apply search filter (client-side)
        if (filters.search && filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            data = data.filter(item => {
                // Search across multiple fields
                const searchableFields = [
                    'title', 'authors', 'facultyResearcher', 'campus', 
                    'category', 'paperTrailNo', 'journalTitle', 'programTitle',
                    'forumTitle', 'venue', 'productName', 'patentNumber',
                    'benefitingIndustry', 'publishedTitle', 'issn'
                ];
                
                return searchableFields.some(field => {
                    const value = item[field];
                    if (!value) return false;
                    return String(value).toLowerCase().includes(searchTerm);
                });
            });
        }

        filteredData = data;
        renderTable();
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
                                    text: filters.search ? `No results matching "${filters.search}"` : 'Adjust your filters or try a different search term',
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

        // Create debounced version of applyFilters
        const debouncedApplyFilters = debounce(() => {
            applyFilters();
        }, 300);

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
                width: '400px',
                outline: 'none',
                transition: 'all 0.3s ease'
            },
            event: {
                type: 'input',
                method: (e) => {
                    filters.search = e.target.value;
                    debouncedApplyFilters();
                }
            },
            event2: {
                type: 'focus',
                method: (e) => {
                    e.target.style.borderColor = '#0d6efd';
                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)';
                }
            },
            event3: {
                type: 'blur',
                method: (e) => {
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.boxShadow = 'none';
                }
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
            style: { ...filterSelectStyle, maxWidth: '200px' },
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
            att: { className: 'campus-filter-select', maxWidth: '200px' },
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
            att: { className: 'category-filter-select', maxWidth: '200px' },
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

        const confirmButton = $({
            tag: 'button',
            att: { className: 'confirm-research-btn' },
            style: {
                padding: '8px 20px',
                backgroundColor: '#0d6efd',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-check-circle' },
                    style: { fontSize: '14px' }
                }),
                $({
                    tag: 'span',
                    text: 'Confirm Research'
                })
            ],
            event: {
                type: 'click',
                method: showConfirmationModal
            },
            event2: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#0b5ed7';
                    e.currentTarget.style.transform = 'scale(1.02)';
                }
            },
            event3: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#0d6efd';
                    e.currentTarget.style.transform = 'scale(1)';
                }
            }
        });

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
                gap: '12px'
            },
            child: [
                // Top row - Title and records count
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
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
                        })
                    ]
                }),
                // Instructions - Below title and above filters
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-circle-info' },
                            style: {
                                color: '#0d6efd',
                                fontSize: '16px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Confirmation of Research Paper here to mark a paper as completed. Search and filter to find specific research papers.',
                            style: {
                                color: '#495057',
                                fontSize: '13px',
                                lineHeight: '1.5'
                            }
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
                        searchInput,
                        confirmButton,
                        exportButton
                    ]
                })
            ]
        });
    };

    const showExportModal = () => {
        const currentYear = new Date().getFullYear();
        const defaultStartYear = currentYear - 3;
        
        // Get available years for dropdowns
        const availableYears = getAvailableYears();
        
        const exportModalContent = $({
            tag: 'div',
            style: {
                padding: '20px',
                fontFamily: 'Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        marginBottom: '20px',
                        padding: '12px 16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef',
                        fontSize: '13px',
                        color: '#495057'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-circle-info' },
                            style: { color: '#0d6efd', marginRight: '8px' }
                        }),
                        $({
                            tag: 'span',
                            text: 'Select the year range for the export. Only symposium events will be included.'
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        marginBottom: '20px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'Start Year',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#212529'
                                    }
                                }),
                                $({
                                    tag: 'select',
                                    att: { id: 'export-start-year', className: 'export-year-select' },
                                    style: {
                                        padding: '10px 12px',
                                        border: '2px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#212529',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: availableYears.map(year => 
                                        $({
                                            tag: 'option',
                                            att: { value: year, selected: year === defaultStartYear },
                                            text: year.toString()
                                        })
                                    ),
                                    event: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.target.style.borderColor = '#0d6efd';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                                        }
                                    },
                                    event2: {
                                        type: 'blur',
                                        method: (e) => {
                                            e.target.style.borderColor = '#dee2e6';
                                            e.target.style.boxShadow = 'none';
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'End Year',
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#212529'
                                    }
                                }),
                                $({
                                    tag: 'select',
                                    att: { id: 'export-end-year', className: 'export-year-select' },
                                    style: {
                                        padding: '10px 12px',
                                        border: '2px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#212529',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: availableYears.map(year => 
                                        $({
                                            tag: 'option',
                                            att: { value: year, selected: year === currentYear },
                                            text: year.toString()
                                        })
                                    ),
                                    event: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.target.style.borderColor = '#0d6efd';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                                        }
                                    },
                                    event2: {
                                        type: 'blur',
                                        method: (e) => {
                                            e.target.style.borderColor = '#dee2e6';
                                            e.target.style.boxShadow = 'none';
                                        }
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
                        justifyContent: 'flex-end',
                        gap: '10px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e9ecef'
                    },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Cancel',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    const modal = document.querySelector('[data-modal-id="export-modal"]');
                                    if (modal) {
                                        modal.style.opacity = '0';
                                        modal.style.transform = 'scale(0.98)';
                                        setTimeout(() => {
                                            if (modal.parentNode) modal.parentNode.removeChild(modal);
                                        }, 250);
                                    }
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: 'Export',
                            style: {
                                padding: '10px 32px',
                                backgroundColor: '#198754',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-excel' }
                                }),
                                $({ tag: 'span', text: 'Export Excel' })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    const startYearSelect = document.getElementById('export-start-year');
                                    const endYearSelect = document.getElementById('export-end-year');
                                    
                                    if (startYearSelect && endYearSelect) {
                                        const startYear = parseInt(startYearSelect.value);
                                        const endYear = parseInt(endYearSelect.value);
                                        
                                        if (startYear > endYear) {
                                            alert('Start year must be less than or equal to end year');
                                            return;
                                        }
                                        
                                        // Close modal
                                        const modal = document.querySelector('[data-modal-id="export-modal"]');
                                        if (modal) {
                                            modal.style.opacity = '0';
                                            modal.style.transform = 'scale(0.98)';
                                            setTimeout(() => {
                                                if (modal.parentNode) modal.parentNode.removeChild(modal);
                                            }, 250);
                                        }
                                        
                                        // Trigger export
                                        handleExportWithRange(startYear, endYear);
                                    }
                                }
                            }
                        })
                    ]
                })
            ]
        });
        
        // Create modal
        const exportModal = CustomModal({
            title: '📊 Export Completed Research by Year Range',
            content: exportModalContent,
            size: 'medium',
            showClose: true
        });
        
        // Add data attribute for identification
        if (exportModal && exportModal.element) {
            exportModal.element.dataset.modalId = 'export-modal';
        }
    };

    const downloadExcelWithFormatting = (data, filename) => {
        if (!data || data.length === 0) {
            if (typeof Toast !== 'undefined' && Toast.warning) {
                Toast.warning('No data available to export', 3000);
            } else {
                alert('No data available to export');
            }
            return;
        }
        
        // Build HTML table with Excel formatting
        let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Completed Research</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                table {
                    border-collapse: collapse;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-size: 12px;
                    width: 100%;
                }
                th {
                    background-color: #2c3e50;
                    color: #ffffff;
                    font-weight: bold;
                    padding: 10px 12px;
                    border: 1px solid #34495e;
                    text-align: left;
                }
                td {
                    padding: 8px 12px;
                    border: 1px solid #bdc3c7;
                    vertical-align: top;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    max-width: 400px;
                }
                .wrap-cell {
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                }
                .even-row {
                    background-color: #f9f9f9;
                }
                .odd-row {
                    background-color: #ffffff;
                }
                .title-cell {
                    min-width: 250px;
                }
                .researcher-cell {
                    min-width: 200px;
                }
                .faculty-cell {
                    font-weight: 600;
                    color: #2c3e50;
                }
            </style>
        </head>
        <body>
            <h2 style="font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; margin-bottom: 16px;">
                Completed Research Export
            </h2>
            <p style="font-family: 'Segoe UI', Arial, sans-serif; color: #7f8c8d; margin-bottom: 20px; font-size: 13px;">
                Exported: ${new Date().toLocaleString()}
            </p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Faculty</th>
                        <th style="width: 35%;">List of Research/Research Title</th>
                        <th style="width: 25%;">Faculty Researcher</th>
                        <th style="width: 15%;">Campus</th>
                        <th style="width: 10%;">Year</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Add data rows
        data.forEach((row, index) => {
            const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
            
            // Process research titles - replace semicolons with newlines
            let researchTitles = row['List of Research/Research Title'] || '';
            if (researchTitles) {
                researchTitles = researchTitles.split(';').map(t => t.trim()).filter(t => t).join('<br>');
            }
            
            // Process faculty researchers - replace commas with newlines
            let facultyResearchers = row['Faculty Researcher'] || '';
            if (facultyResearchers) {
                facultyResearchers = facultyResearchers.split(',').map(r => r.trim()).filter(r => r).join('<br>');
            }
            
            htmlContent += `
                <tr class="${rowClass}">
                    <td class="faculty-cell">${escapeHtml(row.Faculty || '')}</td>
                    <td class="wrap-cell title-cell">${researchTitles || ''}</td>
                    <td class="wrap-cell researcher-cell">${facultyResearchers || ''}</td>
                    <td>${escapeHtml(row.Campus || '')}</td>
                    <td style="text-align: center;">${escapeHtml(row['Year Completed/Year of Symposium'] || '')}</td>
                </tr>
            `;
        });
        
        htmlContent += `
                </tbody>
            </table>
            <p style="font-family: 'Segoe UI', Arial, sans-serif; color: #7f8c8d; margin-top: 16px; font-size: 11px;">
                Total Records: ${data.length}
            </p>
        </body>
        </html>
        `;
        
        // Create blob and download as .xls
        const blob = new Blob([htmlContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8' 
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename.replace('.csv', '.xls');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const escapeHtml = (text) => {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    };

    const downloadXLSX = (data, filename) => {
        if (!data || data.length === 0) {
            if (typeof Toast !== 'undefined' && Toast.warning) {
                Toast.warning('No data available to export', 3000);
            } else {
                alert('No data available to export');
            }
            return;
        }
        
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            console.error('XLSX library not loaded');
            if (typeof Toast !== 'undefined' && Toast.error) {
                Toast.error('Excel library not loaded. Please refresh the page.', 4000);
            } else {
                alert('Excel library not loaded. Please refresh the page.');
            }
            return;
        }
        
        try {
            // Prepare data for XLSX - properly format with newlines
            const excelData = data.map(row => {
                // Process research titles - split by semicolon and join with newline
                let researchTitles = row['List of Research/Research Title'] || '';
                if (researchTitles && typeof researchTitles === 'string') {
                    researchTitles = researchTitles.split(';')
                        .map(t => t.trim())
                        .filter(t => t.length > 0)
                        .join('\n');
                }
                
                // Process faculty researchers - split by comma and join with newline
                let facultyResearchers = row['Faculty Researcher'] || '';
                if (facultyResearchers && typeof facultyResearchers === 'string') {
                    facultyResearchers = facultyResearchers.split(',')
                        .map(r => r.trim())
                        .filter(r => r.length > 0)
                        .join('\n');
                }
                
                return {
                    'Faculty': row.Faculty || '',
                    'List of Research/Research Title': researchTitles,
                    'Faculty Researcher': facultyResearchers,
                    'Campus': row.Campus || '',
                    'Year Completed/Year of Symposium': row['Year Completed/Year of Symposium'] || ''
                };
            });
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 30 },  // Faculty
                { wch: 60 },  // List of Research/Research Title
                { wch: 40 },  // Faculty Researcher
                { wch: 25 },  // Campus
                { wch: 15 }   // Year
            ];
            
            // Enable wrap text for all cells
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; R++) {
                for (let C = range.s.c; C <= range.e.c; C++) {
                    const addr = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[addr]) continue;
                    if (!ws[addr].s) ws[addr].s = {};
                    ws[addr].s.alignment = {
                        wrapText: true,
                        vertical: 'top'
                    };
                }
            }
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Completed Research');
            
            // Generate and download
            XLSX.writeFile(wb, filename);
            
            if (typeof Toast !== 'undefined' && Toast.success) {
                Toast.success(`Exported ${data.length} records successfully!`, 3000);
            }
            
        } catch (error) {
            console.error('XLSX export error:', error);
            if (typeof Toast !== 'undefined' && Toast.error) {
                Toast.error('Failed to export Excel file. Please try again.', 4000);
            } else {
                alert('Failed to export Excel file. Please try again.');
            }
        }
    };

    const handleExportWithRange = (startYear, endYear) => {
        if (typeof Toast !== 'undefined' && Toast.info) {
            Toast.info('Fetching export data...', 2000);
        }
        
        const formData = new FormData();
        formData.append('action', 'export_excel');
        formData.append('start_year', startYear);
        formData.append('end_year', endYear);
        
        fetch('/completeresearch', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.status && result.data && result.data.length > 0) {
                const filename = `Completed_Research_${startYear}_to_${endYear}_${new Date().toISOString().split('T')[0]}.xlsx`;
                downloadXLSX(result.data, filename);
            } else {
                const msg = result.message || 'No data available for the selected year range';
                if (typeof Toast !== 'undefined' && Toast.warning) {
                    Toast.warning(msg, 3000);
                } else {
                    alert(msg);
                }
            }
        })
        .catch(error => {
            console.error('Export error:', error);
            if (typeof Toast !== 'undefined' && Toast.error) {
                Toast.error('Failed to fetch export data. Please try again.', 4000);
            } else {
                alert('Failed to fetch export data. Please try again.');
            }
        });
    };

    const exportButton = $({
        tag: 'button',
        att: { className: 'export-btn-main' },
        style: {
            padding: '8px 20px',
            backgroundColor: '#198754',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
        },
        child: [
            $({
                tag: 'span',
                att: { className: 'fa-solid fa-file-excel' },
                style: { fontSize: '14px' }
            }),
            $({
                tag: 'span',
                text: 'Export Excel'
            }),
            $({
                tag: 'span',
                att: { className: 'fa-solid fa-chevron-down' },
                style: { fontSize: '10px' }
            })
        ],
        event: {
            type: 'click',
            method: showExportModal
        },
        event2: {
            type: 'mouseenter',
            method: (e) => {
                e.currentTarget.style.backgroundColor = '#157347';
                e.currentTarget.style.transform = 'scale(1.02)';
            }
        },
        event3: {
            type: 'mouseleave',
            method: (e) => {
                e.currentTarget.style.backgroundColor = '#198754';
                e.currentTarget.style.transform = 'scale(1)';
            }
        }
    });

    const showConfirmationModal = () => {
        let currentData = [];
        let filteredData = [];
        let searchTerm = '';
        let currentStats = { total: 0, pending: 0, not_presented: 0, completed: 0 };
        let modalInstance = null;
        let isModalOpen = false;
        let modalElement = null;
        let contentContainer = null;
        let searchInputElement = null;
        
        const debouncedSearch = debounce(() => {
            if (!modalElement) return;
            
            // Get all table rows
            const tableRows = modalElement.querySelectorAll('.modal-table-body tr');
            if (!tableRows || tableRows.length === 0) return;
            
            // Use requestAnimationFrame to batch DOM updates
            requestAnimationFrame(() => {
                // Use SearchMethod to filter the rows
                SearchMethod({
                    nodeList: tableRows,
                    textArray: [searchTerm],
                    display: '' // This will show matching rows
                });
                
                // Update the results count
                const allRows = modalElement.querySelectorAll('.modal-table-body tr');
                let visibleCount = 0;
                allRows.forEach(row => {
                    if (row.style.display !== 'none') {
                        visibleCount++;
                    }
                });
                
                const resultsInfo = modalElement.querySelector('.modal-results-info');
                if (resultsInfo) {
                    const showingSpan = resultsInfo.querySelector('.showing-count');
                    const foundSpan = resultsInfo.querySelector('.found-count');
                    if (showingSpan) {
                        showingSpan.textContent = `Showing ${visibleCount} of ${currentData.length} records`;
                    }
                    if (foundSpan) {
                        foundSpan.textContent = searchTerm.trim() ? `Found ${visibleCount} matching results` : '';
                    }
                }
            });
        }, 300);

        const fetchPending = async () => {
            try {
                const formData = new FormData();
                formData.append('action', 'fetch_confirm');
                
                const response = await fetch('/completeresearch', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.status) {
                    currentData = Array.isArray(result.data) ? result.data : [];
                    currentStats = result.stats || { total: 0, pending: 0, not_presented: 0, completed: 0 };
                    filteredData = [...currentData];
                    
                    if (isModalOpen && modalElement) {
                        renderTableRows();
                        // Reset search
                        if (searchInputElement) {
                            searchInputElement.value = '';
                            searchTerm = '';
                        }
                    } else {
                        renderModal();
                    }
                } else {
                    alert('Error: ' + (result.message || 'Failed to fetch pending research'));
                }
            } catch (error) {
                console.error('Error fetching pending:', error);
                alert('Failed to fetch pending research');
            }
        };
        
        const renderTableRows = () => {
            if (!modalElement) return;
            
            const tableBody = modalElement.querySelector('.modal-table-body');
            if (!tableBody) return;
            
            // Clear and rebuild table rows
            tableBody.innerHTML = '';
            
            if (filteredData.length === 0) {
                const emptyRow = $({
                    tag: 'tr',
                    child: $({
                        tag: 'td',
                        att: { colSpan: 6 },
                        style: { padding: '40px', textAlign: 'center', color: '#6c757d', fontSize: '14px' },
                        child: [
                            $({ tag: 'div', text: 'No matching records found', style: { marginBottom: '8px', fontWeight: '500' } }),
                            $({ tag: 'div', text: 'Try adjusting your search terms', style: { fontSize: '13px', color: '#adb5bd' } })
                        ]
                    })
                });
                tableBody.appendChild(emptyRow);
                return;
            }
            
            filteredData.forEach((item, index) => {
                const isPending = item.completion_status === 'pending_confirmation' || item.completion_status === null;
                const rowColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                
                const row = $({
                    tag: 'tr',
                    style: { 
                        borderBottom: '1px solid #e9ecef',
                        backgroundColor: !isPending ? '#fff5f5' : rowColor,
                        transition: 'background-color 0.2s ease'
                    },
                    child: [
                        $({ 
                            tag: 'td', 
                            text: item.paper_trail_no || '—', 
                            style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', fontWeight: '500', color: '#0d6efd' } 
                        }),
                        $({ 
                            tag: 'td', 
                            text: item.title || '—', 
                            style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', maxWidth: '250px', wordBreak: 'break-word' } 
                        }),
                        $({ 
                            tag: 'td', 
                            text: item.authors || '—', 
                            style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', maxWidth: '200px' } 
                        }),
                        $({ 
                            tag: 'td', 
                            text: item.presenter || '—', 
                            style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', fontWeight: '500' } 
                        }),
                        $({ 
                            tag: 'td', 
                            text: item.status_display || 'Pending', 
                            style: { 
                                padding: '12px 10px', 
                                border: '1px solid #e9ecef',
                                color: isPending ? '#fd7e14' : '#dc3545',
                                fontWeight: '600',
                                fontSize: '13px'
                            } 
                        }),
                        $({
                            tag: 'td',
                            style: { padding: '12px 10px', border: '1px solid #e9ecef', whiteSpace: 'nowrap' },
                            child: isPending ? [
                                $({
                                    tag: 'button',
                                    text: '✓ Confirm',
                                    style: {
                                        padding: '6px 14px',
                                        margin: '0 4px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation();
                                            handleConfirmation(item.id, 'confirm');
                                        }
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.currentTarget.style.backgroundColor = '#218838';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.currentTarget.style.backgroundColor = '#28a745';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: '✗ Not Presented',
                                    style: {
                                        padding: '6px 14px',
                                        margin: '0 4px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation();
                                            handleConfirmation(item.id, 'not_presented');
                                        }
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.currentTarget.style.backgroundColor = '#c82333';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.currentTarget.style.backgroundColor = '#dc3545';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }
                                })
                            ] : [
                                $({
                                    tag: 'span',
                                    text: '✓ Completed',
                                    style: { color: '#28a745', fontSize: '12px', fontWeight: '600' }
                                })
                            ]
                        })
                    ]
                });
                tableBody.appendChild(row);
            });
        };
        
        const renderModal = () => {
            closeModal();
            
            const statsBar = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '24px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid #dee2e6',
                    flexWrap: 'wrap'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', gap: '10px' },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-file-lines' }, style: { color: '#0d6efd', fontSize: '18px' } }),
                            $({ tag: 'span', text: 'Total:', style: { fontWeight: '600', color: '#495057' } }),
                            $({ tag: 'span', text: currentStats.total || 0, style: { color: '#212529', fontWeight: '700', fontSize: '16px' } })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', gap: '10px' },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-clock' }, style: { color: '#fd7e14', fontSize: '18px' } }),
                            $({ tag: 'span', text: 'Pending:', style: { fontWeight: '600', color: '#495057' } }),
                            $({ tag: 'span', text: currentStats.pending || 0, style: { color: '#fd7e14', fontWeight: '700', fontSize: '16px' } })
                        ]
                    })
                ]
            });
            
            const searchInput = $({
                tag: 'input',
                att: { 
                    type: 'text', 
                    placeholder: '🔍 Search by title, authors, presenter...',
                    className: 'confirm-research-search',
                    id: 'confirm-search-input-' + Date.now()
                },
                style: {
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #dee2e6',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#ffffff',
                    color: '#212529',
                    marginBottom: '16px',
                    boxSizing: 'border-box'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.target.style.borderColor = '#0d6efd';
                        e.target.style.boxShadow = '0 0 0 4px rgba(13, 110, 253, 0.1)';
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
                    method: (e) => {
                        searchTerm = e.target.value;
                        debouncedSearch();
                    }
                }
            });
            
            searchInputElement = searchInput;
            
            const resultsInfo = $({
                tag: 'div',
                att: { className: 'modal-results-info' },
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 4px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    color: '#6c757d'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'showing-count' },
                        text: `Showing ${filteredData.length} of ${currentData.length} records`
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'found-count' },
                        text: ''
                    })
                ]
            });
            
            const table = $({
                tag: 'table',
                style: { 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                },
                child: [
                    $({
                        tag: 'thead',
                        style: { position: 'sticky', top: '0', zIndex: '1' },
                        child: [
                            $({
                                tag: 'tr',
                                style: { backgroundColor: '#f8f9fa' },
                                child: [
                                    $({ tag: 'th', text: 'Paper Trail No.', style: { padding: '12px 10px', border: '1px solid #e9ecef', textAlign: 'left', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', color: '#495057', letterSpacing: '0.5px' } }),
                                    $({ tag: 'th', text: 'Title', style: { padding: '12px 10px', border: '1px solid #e9ecef', textAlign: 'left', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', color: '#495057', letterSpacing: '0.5px' } }),
                                    $({ tag: 'th', text: 'Authors', style: { padding: '12px 10px', border: '1px solid #e9ecef', textAlign: 'left', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', color: '#495057', letterSpacing: '0.5px' } }),
                                    $({ tag: 'th', text: 'Presenter', style: { padding: '12px 10px', border: '1px solid #e9ecef', textAlign: 'left', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', color: '#495057', letterSpacing: '0.5px' } }),
                                    $({ tag: 'th', text: 'Status', style: { padding: '12px 10px', border: '1px solid #e9ecef', textAlign: 'left', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', color: '#495057', letterSpacing: '0.5px' } }),
                                    $({ tag: 'th', text: 'Actions', style: { padding: '12px 10px', border: '1px solid #e9ecef', textAlign: 'center', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', color: '#495057', letterSpacing: '0.5px' } })
                                ]
                            })
                        ]
                    }),
                    $({ 
                        tag: 'tbody', 
                        att: { className: 'modal-table-body' }
                    })
                ]
            });
            
            // Build initial rows
            const tableBody = table.querySelector('.modal-table-body');
            if (tableBody) {
                if (filteredData.length === 0) {
                    const emptyRow = $({
                        tag: 'tr',
                        child: $({
                            tag: 'td',
                            att: { colSpan: 6 },
                            style: { padding: '40px', textAlign: 'center', color: '#6c757d', fontSize: '14px' },
                            child: [
                                $({ tag: 'div', text: 'No matching records found', style: { marginBottom: '8px', fontWeight: '500' } }),
                                $({ tag: 'div', text: 'Try adjusting your search terms', style: { fontSize: '13px', color: '#adb5bd' } })
                            ]
                        })
                    });
                    tableBody.appendChild(emptyRow);
                } else {
                    filteredData.forEach((item, index) => {
                        const isPending = item.completion_status === 'pending_confirmation' || item.completion_status === null;
                        const rowColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                        
                        const row = $({
                            tag: 'tr',
                            style: { 
                                borderBottom: '1px solid #e9ecef',
                                backgroundColor: !isPending ? '#fff5f5' : rowColor,
                                transition: 'background-color 0.2s ease'
                            },
                            child: [
                                $({ 
                                    tag: 'td', 
                                    text: item.paper_trail_no || '—', 
                                    style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', fontWeight: '500', color: '#0d6efd' } 
                                }),
                                $({ 
                                    tag: 'td', 
                                    text: item.title || '—', 
                                    style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', maxWidth: '250px', wordBreak: 'break-word' } 
                                }),
                                $({ 
                                    tag: 'td', 
                                    text: item.authors || '—', 
                                    style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', maxWidth: '200px' } 
                                }),
                                $({ 
                                    tag: 'td', 
                                    text: item.presenter || '—', 
                                    style: { padding: '12px 10px', border: '1px solid #e9ecef', fontSize: '13px', fontWeight: '500' } 
                                }),
                                $({ 
                                    tag: 'td', 
                                    text: item.status_display || 'Pending', 
                                    style: { 
                                        padding: '12px 10px', 
                                        border: '1px solid #e9ecef',
                                        color: isPending ? '#fd7e14' : '#dc3545',
                                        fontWeight: '600',
                                        fontSize: '13px'
                                    } 
                                }),
                                $({
                                    tag: 'td',
                                    style: { padding: '12px 10px', border: '1px solid #e9ecef', whiteSpace: 'nowrap' },
                                    child: isPending ? [
                                        $({
                                            tag: 'button',
                                            text: '✓ Confirm',
                                            style: {
                                                padding: '6px 14px',
                                                margin: '0 4px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    e.stopPropagation();
                                                    handleConfirmation(item.id, 'confirm');
                                                }
                                            },
                                            event2: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#218838';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }
                                            },
                                            event3: {
                                                type: 'mouseleave',
                                                method: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#28a745';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            text: '✗ Not Presented',
                                            style: {
                                                padding: '6px 14px',
                                                margin: '0 4px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    e.stopPropagation();
                                                    handleConfirmation(item.id, 'not_presented');
                                                }
                                            },
                                            event2: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#c82333';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }
                                            },
                                            event3: {
                                                type: 'mouseleave',
                                                method: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#dc3545';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }
                                        })
                                    ] : [
                                        $({
                                            tag: 'span',
                                            text: '✓ Completed',
                                            style: { color: '#28a745', fontSize: '12px', fontWeight: '600' }
                                        })
                                    ]
                                })
                            ]
                        });
                        tableBody.appendChild(row);
                    });
                }
            }
            
            const tableContainer = $({
                tag: 'div',
                style: {
                    maxHeight: '450px',
                    overflow: 'auto',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                },
                child: [table]
            });
            
            const modalContent = $({
                tag: 'div',
                att: { className: 'modal-content-container' },
                style: { padding: '0 4px' },
                child: [statsBar, searchInput, resultsInfo, tableContainer]
            });
            
            const closeButton = $({
                tag: 'button',
                text: 'Close',
                style: {
                    padding: '8px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: () => closeModal()
                },
                event2: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.backgroundColor = '#5a6268';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                },
                event3: {
                    type: 'mouseleave',
                    method: (e) => {
                        e.currentTarget.style.backgroundColor = '#6c757d';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            });
            
            modalInstance = CustomModal({
                title: 'Confirm Research Paper Successfully Presented',
                content: modalContent,
                size: 'large',
                footer: [closeButton]
            });
            
            isModalOpen = true;
            modalElement = modalInstance.element;
            
            if (modalElement) {
                modalElement.dataset.modalId = 'confirm-research-modal';
            }
        };
        
        const closeModal = () => {
            const existingModals = document.querySelectorAll('[data-modal-id="confirm-research-modal"]');
            existingModals.forEach(modal => {
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
                }, 250);
            });
            
            if (modalInstance && modalInstance.element) {
                const overlay = modalInstance.element;
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 250);
            }
            
            isModalOpen = false;
            modalElement = null;
            contentContainer = null;
            modalInstance = null;
            searchInputElement = null;
        };
        
        const handleConfirmation = async (researchId, action) => {
            const isConfirm = action === 'confirm';
            const actionText = isConfirm ? 'confirmed' : 'not presented';
            
            // Show confirmation modal
            ConfirmationModal({
                title: isConfirm ? '✅ Confirm Presentation' : '⚠️ Mark as Not Presented',
                message: `Are you sure you want to mark this research as "${actionText}"?`,
                onConfirm: async () => {
                    try {
                        const formData = new FormData();
                        formData.append('action', 'update');
                        formData.append('research_id', researchId);
                        formData.append('action_type', action);
                        formData.append('confirmed_by', '1');
                        
                        const response = await fetch('/completeresearch', {
                            method: 'POST',
                            body: formData
                        });
                        const result = await response.json();
                        
                        if (result.status) {
                            if (isConfirm) {
                                Toast.confirm(
                                    result.message || 'Research confirmed successfully!',
                                    3500
                                );
                            } else {
                                Toast.notPresented(
                                    result.message || 'Research marked as not presented',
                                    3500
                                );
                            }
                            
                            // Refresh data
                            await fetchData();
                            await fetchPending();
                        } else {
                            // Show error toast
                            Toast.error(
                                result.message || 'Failed to update research status',
                                4000
                            );
                        }
                    } catch (error) {
                        console.error('Error updating:', error);
                        Toast.error(
                            'An error occurred while updating the research status. Please try again.',
                            4000
                        );
                    }
                },
                onCancel: () => {
                    console.log('Action cancelled');
                },
                confirmText: isConfirm ? '✓ Confirm' : '✗ Mark as Not Presented',
                cancelText: 'Cancel',
                type: isConfirm ? 'success' : 'warning'
            });
        };
        
        closeModal();
        setTimeout(() => {
            fetchPending();
        }, 300);
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
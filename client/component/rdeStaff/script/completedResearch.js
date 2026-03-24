import { $ } from "../../../lib/lib.js";

export const CompletedResearch = () => {
    let mainTableContainer;
    let tableBody;
    let researchData = [];
    let filteredData = [];
    let isLoading = false;

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
            const response = await fetch('/completeresearch', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status) {
                researchData = result.data || [];
                filteredData = [...researchData];
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
                        $({ tag: 'span', att: { className: 'fa-solid fa-table' }, style: { color: 'deepskyblue', fontSize: '20px' } }),
                        $({ tag: 'h2', text: 'Completed Research', style: { color: '#fff', fontSize: '20px', fontWeight: '500', margin: '0' } }),
                        $({ tag: 'span', att: { className: 'research-count' }, style: { backgroundColor: '#444', color: '#ddd', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }, text: '0 records' })
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
                            style: { backgroundColor: 'transparent', border: '1px solid #444', borderRadius: '20px', padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
                            child: [$({ tag: 'span', att: { className: 'fa-solid fa-download' } }), $({ tag: 'span', text: 'Export' })],
                            event: { type: 'click', method: () => console.log('Export clicked') }
                        })
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

    const renderResearchRow = (data) => {
        const cells = columns.map(col => {
            const multiLineFields = ['authors', 'facultyResearcher', 'academicRank', 'nonAcademicRank', 'jobOrder'];
            let content;

            const rawValue = data[col.field];

            const isWrappingField = ['title', 'publishedTitle', 'journalTitle', 'programTitle', 'supportDocs1', 'supportDocs2', 'campus', 'forumTitle', 'venue'].includes(col.field);
            const isUrlField = ['supportDocs1', 'supportDocs2'].includes(col.field);
            
            if (isUrlField && rawValue && rawValue !== '—') {
                let items = [];
                try {
                    // Try to parse if it's JSON from backend
                    if (rawValue.startsWith('[') || rawValue.startsWith('{')) {
                        items = JSON.parse(rawValue);
                    } else {
                        // Otherwise it's a comma-separated string of plain URLs
                        items = rawValue.split(', ').map(url => ({ name: url, url: url }));
                    }
                } catch (e) {
                    items = rawValue.split(', ').map(url => ({ name: url, url: url }));
                }

                content = $({
                    tag: 'div',
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' },
                    child: items.map(item => $({
                        tag: 'a',
                        att: { href: item.url, target: '_blank', title: `View ${item.name}` },
                        style: { 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: 'deepskyblue', textDecoration: 'none', transition: 'all 0.2s ease',
                            fontSize: '12px'
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-file-pdf' }, style: { color: '#ff4d4d', fontSize: '14px' } }),
                            $({ tag: 'span', text: item.name, style: { wordBreak: 'break-all' } })
                        ],
                        event: { type: 'mouseenter', method: (e) => e.target.style.textDecoration = 'underline' },
                        event2: { type: 'mouseleave', method: (e) => e.target.style.textDecoration = 'none' }
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
        child: [SearchBar(), DataTable()]
    });
};
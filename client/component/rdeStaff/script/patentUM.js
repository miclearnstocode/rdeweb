import { $, ValidatePDF, DeleteConfirmModal } from "../../../lib/lib.js";

export const PatentUM = () => {
    let mainTableContainer;
    let tableBody;
    const mainStyleTag = document.getElementById('patent-styles') || (() => {
        const style = document.createElement('style');
        style.id = 'patent-styles';
        style.textContent = `
            @keyframes fieldFadeIn {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fields {
                animation: fieldFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            .dynamic-container {
                transition: height 0.3s ease;
                min-height: 480px;
            }
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                align-items: start;
            }
            #dynamic-fields-container {
                position: relative;
            }
            .tooltip-container {
                position: relative;
                display: inline-flex;
                align-items: center;
                margin-left: 8px;
                vertical-align: middle;
            }
            .help-icon {
                color: #aaa;
                font-size: 14px;
                cursor: help;
                transition: color 0.2s ease;
            }
            .help-icon:hover {
                color: deepskyblue;
            }
            .tooltip-text {
                visibility: hidden;
                width: 220px;
                background-color: #333;
                color: #fff;
                text-align: left;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 10px 12px;
                position: absolute;
                z-index: 100;
                bottom: 150%;
                left: 50%;
                margin-left: -110px;
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
                transform: translateY(10px);
                font-size: 11px;
                font-weight: normal;
                line-height: 1.4;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                pointer-events: none;
            }
            .tooltip-text::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: #333 transparent transparent transparent;
            }
            .tooltip-container:hover .tooltip-text {
                visibility: visible;
                opacity: 1;
                transform: translateY(0);
            }
            .custom-select-container {
                position: relative;
                width: 100%;
            }
            .custom-select-trigger {
                cursor: pointer;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .custom-options-list {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: #333;
                border: 1px solid #444;
                border-radius: 12px;
                margin-top: 8px;
                max-height: 350px;
                overflow-y: auto;
                z-index: 2000;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
                display: none;
                animation: fieldFadeIn 0.3s ease;
            }
            .custom-option {
                padding: 12px 16px;
                border-bottom: 1px solid #444;
                cursor: pointer;
                transition: background 0.2s;
            }
            .custom-option:last-child {
                border-bottom: none;
            }
            .custom-option:hover {
                background-color: #444;
            }
            .option-label {
                color: deepskyblue;
                font-weight: 700;
                font-size: 15px;
                margin-bottom: 2px;
            }
            .option-desc {
                color: #aaa;
                font-size: 11px;
                line-height: 1.3;
            }
            .custom-select-container.open .custom-options-list {
                display: block;
            }
            .custom-select-container.open {
                z-index: 2000 !important;
            }
            #dynamic-fields-container .form-grid > div {
                position: relative !important;
                z-index: 5; /* Base level for grid items */
            }
            .dynamic-container, .animate-fields, .form-grid {
                overflow: visible !important;
            }
            .form-grid {
                position: relative;
                z-index: 50; /* Higher than the following container */
            }
            .description-container {
                position: relative;
                z-index: 1;
                margin-top: 20px;
            }
            .radio-group {
                display: flex;
                gap: 12px;
                padding: 4px 0;
            }
            .radio-item {
                position: relative;
                flex: 1;
            }
            .radio-item input[type="radio"] {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
            }
            .radio-label {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 16px;
                background: #333;
                border: 1px solid #444;
                border-radius: 8px;
                color: #aaa;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
                white-space: nowrap;
            }
            .radio-item input[type="radio"]:checked + .radio-label {
                background: rgba(0, 191, 255, 0.15);
                border-color: deepskyblue;
                color: #fff;
                box-shadow: 0 0 10px rgba(0, 191, 255, 0.2);
            }
            .radio-label:hover {
                border-color: #666;
            }

        `;
        document.head.appendChild(style);
        return style;
    })();

    let currentSearch = '';
    let currentType = '';
    let mainSearchTimeout;

    // IPR status options based on user requirements
    const statusOptions = [
        { value: 'filed', label: 'Filed', color: '#ff9800' },
        { value: 'registered', label: 'Registered', color: '#4caf50' },
        { value: 'downgrade', label: 'Downgrade', color: '#f44336' }
    ];

    // IPR Type options
    const typeOptions = [
        { value: 'patent', label: 'Patent', icon: 'fa-file-invoice' },
        { value: 'utility_model', label: 'Utility Model', icon: 'fa-cogs' },
        { value: 'copyright', label: 'Copyright', icon: 'fa-copyright' },
        { value: 'industrial_design', label: 'Industrial Design', icon: 'fa-paint-brush' },
        { value: 'trademark', label: 'Trademark', icon: 'fa-trademark' }
    ];

    // Campus options
    const campusOptions = [
        'Main (Roxas)',
        'Pilar',
        'Pontevedra',
        'Sigma',
        'Mambusao',
        'Burias',
        'Tapaz',
        'Dayao',
        'Dumarao'
    ];

    // Class of Work options (for Copyright)
    const classOfWorkOptions = [
        { label: 'Class A', desc: 'Books, pamphlets, articles and other writings (includes thesis and dissertations)' },
        { label: 'Class B', desc: 'Periodicals and newspapers (includes electronic journals, magazines)' },
        { label: 'Class C', desc: 'Lectures, sermons, addresses, dissertations, speeches prepared for oral delivery' },
        { label: 'Class D', desc: 'Letters (includes circulars, encyclicals, electronic messages or emails)' },
        { label: 'Class E', desc: 'Dramatic or dramatico-musical compositions; choreographic works and entertainment' },
        { label: 'Class F', desc: 'Musical compositions, with or without words' },
        { label: 'Class G', desc: 'Works of drawing, painting, architecture, sculpture, engraving, lithography; digital artworks' },
        { label: 'Class H', desc: 'Original ornamental designs or models for articles of manufacture' },
        { label: 'Class I', desc: 'Illustrations, maps, plans, sketches, charts and three-dimensional works' },
        { label: 'Class K', desc: 'Photographic works; lantern slides' },
        { label: 'Class L', desc: 'Audiovisual works and cinematographic works; audio-visual recordings' },
        { label: 'Class M', desc: 'Pictorial illustrations and advertisements (includes product packaging graphical designs)' },
        { label: 'Class N', desc: 'Computer programs (includes mobile applications and games)' },
        { label: 'Class O', desc: 'Other literary, scholarly, scientific and artistic works (board games, flash cards, spreadsheets)' },
        { label: 'Class P', desc: 'Sound recordings (Related Rights)' },
        { label: 'Class Q', desc: 'Broadcast recordings (Related Rights)' },
        { label: 'Class R', desc: 'Audiovisual performance (Related Rights)' }
    ];

    // Columns for the data table
    const columns = [
        { field: 'type', header: 'IPR Type', width: '180px' },
        { field: 'technologyName', header: 'Title / Technology Name', width: '300px' },
        { field: 'caseNumber', header: 'Case Number', width: '180px' },
        { field: 'applicationNumber', header: 'Application No.', width: '150px' },
        { field: 'status', header: 'Status', width: '150px' },
        { field: 'applicationDate', header: 'Application Date', width: '130px' },
        { field: 'publicationDate', header: 'Publication Date', width: '130px' },
        { field: 'inventors', header: 'Inventors / Authors', width: '250px' },
        { field: 'campus', header: 'Campus', width: '150px' },
        { field: 'actions', header: 'Actions', width: '100px' }
    ];

    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    const openAddPatentModal = () => {
        const modal = createPatentModal();
        document.body.appendChild(modal);
        // Animate in
        setTimeout(() => {
            const overlay = document.getElementById('patent-modal-overlay');
            if (overlay) overlay.style.opacity = '1';
        }, 10);
    };

    const closeModal = () => {
        const overlay = document.getElementById('patent-modal-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 300);
        }
    };

    // Search research titles from the database
    const searchResearchTitles = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return [];

        try {
            const formData = new FormData();
            formData.append('action', 'search_research');
            formData.append('search', searchTerm);

            const response = await fetch('/patentresearch', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                console.error('Search failed:', result.message);
                return [];
            }
        } catch (error) {
            console.error('Error searching titles:', error);
            return [];
        }
    };

    // Create title search field
    const createTitleSearchField = (inputBaseStyle) => {
        const containerId = 'title-search-container';
        const inputId = 'title-search-input';
        const resultsId = 'title-search-results';
        const hiddenResearchId = 'selected-research-id';
        const hiddenEndorsementId = 'selected-endorsement-id';

        const container = $({
            tag: 'div',
            style: { position: 'relative', width: '100%', zIndex: '100' }
        });

        const hiddenResearchInput = $({
            tag: 'input',
            att: { type: 'hidden', id: hiddenResearchId, name: 'research_id' }
        });

        const hiddenEndorsementInput = $({
            tag: 'input',
            att: { type: 'hidden', id: hiddenEndorsementId, name: 'endorsement_id' }
        });

        const searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                id: inputId,
                placeholder: 'Search completed research titles...',
                autocomplete: 'off',
                required: true
            },
            style: { ...inputBaseStyle, width: '100%' }
        });

        const resultsDropdown = $({
            tag: 'div',
            att: { id: resultsId },
            style: {
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '4px',
                marginTop: '4px',
                display: 'none',
                zIndex: '1000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }
        });

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const searchTerm = e.target.value;

            if (searchTerm.length < 2) {
                resultsDropdown.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(async () => {
                const results = await searchResearchTitles(searchTerm);
                resultsDropdown.innerHTML = '';

                if (results.length === 0) {
                    resultsDropdown.appendChild($({
                        tag: 'div',
                        style: { padding: '12px', color: '#888', textAlign: 'center', fontSize: '13px' },
                        text: 'No matching accepted research found'
                    }));
                } else {
                    results.forEach(result => {
                        const item = $({
                            tag: 'div',
                            style: {
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #444',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({ tag: 'div', style: { color: '#fff', fontWeight: '500', fontSize: '14px' }, text: result.title }),
                                $({ tag: 'div', style: { color: '#aaa', fontSize: '12px', marginTop: '4px' }, text: `${result.author} • ${result.event}` })
                            ]
                        });

                        item.addEventListener('click', () => {
                            searchInput.value = result.title;
                            hiddenResearchInput.value = result.id;
                            hiddenEndorsementInput.value = result.endorsement_id;
                            resultsDropdown.style.display = 'none';
                        });

                        item.addEventListener('mouseenter', () => item.style.backgroundColor = '#444');
                        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
                        resultsDropdown.appendChild(item);
                    });
                }
                resultsDropdown.style.display = 'block';
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) resultsDropdown.style.display = 'none';
        });

        container.appendChild(hiddenResearchInput);
        container.appendChild(hiddenEndorsementInput);
        container.appendChild(searchInput);
        container.appendChild(resultsDropdown);

        return container;
    };

    const createPatentModal = (patent = null) => {
        const isEdit = !!patent;
        const inputBaseStyle = {
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fff',
            fontSize: '14px',
            width: '100%',
            outline: 'none',
            transition: 'border-color 0.2s ease'
        };

        const labelStyle = {
            display: 'block',
            marginBottom: '8px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        };

        const formGroupStyle = { marginBottom: '20px' };

        // Helper to create form group
        const createFormGroup = (label, input, span = 1, tooltip = null, customStyle = {}, groupId = null) => {
            const labelChildren = [$({ tag: 'span', text: label })];

            if (tooltip) {
                labelChildren.push($({
                    tag: 'div',
                    att: { className: 'tooltip-container' },
                    child: [
                        $({ tag: 'i', att: { className: 'fa-solid fa-circle-question help-icon' } }),
                        $({ tag: 'div', att: { className: 'tooltip-text' }, text: tooltip })
                    ]
                }));
            }

            return $({
                tag: 'div',
                att: groupId ? { id: groupId } : {},
                style: { ...formGroupStyle, ...customStyle, gridColumn: span === 2 ? 'span 2' : 'auto', position: customStyle.zIndex ? 'relative' : 'static' },
                child: [
                    $({ tag: 'label', style: { ...labelStyle, display: 'flex', alignItems: 'center' }, child: labelChildren }),
                    input
                ]
            });
        };

        // Function to render dynamic fields based on IPR type
        const renderDynamicFields = (type, data = null) => {
            const container = document.getElementById('dynamic-fields-container');
            if (!container) return;

            // Clear with a quick fade out effect if possible, but here we just immediate clear and animate children
            container.innerHTML = '';
            container.className = 'dynamic-container';

            const grid = $({
                tag: 'div',
                att: { className: 'animate-fields form-grid' }
            });

            // Update Modal Title dynamically
            const modalTitleEl = document.getElementById('modal-title');
            if (modalTitleEl) {
                const typeLabel = typeOptions.find(opt => opt.value === type)?.label || 'IP Record';
                const isEdit = modalTitleEl.getAttribute('data-edit') === 'true';
                modalTitleEl.innerText = `${isEdit ? 'Edit' : 'New'} ${typeLabel}`;
            }

            // Suffix and dynamic values logic
            const sfx = type === 'utility_model' ? 'UM' : '';
            const statusName = 'status' + sfx;
            const actualStatusOptions = statusOptions.filter(opt => type === 'patent' || opt.value !== 'downgrade');
            const initialStatusValue = (data?.status || data?.statusUM || 'filed');
            const isRegistered = initialStatusValue === 'registered';

            // Common dynamic fields - Status as Radio Group
            const statusField = $({
                tag: 'div',
                att: { className: 'radio-group' },
                child: actualStatusOptions.map(opt => {
                    const radioId = `status-${opt.value}`;
                    return $({
                        tag: 'div',
                        att: { className: 'radio-item' },
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    type: 'radio',
                                    name: statusName,
                                    value: opt.value,
                                    id: radioId,
                                    checked: initialStatusValue === opt.value,
                                    required: true
                                },
                                event: {
                                    type: 'change',
                                    method: (e) => {
                                        const isVisible = e.target.value === 'registered';
                                        const regNoGroup = document.getElementById('reg-no-group');
                                        const regDateGroup = document.getElementById('reg-date-group');
                                        if (regNoGroup) regNoGroup.style.display = isVisible ? 'block' : 'none';
                                        if (regDateGroup) regDateGroup.style.display = isVisible ? 'block' : 'none';

                                        const regNoInput = regNoGroup?.querySelector('input');
                                        const regDateInput = regDateGroup?.querySelector('input');
                                        if (regNoInput) regNoInput.required = isVisible;
                                        if (regDateInput) regDateInput.required = isVisible;
                                    }
                                }
                            }),
                            $({ tag: 'label', att: { htmlFor: radioId, className: 'radio-label' }, text: opt.label })
                        ]
                    });
                })
            });

            const campusSelect = $({
                tag: 'select',
                att: { name: 'campus' + sfx, required: true },
                style: { ...inputBaseStyle, appearance: 'none' },
                child: campusOptions.map(camp => $({
                    tag: 'option',
                    att: {
                        value: camp,
                        selected: (data?.campus || data?.campusUM) === camp
                    },
                    text: camp
                }))
            });

            const regNoField = $({
                tag: 'input',
                att: { type: 'text', name: 'registrationNumber', value: data?.registrationNumber || data?.registrationNumberUM || '', required: isRegistered },
                style: inputBaseStyle
            });
            const regDateField = $({
                tag: 'input',
                att: { type: 'date', name: 'registrationDate', value: data?.registrationDate || data?.registrationDateUM || '', required: isRegistered },
                style: inputBaseStyle
            });

            const regNoGroup = createFormGroup('Registration Number', regNoField, 1, null, { display: isRegistered ? 'block' : 'none' }, 'reg-no-group');
            const regDateGroup = createFormGroup('Registration Date', regDateField, 1, null, { display: isRegistered ? 'block' : 'none' }, 'reg-date-group');

            if (type === 'patent' || type === 'utility_model' || type === 'industrial_design') {

                // Shared fields for Tech-heavy IPR
                const isID = type === 'industrial_design';
                const isUM = type === 'utility_model';
                const sfx = isUM ? 'UM' : '';

                grid.appendChild(createFormGroup('Case Number (CAPSU IPMO Year-000)', $({
                    tag: 'input',
                    att: { type: 'text', name: 'caseNumber' + sfx, placeholder: 'CAPSU IPMO 2026-001', value: data?.['caseNumber' + sfx] || data?.caseNumber || '', required: true },
                    style: inputBaseStyle
                })));

                grid.appendChild(createFormGroup('Research Title Search', createTitleSearchField(inputBaseStyle), 1,
                    'Linking your IP record to a research title in the database automatically fetches the research title. Type at least 2 characters to see suggestions.',
                    { zIndex: 1000 }
                ));

                const titleLabel = isID ? 'ID Title' : 'Technology Name';
                const titleField = isID ? 'idTitle' : ('technologyName' + sfx);
                grid.appendChild(createFormGroup(titleLabel, $({
                    tag: 'input',
                    att: { type: 'text', name: titleField, required: true, value: data?.[titleField] || data?.technologyName || data?.productName || '' },
                    style: inputBaseStyle
                })));

                const inventorsLabel = isID ? 'Invertor/s' : 'Inventor/s';
                const inventorsField = isID ? 'invertors' : ('inventors' + sfx);
                grid.appendChild(createFormGroup(inventorsLabel, $({
                    tag: 'input',
                    att: { type: 'text', name: inventorsField, required: true, value: data?.[inventorsField] || data?.inventors || '' },
                    style: inputBaseStyle
                })));

                grid.appendChild(createFormGroup('Campus', campusSelect));


                grid.appendChild(createFormGroup('Agent', $({
                    tag: 'input',
                    att: { type: 'text', name: 'agent' + sfx, value: data?.['agent' + sfx] || data?.agent || '' },
                    style: inputBaseStyle
                })));

                const appDateField = isID ? 'applicationDate' : ('applicationDate' + sfx);
                grid.appendChild(createFormGroup('Application / Filing Date', $({
                    tag: 'input',
                    att: { type: 'date', name: appDateField, required: true, value: data?.[appDateField] || data?.applicationDate || data?.filingDate || '' },
                    style: inputBaseStyle
                })));

                const appNumField = isID ? 'applicationNumber' : ('applicationNumber' + sfx);
                grid.appendChild(createFormGroup('Application Number', $({
                    tag: 'input',
                    att: { type: 'text', name: appNumField, required: true, value: data?.[appNumField] || data?.applicationNumber || '' },
                    style: inputBaseStyle
                })));

                const pubDateField = isID ? 'publicationDate' : ('publicationDate' + sfx);
                grid.appendChild(createFormGroup('Publication / Issued Date', $({
                    tag: 'input',
                    att: { type: 'date', name: pubDateField, required: true, value: data?.[pubDateField] || data?.publicationDate || '' },
                    style: inputBaseStyle
                })));

                grid.appendChild(createFormGroup('Status', statusField));

                grid.appendChild(regNoGroup);
                grid.appendChild(regDateGroup);


                // File upload section
                grid.appendChild($({
                    tag: 'div',
                    style: { gridColumn: 'span 2', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #444', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
                    child: [
                        $({ tag: 'i', att: { className: 'fa-solid fa-file-arrow-up' }, style: { color: 'deepskyblue', fontSize: '18px' } }),
                        $({ tag: 'h4', text: 'Upload Files (Cloud Storage)', style: { margin: '0', color: 'deepskyblue', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' } })
                    ]
                }));

                const fileFields = [
                    { label: 'Application Form', name: (isID ? 'application_form_file' : 'patentFormURL' + sfx + '_file'), db_url: (isID ? 'applicationFormURL' : 'patentFormURL' + sfx), accept: '.pdf' },
                    { label: 'Abstract', name: 'abstractURL' + sfx + '_file', db_url: 'abstractURL' + sfx, accept: '.pdf' },
                    { label: 'Claims', name: 'claimsURL' + sfx + '_file', db_url: 'claimsURL' + sfx, accept: '.pdf' },
                    { label: 'Technical Description', name: 'technicalDescriptionURL' + sfx + '_file', db_url: 'technicalDescriptionURL' + sfx, accept: '.pdf' },
                    { label: 'Technical Drawing/s', name: 'technicalDrawingURL' + sfx + '_file', db_url: 'technicalDrawingURL' + sfx, accept: 'image/*' },
                    { label: 'Photo of the Technology', name: 'photoTechnologyURL' + sfx + '_file', db_url: 'photoTechnologyURL' + sfx, accept: 'image/*' },
                ];

                fileFields.forEach(f => {
                    const currentUrl = data ? data[f.db_url] : null;
                    const fileInput = $({
                        tag: 'div',
                        style: { display: 'flex', flexDirection: 'column', gap: '5px' },
                        child: [
                            $({
                                tag: 'input',
                                att: { type: 'file', name: f.name, accept: f.accept, required: !currentUrl && (isID || type === 'patent' || type === 'utility_model') },
                                style: { ...inputBaseStyle, padding: '8px' },
                                event: {
                                    type: 'change',
                                    method: async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (f.accept === '.pdf') {
                                            const check = await ValidatePDF(file);
                                            if (!check.valid) {
                                                alert(`File Validation Failed: ${check.error}`);
                                                e.target.value = '';
                                            }
                                        }
                                    }
                                }
                            }),
                            currentUrl ? $({
                                tag: 'a',
                                att: { href: currentUrl, target: '_blank', className: 'view-current-file' },
                                style: { fontSize: '11px', color: 'deepskyblue', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' },
                                child: [
                                    $({ tag: 'i', att: { className: 'fa-solid fa-eye' } }),
                                    $({ tag: 'span', text: 'View Current Attachment' }),
                                    $({ tag: 'input', att: { type: 'hidden', name: `current_${f.db_url}`, value: currentUrl } })
                                ]
                            }) : null
                        ].filter(Boolean)
                    });
                    grid.appendChild(createFormGroup(f.label, fileInput));
                });
            } else if (type === 'copyright') {
                // Copyright specific - Balanced layout
                grid.appendChild(createFormGroup('Title', $({
                    tag: 'input',
                    att: { type: 'text', name: 'title', required: true, value: data?.title || data?.productName || '' },
                    style: inputBaseStyle
                }), 2));

                grid.appendChild(createFormGroup('Author/s', $({
                    tag: 'input',
                    att: { type: 'text', name: 'author', required: true, value: data?.author || data?.inventors || '' },
                    style: inputBaseStyle
                }), 2));

                grid.appendChild(createFormGroup('Campus', campusSelect));


                grid.appendChild(createFormGroup('Application / Filing Date', $({
                    tag: 'input',
                    att: { type: 'date', name: 'applicationDate', required: true, value: data?.applicationDate || data?.filingDate || '' },
                    style: inputBaseStyle
                })));

                grid.appendChild(createFormGroup('Class of Work', (() => {
                    const selectedVal = data?.classOfWork || '';
                    const selectedOption = classOfWorkOptions.find(o => o.label === selectedVal) || { label: 'Select Class...', desc: 'Please choose classification' };

                    const trigger = $({
                        tag: 'div',
                        att: { className: 'custom-select-trigger', id: 'class-work-trigger' },
                        style: { ...inputBaseStyle, height: 'auto', minHeight: '45px', padding: '8px 16px' },
                        child: [
                            $({ tag: 'div', att: { className: 'option-label' }, text: selectedOption.label }),
                            $({ tag: 'div', att: { className: 'option-desc' }, text: selectedOption.desc })
                        ]
                    });

                    const hiddenInput = $({ tag: 'input', att: { type: 'hidden', name: 'classOfWork', required: true, value: selectedVal } });

                    const optionsList = $({
                        tag: 'div',
                        att: { className: 'custom-options-list' },
                        child: classOfWorkOptions.map(opt => $({
                            tag: 'div',
                            att: { className: 'custom-option' },
                            child: [
                                $({ tag: 'div', att: { className: 'option-label' }, text: opt.label }),
                                $({ tag: 'div', att: { className: 'option-desc' }, text: opt.desc })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    trigger.querySelector('.option-label').innerText = opt.label;
                                    trigger.querySelector('.option-desc').innerText = opt.desc;
                                    hiddenInput.value = opt.label;
                                    container.classList.remove('open');
                                }
                            }
                        }))
                    });

                    const container = $({
                        tag: 'div',
                        att: { className: 'custom-select-container' },
                        child: [trigger, hiddenInput, optionsList],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation();
                                container.classList.toggle('open');
                                document.addEventListener('click', () => {
                                    container.classList.remove('open');
                                }, { once: true });
                            }
                        }
                    });

                    return container;
                })(), 1, null, { zIndex: 1000 }));


                grid.appendChild(createFormGroup('Status', statusField));

                grid.appendChild(regNoGroup);
                grid.appendChild(regDateGroup);


                grid.appendChild($({
                    tag: 'div',
                    style: { gridColumn: 'span 2', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #444', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
                    child: [
                        $({ tag: 'i', att: { className: 'fa-solid fa-file-arrow-up' }, style: { color: 'deepskyblue', fontSize: '18px' } }),
                        $({ tag: 'h4', text: 'Upload Files (Cloud Storage)', style: { margin: '0', color: 'deepskyblue', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' } })
                    ]
                }));

                const fileFields = [
                    { label: 'Photo of works', name: 'photo_works_file', db_url: 'photoWorksURL', accept: 'image/*' },
                    { label: 'Copyright Forms', name: 'copyright_forms_file', db_url: 'copyrightFormsURL', accept: '.pdf' },
                    { label: 'Supplemental Document (Optional)', name: 'supplemental_file', db_url: 'supplementalDocumentURL', accept: '.pdf' },
                    { label: 'Deed of Assignment', name: 'deed_assignment_file', db_url: 'deedAssignmentURL', accept: '.pdf' },
                    { label: 'Affidavit of Ownership', name: 'affidavit_file', db_url: 'affidavitOwnershipURL', accept: '.pdf' },
                    { label: 'IDs of Authors', name: 'ids_authors_file', db_url: 'idAuthorURL', accept: '.pdf,.png,.jpg,.jpeg' },
                    { label: 'Creative Works (Original Specimen)', name: 'creative_work_file', db_url: 'creativeWorksURL', accept: '.pdf,.png,.jpg,.jpeg' }
                ];

                fileFields.forEach(f => {
                    const currentUrl = data ? data[f.db_url] : null;
                    const fileInput = $({
                        tag: 'div',
                        style: { display: 'flex', flexDirection: 'column', gap: '5px' },
                        child: [
                            $({
                                tag: 'input',
                                att: { type: 'file', name: f.name, accept: f.accept },
                                style: { ...inputBaseStyle, padding: '8px' },
                                event: {
                                    type: 'change',
                                    method: async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (f.accept === '.pdf') {
                                            const check = await ValidatePDF(file);
                                            if (!check.valid) {
                                                alert(`File Validation Failed: ${check.error}`);
                                                e.target.value = '';
                                            }
                                        }
                                    }
                                }
                            }),
                            currentUrl ? $({
                                tag: 'a',
                                att: { href: currentUrl, target: '_blank', className: 'view-current-file' },
                                style: { fontSize: '11px', color: 'deepskyblue', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' },
                                child: [
                                    $({ tag: 'i', att: { className: 'fa-solid fa-eye' } }),
                                    $({ tag: 'span', text: 'View Current Attachment' }),
                                    $({ tag: 'input', att: { type: 'hidden', name: `current_${f.db_url}`, value: currentUrl } })
                                ]
                            }) : null
                        ].filter(Boolean)
                    });
                    grid.appendChild(createFormGroup(f.label, fileInput));
                });
            } else if (type === 'trademark') {
                // Trademark specific
                grid.appendChild(createFormGroup('Title', $({
                    tag: 'input',
                    att: { type: 'text', name: 'title', required: true, value: data?.title || data?.productName || '' },
                    style: inputBaseStyle
                }), 2));

                grid.appendChild(createFormGroup('Registrant', $({
                    tag: 'input',
                    att: { type: 'text', name: 'registrant', required: true, value: data?.registrant || '' },
                    style: inputBaseStyle
                })));

                grid.appendChild(createFormGroup('Application / Filing Date', $({
                    tag: 'input',
                    att: { type: 'date', name: 'applicationDate', required: true, value: data?.applicationDate || data?.filingDate || '' },
                    style: inputBaseStyle
                })));

                grid.appendChild(createFormGroup('Application Number', $({
                    tag: 'input',
                    att: { type: 'text', name: 'applicationNumber', required: true, value: data?.applicationNumber || '' },
                    style: inputBaseStyle
                })));


                grid.appendChild(createFormGroup('Status', statusField));

                grid.appendChild(regNoGroup);
                grid.appendChild(regDateGroup);


                grid.appendChild($({
                    tag: 'div',
                    style: { gridColumn: 'span 2', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #444', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
                    child: [
                        $({ tag: 'i', att: { className: 'fa-solid fa-file-arrow-up' }, style: { color: 'deepskyblue', fontSize: '18px' } }),
                        $({ tag: 'h4', text: 'Upload Files (Cloud Storage)', style: { margin: '0', color: 'deepskyblue', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' } })
                    ]
                }));

                const fileFields = [
                    { label: 'Trademark Application Form', name: 'trademark_form_file', db_url: 'trademarkFormURL', accept: '.pdf' },
                    { label: 'Photo of the Trademark', name: 'photo_trademark_file', db_url: 'photoTrademarkURL', accept: 'image/*' }
                ];

                fileFields.forEach(f => {
                    const currentUrl = data ? data[f.db_url] : null;
                    const fileInput = $({
                        tag: 'div',
                        style: { display: 'flex', flexDirection: 'column', gap: '5px' },
                        child: [
                            $({
                                tag: 'input',
                                att: { type: 'file', name: f.name, accept: f.accept },
                                style: { ...inputBaseStyle, padding: '8px' },
                                event: {
                                    type: 'change',
                                    method: async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (f.accept === '.pdf') {
                                            const check = await ValidatePDF(file);
                                            if (!check.valid) {
                                                alert(`File Validation Failed: ${check.error}`);
                                                e.target.value = '';
                                            }
                                        }
                                    }
                                }
                            }),
                            currentUrl ? $({
                                tag: 'a',
                                att: { href: currentUrl, target: '_blank', className: 'view-current-file' },
                                style: { fontSize: '11px', color: 'deepskyblue', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' },
                                child: [
                                    $({ tag: 'i', att: { className: 'fa-solid fa-eye' } }),
                                    $({ tag: 'span', text: 'View Current Attachment' }),
                                    $({ tag: 'input', att: { type: 'hidden', name: `current_${f.db_url}`, value: currentUrl } })
                                ]
                            }) : null
                        ].filter(Boolean)
                    });
                    grid.appendChild(createFormGroup(f.label, fileInput));
                });

            }

            // Description and Image at the bottom (for others)
            const hasTechnicalUploads = ['patent', 'utility_model', 'industrial_design', 'copyright', 'trademark'].includes(type);
            const bottomGrid = $({
                tag: 'div',
                att: { className: 'animate-fields description-container' },
                style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                child: [
                    // Only show generic photo for non-technical types that don't have specialized uploads
                    !hasTechnicalUploads ? $({
                        tag: 'div',
                        child: [
                            $({ tag: 'label', style: labelStyle, text: 'Resource Photo' }),
                            $({
                                tag: 'div',
                                style: { display: 'flex', flexDirection: 'column', gap: '10px' },
                                child: [
                                    $({
                                        tag: 'input',
                                        att: { type: 'file', name: 'patent_image', accept: 'image/*' },
                                        style: { ...inputBaseStyle, padding: '8px' }
                                    }),
                                    data?.image ? $({
                                        tag: 'div',
                                        style: { display: 'flex', alignItems: 'center', gap: '10px' },
                                        child: [
                                            $({ tag: 'img', att: { src: data.image }, style: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' } }),
                                            $({ tag: 'span', text: 'Current Photo', style: { color: '#888', fontSize: '12px' } }),
                                            $({ tag: 'input', att: { type: 'hidden', name: 'current_image', value: data.image } })
                                        ]
                                    }) : null
                                ].filter(Boolean)
                            })
                        ]
                    }) : null
                ].filter(Boolean)
            });

            container.appendChild(grid);
            container.appendChild(bottomGrid);
        };


        const overlay = $({
            tag: 'div',
            att: { id: 'patent-modal-overlay' },
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '2000',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            },
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target.id === 'patent-modal-overlay') closeModal();
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#222',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        borderRadius: '20px',
                        border: '1px solid #444',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    },
                    child: [
                        // Modal Header
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 32px',
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#2a2a2a'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: { display: 'flex', alignItems: 'center', gap: '15px' },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: `fa-solid ${isEdit ? 'fa-edit' : 'fa-plus-circle'}` },
                                            style: { color: 'deepskyblue', fontSize: '24px' }
                                        }),
                                        $({
                                            tag: 'h2',
                                            att: { id: 'modal-title', 'data-edit': isEdit ? 'true' : 'false' },
                                            text: isEdit ? 'Edit Record' : 'New Record',
                                            style: { color: '#fff', fontSize: '20px', fontWeight: '600', margin: '0' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'button',
                                    att: { className: 'fa-solid fa-xmark' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#666',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => e.target.style.color = '#fff',
                                        type3: 'mouseleave',
                                        method3: (e) => e.target.style.color = '#666'
                                    }
                                })
                            ]
                        }),
                        // Modal Body (Scrollable)
                        $({
                            tag: 'div',
                            style: { padding: '32px', overflowY: 'auto', flex: '1' },
                            child: [
                                $({
                                    tag: 'form',
                                    att: { id: 'patent-form' },
                                    child: [
                                        // IPR Type Dropdown (Top - determines other fields)
                                        $({
                                            tag: 'div',
                                            style: formGroupStyle,
                                            child: [
                                                $({ tag: 'label', style: labelStyle, text: 'IPR Type' }),
                                                $({
                                                    tag: 'select',
                                                    att: { name: 'type', required: true },
                                                    style: { ...inputBaseStyle, appearance: 'none' },
                                                    child: typeOptions.map(opt => $({ tag: 'option', att: { value: opt.value, selected: patent?.type === opt.value }, text: opt.label })),
                                                    event: {
                                                        type: 'change',
                                                        method: (e) => {
                                                            renderDynamicFields(e.target.value, patent);
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        // Container for dynamic fields
                                        $({
                                            tag: 'div',
                                            att: { id: 'dynamic-fields-container' },
                                            elementHandler: (el) => {
                                                // Initial render
                                                setTimeout(() => {
                                                    renderDynamicFields(patent?.type || 'patent', patent);
                                                }, 0);
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        // Modal Footer
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 32px',
                                borderTop: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: '#2a2a2a'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: '1px solid #444',
                                        color: '#aaa',
                                        padding: '10px 24px',
                                        borderRadius: '30px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => { e.target.style.backgroundColor = '#333'; e.target.style.color = '#fff'; },
                                        type3: 'mouseleave',
                                        method3: (e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#aaa'; }
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: isEdit ? 'Update Record' : 'Save Record',
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '10px 32px',
                                        borderRadius: '30px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 15px rgba(0, 191, 255, 0.3)',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: async (e) => {
                                            const btn = e.target;
                                            const originalText = btn.textContent;
                                            btn.disabled = true;
                                            btn.textContent = 'Saving...';

                                            const form = document.getElementById('patent-form');
                                            const formData = new FormData(form);
                                            formData.append('action', isEdit ? 'update' : 'save');
                                            if (isEdit) formData.append('id', patent.id);

                                            try {
                                                const response = await fetch('/patentresearch', {
                                                    method: 'POST',
                                                    body: formData
                                                });
                                                const result = await response.json();
                                                if (result.success) {
                                                    closeModal();
                                                    loadPatents();
                                                } else {
                                                    alert('Error: ' + result.message);
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Network error occurred.');
                                            } finally {
                                                btn.disabled = false;
                                                btn.textContent = originalText;
                                            }
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        return overlay;
    };

    const loadPatents = async () => {
        try {
            const formData = new FormData();
            formData.append('action', 'getAll');
            if (currentSearch) formData.append('search', currentSearch);
            if (currentType) formData.append('type', currentType);

            const response = await fetch('/patentresearch', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                updateTableDisplay(result.data);
                // Also update stats since we have new data
                updateStats(result.data);
            }
        } catch (error) {
            console.error('Error loading records:', error);
        }
    };

    const updateTableDisplay = (data) => {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const recordCountEl = document.querySelector('.record-count');
        if (recordCountEl) recordCountEl.textContent = `${data.length} records`;

        if (data.length === 0) {
            tableBody.appendChild(createEmptyState());
        } else {
            data.forEach(item => {
                tableBody.appendChild(createPatentRow(item));
            });
        }
    };

    const createPatentRow = (item) => {
        const row = $({
            tag: 'tr',
            style: { transition: 'background 0.2s ease' },
            event: {
                type: 'mouseenter',
                method: (e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)',
                type2: 'mouseleave',
                method2: (e) => e.currentTarget.style.backgroundColor = 'transparent'
            },
            child: columns.map(col => {
                let content = item[col.field] || '—';
                const style = {
                    padding: '16px 12px',
                    fontSize: '13px',
                    color: '#ddd',
                    borderBottom: '1px solid #444',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Segoe UI, sans-serif',
                    maxWidth: col.width,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                };

                // Smart Mapping for different record types
                if (col.field === 'type') {
                    content = createTypeBadge(item.type);
                } else if (col.field === 'status') {
                    content = createStatusBadge(item.status || item.statusUM);
                } else if (col.field === 'technologyName') {
                    content = item.technologyName || item.technologyNameUM || item.idTitle || item.title || item.productName || '—';
                } else if (col.field === 'caseNumber') {
                    content = item.caseNumber || item.caseNumberUM || '—';
                } else if (col.field === 'applicationNumber') {
                    content = item.applicationNumber || item.applicationNumberUM || '—';
                } else if (col.field === 'applicationDate') {
                    const date = item.applicationDate || item.applicationDateUM || item.filingDate || '—';
                    content = formatPatentDate(date);
                } else if (col.field === 'publicationDate') {
                    const date = item.publicationDate || item.publicationDateUM || '—';
                    content = formatPatentDate(date);
                } else if (col.field === 'inventors') {
                    content = item.inventors || item.inventorsUM || item.invertors || item.author || '—';
                } else if (col.field === 'campus') {
                    content = item.campus || item.campusUM || '—';
                } else if (col.field === 'actions') {
                    content = $({
                        tag: 'div',
                        style: { display: 'flex', gap: '10px' },
                        child: [
                            $({
                                tag: 'button',
                                att: { className: 'fa-solid fa-edit', title: 'Edit' },
                                style: { background: 'transparent', border: 'none', color: 'deepskyblue', cursor: 'pointer', fontSize: '16px' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        const modal = createPatentModal(item);
                                        document.body.appendChild(modal);
                                        setTimeout(() => {
                                            const overlay = document.getElementById('patent-modal-overlay');
                                            if (overlay) overlay.style.opacity = '1';
                                        }, 10);
                                    }
                                }
                            }),
                            $({
                                tag: 'button',
                                att: { className: 'fa-solid fa-trash', title: 'Delete' },
                                style: { background: 'transparent', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '16px' },
                                event: {
                                    type: 'click',
                                    method: async () => {
                                        const confirmed = await DeleteConfirmModal(
                                            `Delete ${item.type.replace('_', ' ')}?`,
                                            `Are you sure you want to delete this record? This will also MOVE all its associated files in Google Drive to TRASH.`
                                        );
                                        if (confirmed) {
                                            const fd = new FormData();
                                            fd.append('action', 'delete');
                                            fd.append('id', item.id);
                                            fd.append('type', item.type);
                                            const resp = await fetch('/patentresearch', { method: 'POST', body: fd });
                                            const res = await resp.json();
                                            if (res.success) loadPatents();
                                        }
                                    }
                                }
                            })
                        ]
                    });
                }

                if (typeof content === 'string') {
                    return $({ tag: 'td', style, text: content });
                } else {
                    return $({ tag: 'td', style, child: [content].flat() });
                }
            })
        });
        return row;
    };

    const createEmptyState = () => {
        return $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: { padding: '0' },
                    child: [
                        $({
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
                                    style: { position: 'relative', width: '180px', height: '180px', marginBottom: '24px' },
                                    child: [
                                        $({ tag: 'span', att: { className: 'fa-solid fa-certificate' }, style: { fontSize: '100px', color: 'deepskyblue', opacity: 0.2, position: 'absolute', left: '0', top: '0', transform: 'rotate(-10deg)' } }),
                                        $({ tag: 'span', att: { className: 'fa-solid fa-gears' }, style: { fontSize: '80px', color: '#4caf50', opacity: 0.2, position: 'absolute', right: '-10px', bottom: '10px', transform: 'rotate(15deg)' } }),
                                        $({ tag: 'span', att: { className: 'fa-solid fa-trophy' }, style: { fontSize: '60px', color: '#ffd700', opacity: 0.25, position: 'absolute', left: '-15px', bottom: '20px', transform: 'rotate(-20deg)' } }),
                                        $({ tag: 'div', style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 'bold', color: '#fff', backgroundColor: 'rgba(0,191,255,0.2)', padding: '8px 16px', borderRadius: '30px', border: '1px solid deepskyblue', whiteSpace: 'nowrap' }, text: 'IP' })
                                    ]
                                }),
                                $({ tag: 'div', text: 'No Patent / Utility Model Records', style: { fontSize: '26px', marginBottom: '12px', fontWeight: '600', color: '#fff', letterSpacing: '-0.5px' } }),
                                $({ tag: 'div', text: 'Patents, utility models, industrial designs, and inventions', style: { fontSize: '15px', opacity: 0.7, textAlign: 'center', lineHeight: '1.6' } }),
                                $({ tag: 'div', text: 'with intellectual property protection will be displayed here', style: { fontSize: '15px', opacity: 0.7, marginBottom: '30px', textAlign: 'center' } })
                            ]
                        })
                    ]
                })
            ]
        });
    };

    const getTableBody = (el) => {
        tableBody = el;
        loadPatents();
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
                                    text: 'Intellectual Property Records',
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
                                'All', 'Patent', 'Utility Model', 'Copyright', 'Industrial Design', 'Trademark'
                            ].map(type => {
                                const val = type === 'All' ? '' : type.toLowerCase().replace(' ', '_');
                                const isActive = currentType === val;

                                return $({
                                    tag: 'button',
                                    text: type,
                                    att: { className: `filter-btn-${val || 'all'}` },
                                    style: {
                                        backgroundColor: isActive ? 'deepskyblue' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: isActive ? '#fff' : '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            currentType = val;
                                            // Refresh all buttons in this horizontal bar
                                            const parent = e.target.parentElement;
                                            Array.from(parent.children).forEach(btn => {
                                                btn.style.backgroundColor = 'transparent';
                                                btn.style.color = '#aaa';
                                            });
                                            e.target.style.backgroundColor = 'deepskyblue';
                                            e.target.style.color = '#fff';

                                            loadPatents();
                                        }
                                    }
                                });
                            })
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
                                        placeholder: 'Search IP records...',
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
                                            const term = e.target.value;
                                            currentSearch = term;
                                            clearTimeout(mainSearchTimeout);
                                            mainSearchTimeout = setTimeout(() => {
                                                loadPatents();
                                            }, 400);
                                        }
                                    }
                                })
                            ]
                        }),
                        // Add Patent/UM button
                        $({
                            tag: 'button',
                            att: { className: 'add-patent-btn' },
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
                                    text: 'Add IP Record'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: openAddPatentModal
                            }
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
                id: 'stat-total',
                icon: 'fa-file-invoice',
                color: 'deepskyblue',
                subtext: 'Accumulated'
            },
            {
                label: 'Filed',
                value: '0',
                id: 'stat-filed',
                icon: 'fa-file-signature',
                color: '#ff9800',
                subtext: 'IP Filings'
            },
            {
                label: 'Registered',
                value: '0',
                id: 'stat-registered',
                icon: 'fa-certificate',
                color: '#4caf50',
                subtext: 'Success Cases'
            },
            {
                label: 'Downgraded',
                value: '0',
                id: 'stat-downgraded',
                icon: 'fa-level-down-alt',
                color: '#f44336',
                subtext: 'Status Changed'
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
                                        att: { id: stat.id },
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

            if (col.field === 'actions') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [
                        $({
                            tag: 'button',
                            att: { title: 'Edit Patent/UM' },
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid deepskyblue',
                                color: 'deepskyblue',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-pen-to-square' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.stopPropagation();
                                    console.log('Edit clicked for sample row');
                                }
                            }
                        })
                    ]
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

    const updateRecordCount = (count) => {
        const el = document.querySelector('.record-count');
        if (el) el.innerText = `${count} record${count !== 1 ? 's' : ''}`;
    };

    const updateStats = (data) => {
        if (!data) return;
        const total = data.length;
        const filed = data.filter(i => (i.status || i.statusUM || '').toLowerCase() === 'filed').length;
        const registered = data.filter(i => (i.status || i.statusUM || '').toLowerCase() === 'registered').length;
        const downgraded = data.filter(i => {
            const s = (i.status || i.statusUM || '').toLowerCase();
            return s === 'downgrade' || s === 'downgraded';
        }).length;

        const totalEl = document.getElementById('stat-total');
        const filedEl = document.getElementById('stat-filed');
        const registeredEl = document.getElementById('stat-registered');
        const downgradedEl = document.getElementById('stat-downgraded');

        if (totalEl) totalEl.innerText = total;
        if (filedEl) filedEl.innerText = filed;
        if (registeredEl) registeredEl.innerText = registered;
        if (downgradedEl) downgradedEl.innerText = downgraded;
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
    return {
        total: 0,
        patents: 0,
        utilityModels: 0,
        industrialDesigns: 0,
        granted: 0,
        pending: 0
    };
};
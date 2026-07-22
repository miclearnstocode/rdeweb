// client/component/rdeStaff/ProposedResearch/helperComponents/ImportProposedModal.js

import { $, Waiting, showToast, CustomModal, DragDropUpload } from "../../../../lib/lib.js";

export const ImportProposedModal = ({ onImportComplete }) => {
    let modalInstance = null;
    let importData = [];
    let fileData = [];
    let importErrors = [];
    let loadingElement = null;
    let modalContentElement = null;
    let selectedEventId = '';
    let eventsList = [];
    let isEventsLoading = false;
    let errorDataRows = [];
    let uploadedFileName = '';

    const showLoading = () => {
        if (!loadingElement) {
            loadingElement = Waiting();
            document.body.appendChild(loadingElement);
        }
    };

    const hideLoading = () => {
        if (loadingElement) {
            loadingElement.remove();
            loadingElement = null;
        }
    };

    const fetchEvents = async () => {
        if (isEventsLoading) return;
        isEventsLoading = true;
        
        try {
            const response = await fetch('/proposedresearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'get_events'
                })
            });

            const result = await response.json();
            
            if (result.status && result.data) {
                eventsList = result.data;
                if (eventsList.length > 0 && !selectedEventId) {
                    selectedEventId = eventsList[0].id;
                }
                return eventsList;
            }
            return [];
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('Error fetching events list', 'error');
            return [];
        } finally {
            isEventsLoading = false;
        }
    };

    const parseExcelFile = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const processImportData = (rawData) => {
        const processed = [];
        const errors = [];
        const errorRows = [];
        
        // Expected columns
        const titleKey = 'Research Title';
        const authorKey = 'Name of Faculty Researcher / Author';
        const categoryKey = 'Category';
        const campusKey = 'Research Center/Campus/ Satellite College';
        const codeKey = 'Code';

        rawData.forEach((row, index) => {
            const rowNum = index + 2;
            
            // Get values
            let title = row[titleKey] || '';
            let authorFull = row[authorKey] || '';
            let category = row[categoryKey] || '';
            let campus = row[campusKey] || '';
            let code = row[codeKey] || '';

            // Clean up values
            title = title.toString().trim();
            authorFull = authorFull.toString().trim();
            category = category.toString().trim();
            campus = campus.toString().trim();
            code = code.toString().trim();

            // Validate required fields
            const rowErrors = [];
            if (!title) rowErrors.push('Research Title is required');
            if (!authorFull) rowErrors.push('Author is required');
            if (!campus) rowErrors.push('Campus is required');

            if (rowErrors.length > 0) {
                errors.push({
                    row: rowNum,
                    errors: rowErrors,
                    data: row
                });
                errorRows.push({
                    row: rowNum,
                    title: title || '[Empty]',
                    author: authorFull || '[Empty]',
                    category: category || '[Empty]',
                    campus: campus || '[Empty]',
                    code: code || '[Empty]',
                    errors: rowErrors
                });
                return;
            }

            // Parse author and coauthor
            let normalized = authorFull;
            normalized = normalized.replace(/\s+and\s+/gi, ', ');
            normalized = normalized.replace(/\s*&\s*/g, ', ');
            
            let parts = normalized.split(',').map(s => s.trim());
            parts = parts.filter(s => s.length > 0);
            
            if (parts.length === 0) {
                errors.push({
                    row: rowNum,
                    errors: ['Could not parse author names'],
                    data: row
                });
                errorRows.push({
                    row: rowNum,
                    title: title || '[Empty]',
                    author: authorFull || '[Empty]',
                    category: category || '[Empty]',
                    campus: campus || '[Empty]',
                    code: code || '[Empty]',
                    errors: ['Could not parse author names']
                });
                return;
            }
            
            const author = parts[0];
            const coauthors = parts.slice(1).filter(s => s.length > 0);
            
            processed.push({
                title: title,
                author: author,
                coauthor: coauthors.join(', '),
                category: category || '',
                campus: campus,
                code: code,
                row: rowNum,
                valid: true
            });
        });

        errorDataRows = errorRows;

        return { processed, errors };
    };

    const renderEventSelector = () => {
        if (eventsList.length === 0) {
            return $({
                tag: 'div',
                style: {
                    padding: '12px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                    textAlign: 'center'
                },
                text: 'No events available. Please add an event first.'
            });
        }

        return $({
            tag: 'div',
            style: {
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e8ecf0'
            },
            child: [
                $({
                    tag: 'label',
                    text: 'Select Event',
                    style: {
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#475569',
                        fontSize: '13px'
                    }
                }),
                $({
                    tag: 'select',
                    att: {
                        id: 'event-select',
                        value: selectedEventId
                    },
                    style: {
                        width: '100%',
                        padding: '10px 16px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        color: '#212529',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    child: eventsList.map(event => 
                        $({
                            tag: 'option',
                            att: { value: event.id },
                            text: `${event.name} (${event.date})`,
                            selected: event.id === selectedEventId
                        })
                    ),
                    event: {
                        type: 'change',
                        method: (e) => {
                            selectedEventId = e.target.value;
                        }
                    }
                })
            ]
        });
    };

    const renderUploadedFileInfo = () => {
        if (!uploadedFileName) return null;

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #86efac',
                marginTop: '8px'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-file-excel' },
                    style: { color: '#217346', fontSize: '20px' }
                }),
                $({
                    tag: 'span',
                    text: uploadedFileName,
                    style: {
                        color: '#166534',
                        fontSize: '14px',
                        fontWeight: '500',
                        flex: '1',
                        wordBreak: 'break-all'
                    }
                }),
                $({
                    tag: 'span',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#16a34a',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#dcfce7',
                        padding: '2px 10px',
                        borderRadius: '12px'
                    },
                    child: [
                        $({ tag: 'span', att: { className: 'fa-solid fa-check-circle' }, style: { fontSize: '12px' } }),
                        $({ tag: 'span', text: 'Uploaded' })
                    ]
                })
            ]
        });
    };

    const renderNotIncludedIndicator = () => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                marginTop: '8px'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-circle-info' },
                    style: { color: '#d97706', fontSize: '14px' }
                }),
                $({
                    tag: 'span',
                    text: 'The "Category" column is displayed for reference but will NOT be imported to the database (set to NULL).',
                    style: {
                        color: '#92400e',
                        fontSize: '13px',
                        lineHeight: '1.4'
                    }
                })
            ]
        });
    };

    const renderDataTable = (data) => {
        if (!data || data.length === 0) {
            return $({
                tag: 'div',
                style: {
                    padding: '40px',
                    textAlign: 'center',
                    color: '#94a3b8'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-file-excel' },
                        style: { fontSize: '48px', display: 'block', marginBottom: '16px', color: '#217346' }
                    }),
                    $({
                        tag: 'div',
                        text: 'No data to preview. Please upload an Excel file.',
                        style: { fontSize: '14px' }
                    })
                ]
            });
        }

        const tableContainer = document.createElement('div');
        tableContainer.style.cssText = `
            overflow: auto;
            max-height: 400px;
            border-radius: 12px;
            border: 1px solid #e8ecf0;
            margin-top: 16px;
        `;

        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            min-width: 700px;
        `;

        // Header
        const thead = document.createElement('thead');
        thead.style.cssText = `
            background: #f8fafc;
            position: sticky;
            top: 0;
            z-index: 10;
        `;
        const headerRow = document.createElement('tr');
        
        const headers = [
            { text: '#', isCategory: false },
            { text: 'Research Title', isCategory: false },
            { text: 'Author', isCategory: false },
            { text: 'Coauthor(s)', isCategory: false },
            { text: 'Category', isCategory: false }, // No longer special
            { text: 'Campus', isCategory: false },
            { text: 'Code', isCategory: false }
        ];
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.text;
            th.style.cssText = `
                padding: 10px 12px;
                text-align: left;
                font-weight: 600;
                color: #475569;
                border-bottom: 2px solid #e8ecf0;
                white-space: nowrap;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            `;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.style.cssText = `
                border-bottom: 1px solid #f1f3f5;
                transition: background 0.15s ease;
            `;
            
            tr.addEventListener('mouseenter', () => {
                tr.style.backgroundColor = '#f8fafc';
            });
            tr.addEventListener('mouseleave', () => {
                tr.style.backgroundColor = 'transparent';
            });

            const cells = [
                { value: index + 1 },
                { value: item.title },
                { value: item.author },
                { value: item.coauthor || '—' },
                { value: item.category || '—' },
                { value: item.campus },
                { value: item.code || '—' }
            ];

            cells.forEach((cell, idx) => {
                const td = document.createElement('td');
                td.textContent = cell.value || '—';
                td.style.cssText = `
                    padding: 8px 12px;
                    color: #1a2a3a;
                    max-width: ${idx === 1 ? '250px' : '200px'};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                `;
                
                if (idx === 1) {
                    td.title = cell.value;
                }
                
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);

        return tableContainer;
    };
    
    const renderErrorTable = (errorRows) => {
        if (!errorRows || errorRows.length === 0) return null;

        const tableContainer = document.createElement('div');
        tableContainer.style.cssText = `
            overflow: auto;
            max-height: 300px;
            border-radius: 12px;
            border: 1px solid #fecaca;
            margin-top: 12px;
        `;

        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            min-width: 700px;
        `;

        // Header with red theme
        const thead = document.createElement('thead');
        thead.style.cssText = `
            background: #fef2f2;
            position: sticky;
            top: 0;
            z-index: 10;
        `;
        const headerRow = document.createElement('tr');
        const headers = ['Row #', 'Research Title', 'Author', 'Category', 'Campus', 'Code', 'Error(s)'];
        
        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.cssText = `
                padding: 10px 12px;
                text-align: left;
                font-weight: 600;
                color: #991b1b;
                border-bottom: 2px solid #fecaca;
                white-space: nowrap;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            `;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body with red highlighting
        const tbody = document.createElement('tbody');
        errorRows.forEach((item) => {
            const tr = document.createElement('tr');
            tr.style.cssText = `
                border-bottom: 1px solid #fee2e2;
                background-color: #fef2f2;
                transition: background 0.15s ease;
            `;
            
            tr.addEventListener('mouseenter', () => {
                tr.style.backgroundColor = '#fecaca';
            });
            tr.addEventListener('mouseleave', () => {
                tr.style.backgroundColor = '#fef2f2';
            });

            const cells = [
                { value: item.row, style: 'font-weight: 600; color: #991b1b;' },
                { value: item.title || '—' },
                { value: item.author || '—' },
                { value: item.category || '—' },
                { value: item.campus || '—' },
                { value: item.code || '—' },
                { value: item.errors.join('; '), style: 'color: #dc2626; font-weight: 500;' }
            ];

            cells.forEach((cell, idx) => {
                const td = document.createElement('td');
                td.textContent = cell.value || '—';
                td.style.cssText = `
                    padding: 8px 12px;
                    color: #1a2a3a;
                    max-width: ${idx === 1 ? '200px' : '150px'};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    ${cell.style || ''}
                `;
                
                if (idx === 1 || idx === 2) {
                    td.title = cell.value;
                }
                
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);

        return tableContainer;
    };

    const renderErrorList = (errors) => {
        if (!errors || errors.length === 0) return null;

        const hasErrorRows = errorDataRows && errorDataRows.length > 0;

        return $({
            tag: 'div',
            style: {
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                border: '1px solid #fecaca'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        color: '#dc2626',
                        fontWeight: '600',
                        fontSize: '13px'
                    },
                    child: [
                        $({ tag: 'span', att: { className: 'fa-solid fa-circle-exclamation' }, style: { fontSize: '14px' } }),
                        $({ tag: 'span', text: `${errors.length} row(s) could not be processed` })
                    ]
                }),
                hasErrorRows ? renderErrorTable(errorDataRows) : null,
                !hasErrorRows ? $({
                    tag: 'div',
                    style: {
                        maxHeight: '150px',
                        overflow: 'auto',
                        fontSize: '13px'
                    },
                    child: errors.map(err => 
                        $({
                            tag: 'div',
                            style: {
                                padding: '6px 12px',
                                marginBottom: '4px',
                                backgroundColor: '#fee2e2',
                                borderRadius: '6px',
                                color: '#991b1b',
                                fontSize: '12px'
                            },
                            text: `Row ${err.row}: ${err.errors.join('; ')}`
                        })
                    )
                }) : null
            ]
        });
    };

    const renderStats = (data, errors) => {
        const validCount = data.filter(d => d.valid !== false).length;
        const errorCount = errors.length;

        const children = [];

        // Valid rows stat
        const validStat = $({
            tag: 'div',
            style: { display: 'flex', alignItems: 'center', gap: '8px' },
            child: [
                $({ 
                    tag: 'span', 
                    att: { className: 'fa-regular fa-circle-check' }, 
                    style: { fontSize: '16px', color: '#16a34a' } 
                }),
                $({ 
                    tag: 'span', 
                    text: `${validCount} valid row(s)`, 
                    style: { color: '#16a34a', fontWeight: '500' } 
                })
            ]
        });
        children.push(validStat);

        // Error rows stat (if any)
        if (errorCount > 0) {
            const errorStat = $({
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', gap: '8px' },
                child: [
                    $({ 
                        tag: 'span', 
                        att: { className: 'fa-solid fa-triangle-exclamation' }, 
                        style: { fontSize: '16px', color: '#dc2626' } 
                    }),
                    $({ 
                        tag: 'span', 
                        text: `${errorCount} row(s) with errors`, 
                        style: { color: '#dc2626', fontWeight: '500' } 
                    })
                ]
            });
            children.push(errorStat);
        }

        // Total rows stat
        const totalStat = $({
            tag: 'div',
            style: { display: 'flex', alignItems: 'center', gap: '8px' },
            child: [
                $({ 
                    tag: 'span', 
                    att: { className: 'fa-regular fa-file-lines' }, 
                    style: { fontSize: '16px', color: '#6366f1' } 
                }),
                $({ 
                    tag: 'span', 
                    text: `${data.length} total row(s)`, 
                    style: { color: '#475569', fontWeight: '500' } 
                })
            ]
        });
        children.push(totalStat);

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '20px',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginTop: '12px',
                flexWrap: 'wrap'
            },
            child: children
        });
    };

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        showLoading();

        try {
            const file = files[0];
            
            // Store the file name
            uploadedFileName = file.name;
            
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            
            if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
                showToast('Please upload a valid Excel file (.xlsx or .xls)', 'error');
                hideLoading();
                uploadedFileName = '';
                return;
            }

            const rawData = await parseExcelFile(file);
            
            if (!rawData || rawData.length === 0) {
                showToast('No data found in the Excel file', 'warning');
                hideLoading();
                return;
            }

            const result = processImportData(rawData);
            importData = result.processed;
            importErrors = result.errors;

            // Update the modal content
            updateModalContent();
            
            if (importErrors.length > 0) {
                showToast(`Processed ${importData.length} rows with ${importErrors.length} error(s)`, 'warning');
            } else {
                showToast(`Successfully processed ${importData.length} rows`, 'success');
            }

        } catch (error) {
            console.error('Error processing file:', error);
            showToast('Error processing file: ' + error.message, 'error');
            uploadedFileName = '';
        } finally {
            hideLoading();
        }
    };

    const handleSave = async () => {
        const validData = importData.filter(d => d.valid !== false);
        
        if (validData.length === 0) {
            showToast('No valid data to import', 'warning');
            return;
        }

        if (!selectedEventId) {
            showToast('Please select an event', 'warning');
            return;
        }

        if (importErrors.length > 0) {
            const confirm = await new Promise((resolve) => {
                const modal = CustomModal({
                    title: 'Import with Errors',
                    content: $({
                        tag: 'div',
                        style: { textAlign: 'center', padding: '20px' },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-triangle-exclamation' },
                                style: { fontSize: '48px', color: '#f59e0b', display: 'block', marginBottom: '16px' }
                            }),
                            $({
                                tag: 'p',
                                text: `${importErrors.length} row(s) have errors and will be skipped. Continue with import?`,
                                style: { color: '#475569', fontSize: '14px' }
                            })
                        ]
                    }),
                    footer: ({ closeModal }) => $({
                        tag: 'div',
                        style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                        child: [
                            $({
                                tag: 'button',
                                text: 'Cancel',
                                style: {
                                    padding: '8px 20px',
                                    backgroundColor: '#f1f3f5',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        closeModal();
                                        resolve(false);
                                    }
                                }
                            }),
                            $({
                                tag: 'button',
                                text: 'Continue Import',
                                style: {
                                    padding: '8px 24px',
                                    backgroundColor: '#f59e0b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        closeModal();
                                        resolve(true);
                                    }
                                }
                            })
                        ]
                    }),
                    size: 'small'
                });
            });

            if (!confirm) return;
        }

        showLoading();

        try {
            const response = await fetch('/proposedresearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'import_proposed',
                    data: importData,
                    event_id: selectedEventId
                })
            });

            const result = await response.json();

            if (result.status) {
                let message = `Successfully imported ${result.imported_count || validData.length} research papers`;
                if (result.skipped_count > 0) {
                    message += ` (${result.skipped_count} skipped)`;
                }
                showToast(message, 'success');
                
                // Reset uploaded file name
                uploadedFileName = '';
                
                if (modalInstance) {
                    modalInstance.closeModal();
                }
                
                if (onImportComplete) {
                    onImportComplete();
                }
            } else {
                showToast('Import failed: ' + (result.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            showToast('Error during import: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    };

    const updateModalContent = () => {
        if (!modalInstance || !modalContentElement) return;

        modalContentElement.innerHTML = '';
        const content = renderContent();
        if (content) {
            modalContentElement.appendChild(content);
        }
    };

    const renderContent = () => {
        const hasData = importData.length > 0;
        const hasErrors = importErrors.length > 0;

        const children = [];

        // Event selector - always show
        children.push(renderEventSelector());

        // Upload section with file name display
        children.push(
            $({
                tag: 'div',
                style: { marginBottom: '20px' },
                child: [
                    DragDropUpload({
                        label: 'Upload Excel File',
                        accept: '.xlsx,.xls',
                        description: 'Drag & drop your Excel file here or click to browse',
                        maxSizeMB: 20,
                        multiple: false,
                        showPreview: false, // Disable the built-in preview
                        onFileSelect: (files) => {
                            if (files && files.length > 0) {
                                handleFileSelect(files);
                            }
                        },
                        className: 'import-upload'
                    }).element,
                    // Show uploaded file name
                    renderUploadedFileInfo()
                ]
            })
        );

        // Stats
        if (hasData) {
            children.push(renderStats(importData, importErrors));
        }

        // Data table
        if (hasData) {
            children.push(renderDataTable(importData));
        }

        // Errors
        if (hasErrors) {
            const errorList = renderErrorList(importErrors);
            if (errorList) {
                children.push(errorList);
            }
        }

        return $({
            tag: 'div',
            att: { id: 'import-modal-content' },
            style: { padding: '0 4px' },
            child: children
        });
    };

    const openModal = async () => {
        // Reset state
        importData = [];
        importErrors = [];
        errorDataRows = [];
        uploadedFileName = '';

        // Fetch events first
        showLoading();
        await fetchEvents();
        hideLoading();

        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.id = 'import-modal-content-wrapper';
        
        const content = renderContent();
        contentWrapper.appendChild(content);
        modalContentElement = contentWrapper;

        modalInstance = CustomModal({
            title: 'Import Proposed Research',
            size: 'large',
            content: contentWrapper,
            footer: ({ closeModal }) => $({
                tag: 'div',
                style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                child: [
                    $({
                        tag: 'button',
                        text: 'Cancel',
                        style: {
                            padding: '8px 20px',
                            backgroundColor: 'transparent',
                            border: '1px solid #e8ecf0',
                            borderRadius: '8px',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                        },
                        event: {
                            type: 'click',
                            method: closeModal,
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.target.style.backgroundColor = '#f8fafc';
                                e.target.style.borderColor = '#cbd5e1';
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#e8ecf0';
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        text: 'Import Data',
                        style: {
                            padding: '8px 28px',
                            backgroundColor: '#217346',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-file-import' } }),
                            $({ tag: 'span', text: 'Import' })
                        ],
                        event: {
                            type: 'click',
                            method: handleSave,
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.target.style.backgroundColor = '#1a5c3a';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(33, 115, 70, 0.3)';
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.target.style.backgroundColor = '#217346';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }
                        }
                    })
                ]
            }),
            onClose: () => {
                modalInstance = null;
                modalContentElement = null;
                uploadedFileName = '';
            }
        });
    };

    return {
        openModal
    };
};
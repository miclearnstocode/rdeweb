// Summary.js
import { $, Path, Request } from "../../../../lib/lib.js";

// Use global variables from CDN
const XLSX = window.XLSX;
const jsPDF = window.jspdf?.jsPDF || window.jspdf;

export const Summary = () => {
    let panel;
    let eventId = Path(4) || '';
    let categoryId = Path(6) || '0';
    
    // Main container
    const container = $({
        tag: 'div',
        style: {
            position: 'fixed',
            zIndex: 10000,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Calibri, Arial, sans-serif'
        },
        elementHandler: (el) => { panel = el; }
    });

    // Loading state
    const loadingDiv = $({
        tag: 'div',
        style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '18px',
            color: '#2c3e50',
            backgroundColor: 'white',
            padding: '20px 40px',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        text: 'Loading summary report...'
    });
    container.appendChild(loadingDiv);

    // Fetch data from API - USING CORRECT ENDPOINT
    const req = new Request('/ranking');
    req.Post([
        { name: 'generateSummaryReport', value: '1' },
        { name: 'eventId', value: eventId },
        { name: 'categoryId', value: categoryId }
    ]);
    req.Json();
    
    req.Send().then(response => {
        container.removeChild(loadingDiv);
        
        if (!response.success) {
            container.appendChild(createErrorPanel(response.error || 'Failed to load data'));
            return;
        }
        
        const data = response.data;
        console.log('Report Data:', data); // For debugging
        
        container.appendChild(createHeader(data));
        container.appendChild(createContent(data));
    }).catch(error => {
        container.removeChild(loadingDiv);
        container.appendChild(createErrorPanel('Network error: ' + error.message));
    });

    // Create Error Panel
    const createErrorPanel = (message) => {
        return $({
            tag: 'div',
            style: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '16px',
                color: '#e74c3c',
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: 'solid 1px #e74c3c'
            },
            child: [
                $({ tag: 'h3', text: 'Error', style: { marginBottom: '15px', color: '#c0392b' } }),
                $({ tag: 'p', text: message, style: { marginBottom: '20px' } }),
                $({
                    tag: 'button',
                    text: 'Close',
                    style: {
                        padding: '8px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    },
                    event: {
                        type: 'click',
                        method: () => { if (panel) panel.remove(); }
                    }
                })
            ]
        });
    };

    // Create Header with Back Button and Export
    const createHeader = (data) => {
        return $({
            tag: 'div',
            style: {
                height: '60px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '0 25px',
                boxSizing: 'border-box',
                borderBottom: 'solid 3px #3498db'
            },
            child: [
                // Back button
                $({
                    tag: 'button',
                    style: {
                        padding: '8px 16px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    },
                    child: [
                        $({ tag: 'span', att: { className: 'fa-solid fa-arrow-left' }, style: { fontSize: '14px' } }),
                        $({ tag: 'span', text: 'Back' })
                    ],
                    event: {
                        type: 'click',
                        method: () => { if (panel) panel.remove(); }
                    }
                }),
                // Title - DYNAMIC from database
                $({
                    tag: 'div',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white',
                        fontFamily: 'Calibri, Arial, sans-serif'
                    }
                }),
                // Export buttons
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px' },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-file-excel' } }),
                                $({ tag: 'span', text: 'Export to Excel' })
                            ],
                            event: { type: 'click', method: () => exportToExcel(data) }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#e67e22',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-file-pdf' } }),
                                $({ tag: 'span', text: 'Export to PDF' })
                            ],
                            event: { type: 'click', method: () => exportToPDF(data) }
                        })
                    ]
                })
            ]
        });
    };

    // Create Main Content - EXACT EXCEL FORMAT
    const createContent = (data) => {
        if (!data) return $({ tag: 'div', text: 'No data available' });
        
        const contentDiv = $({
            tag: 'div',
            style: {
                flex: 1,
                width: '100%',
                overflow: 'auto',
                padding: '20px',
                boxSizing: 'border-box',
                backgroundColor: '#f5f5f5'
            }
        });

        // Main wrapper
        const wrapper = $({
            tag: 'div',
            style: {
                width: '100%',
                minWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'white',
                padding: '30px',
                boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                border: 'solid 1px #ddd'
            }
        });

        // ============ HEADER SECTION - DYNAMIC EVENT TITLE ============
        wrapper.appendChild($({
            tag: 'div',
            style: {
                fontSize: '25px',
                fontWeight: 'bold',
                color: '#000',
                textAlign: 'center',
                marginBottom: '5px',
                fontFamily: 'Quattrocento Sans',
                fontWeight: 'bold',
                textTransform: 'uppercase'
            },
            text: data.event?.name || data.event?.title
        }));

        wrapper.appendChild($({
            tag: 'div',
            style: {
                fontSize: '19px',
                fontWeight: 'bold',
                color: '#000',
                textAlign: 'center',
                marginBottom: '25px',
                fontFamily: 'Quattrocento Sans',
                fontWeight: 'bold',
                textTransform: 'uppercase'
            },
            text: `${data.category?.type || 'CATEGORY'}: ${data.category?.name || ''}`
        }));

        // Get document columns from the first evaluator
        let documentColumns = [];
        let documentTitles = {};
        
        if (data.evaluators && data.evaluators.length > 0 && data.evaluators[0].documents) {
            const documents = Object.values(data.evaluators[0].documents);
            documents.sort((a, b) => a.column - b.column);
            
            documents.forEach(doc => {
                documentColumns.push(doc.column);
                documentTitles[doc.id] = doc.title;
            });
        }
        
        // ============ EVALUATOR SHEETS ============
        if (data.evaluators && Array.isArray(data.evaluators)) {
            data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                const evaluator = evaluatorSheet.evaluator;
                
                // Evaluator Header
                wrapper.appendChild($({
                    tag: 'div',
                    style: {
                        fontSize: '19px',
                        fontWeight: 'bold',
                        color: '#000',
                        marginTop: evalIndex > 0 ? '30px' : '10px',
                        marginBottom: '5px',
                        fontFamily: 'Quattrocento Sans',
                        fontWeight: 'bold'
                    },
                    text: `Evaluator ${evaluator.number}: ${evaluator.name}`
                }));

                wrapper.appendChild($({
                    tag: 'div',
                    style: {
                        fontSize: '25px',
                        fontWeight: 'bold',
                        color: '#000',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        fontFamily: 'Quattrocento Sans'
                    },
                    text: 'Score Sheet'
                }));

                // ============ CRITERIA ROW (Column Headers) ============
                const criteriaRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderTop: 'solid 2px #000',
                        borderLeft: 'solid 1px #000',
                        borderRight: 'solid 1px #000',
                        // THREE COLOR CYCLING BASED ON EVALUATOR INDEX
                        backgroundColor: evalIndex % 3 === 0 ? '#b4c6e7' : evalIndex % 3 === 1 ? '#a8d08d' : '#ffd965',      
                        fontWeight: 'bold'
                    }
                });

                // CRITERIA cell
                criteriaRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: '299px',
                        padding: '8px 5px',
                        borderRight: 'solid 1px #000',
                        borderBottom: 'solid 1px #000',
                        fontSize: '20px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        // THREE COLOR CYCLING BASED ON EVALUATOR INDEX
                        backgroundColor: evalIndex % 3 === 0 ? '#b4c6e7' : evalIndex % 3 === 1 ? '#a8d08d' : '#ffd965',   
                    },
                    text: 'CRITERIA'
                }));

                // Column numbers (1, 2, 3...)
                documentColumns.forEach((col) => {
                    criteriaRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: '80px',
                            padding: '8px 2px',
                            borderRight: 'solid 1px #000',
                            borderBottom: 'solid 1px #000',
                            textAlign: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontFamily: 'Quattrocento Sans',
                            // THREE COLOR CYCLING BASED ON EVALUATOR INDEX
                            backgroundColor: evalIndex % 3 === 0 ? '#b4c6e7' : evalIndex % 3 === 1 ? '#a8d08d' : '#ffd965', 
                        },
                        text: col
                    }));
                });
                wrapper.appendChild(criteriaRow);

                // ============ TITLE ROW ============
                const titleRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderLeft: 'solid 1px #000',
                        borderRight: 'solid 1px #000',
                        backgroundColor: '#f9f9f9'
                    }
                });

                titleRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: '299px',
                        padding: '8px 5px',
                        borderRight: 'solid 1px #000',
                        borderBottom: 'solid 1px #000',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: '#f9f9f9',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    },
                    text: 'TITLE'
                }));

                // Document titles
                const documents = Object.values(evaluatorSheet.documents || {});
                documents.sort((a, b) => a.column - b.column);
                
                documents.forEach((doc) => {
                    titleRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: '80px',
                            padding: '8px 2px',
                            borderRight: 'solid 1px #000',
                            borderBottom: 'solid 1px #000',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontFamily: 'Times New Roman',
                            wordWrap: 'break-word',  
                            whiteSpace: 'normal',         
                            overflow: 'visible',
                            color: '#325BBA',
                            backgroundColor: '#f9f9f9'
                        },
                        att: { title: doc.title },
                        text: doc.title  
                    }))
                })
                wrapper.appendChild(titleRow);

                // ============ CRITERIA SCORE ROWS ============
                if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                    evaluatorSheet.criteria_rows.forEach((criteriaRow, critIndex) => {
                        const scoreRow = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: '100%',
                                borderLeft: 'solid 1px #000',
                                borderRight: 'solid 1px #000',
                                backgroundColor: critIndex % 2 === 0 ? '#fff' : '#f9f9f9'
                            }
                        });

                        // Criteria name with percentage
                        const criteriaName = criteriaRow.percentage 
                            ? `${criteriaRow.name}` 
                            : criteriaRow.name;
                        
                        scoreRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: '299px',
                                padding: '8px 5px',
                                borderRight: 'solid 1px #000',
                                borderBottom: critIndex === evaluatorSheet.criteria_rows.length - 1 ? 'solid 2px #000' : 'solid 1px #000',
                                fontSize: '14px',
                                fontFamily: 'Arial Narrow',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                wordWrap: 'break-word',
                                overflow: 'visible',
                                textOverflow: 'ellipsis'
                            },
                            att: { title: criteriaName },
                            text: criteriaName
                        }));

                        // Scores for each document - USE criteriaRow.scores DIRECTLY
                        const scores = criteriaRow.scores || {};
                        
                        documents.forEach((doc) => {
                            // Get score by column number
                            const score = scores[doc.column] !== undefined ? scores[doc.column] : 0;
                            
                            scoreRow.appendChild($({
                                tag: 'div',
                                style: {
                                    width: '80px',
                                    padding: '8px 2px',
                                    borderRight: 'solid 1px #000',
                                    borderBottom: critIndex === evaluatorSheet.criteria_rows.length - 1 ? 'solid 2px #000' : 'solid 1px #000',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontFamily: 'Times New Roman',
                                },
                                text: score > 0 
                                    ? (Number.isInteger(score) ? score : score.toFixed(1)) 
                                    : '0'
                            }));
                        });
                        
                        wrapper.appendChild(scoreRow);
                    });
                }
                // ============ TOTAL ROW ============
                const totalRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderLeft: 'solid 1px #000',
                        borderRight: 'solid 1px #000',
                        borderBottom: 'solid 2px #000',
                        backgroundColor: '#ffffff',
                        fontWeight: 'bold'
                    }
                });

                totalRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: '299px',
                        padding: '8px 5px',
                        borderRight: 'solid 1px #000',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        fontFamily: 'Times New Roman',
                        backgroundColor: '#ffffff'
                    },
                    text: 'Total'
                }));

                documents.forEach((doc) => {
                    totalRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: '80px',
                            padding: '8px 2px',
                            borderRight: 'solid 1px #000',
                            textAlign: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontFamily: 'Times New Roman',
                            backgroundColor: '#ffffff'
                        },
                        text: (doc.total_score || 0).toFixed(1)
                    }));
                });
                wrapper.appendChild(totalRow);

                // Add spacing between evaluators
                wrapper.appendChild($({
                    tag: 'div',
                    style: { height: '30px', width: '100%' }
                }));
            });
        }

        // ============ QUALITY OF PRESENTATION SUMMARY ROW ============
        if (data.quality_presentation_row) {
            wrapper.appendChild($({
                tag: 'div',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#000',
                    marginTop: '20px',
                    marginBottom: '10px',
                    fontFamily: 'Calibri, Arial, sans-serif'
                },
                text: 'Quality of Presentation'
            }));

            const qpRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    borderTop: 'solid 2px #FFFF00',
                    borderLeft: 'solid 1px #FFFF00',
                    borderRight: 'solid 1px #FFFF00',
                    borderBottom: 'solid 1px #FFFF00',
                    backgroundColor: '#FFFF00',
                    fontWeight: 'bold'
                }
            });

            qpRow.appendChild($({
                tag: 'div',
                style: {
                    width: '299px',
                    padding: '8px 5px',
                    borderRight: 'solid 1px #FFFF00',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    fontFamily: 'Quattrocento Sans',
                    backgroundColor: '#FFFF00'
                },
                text: 'Quality of Presentation'
            }));

            documentColumns.forEach((col) => {
                const score = data.quality_presentation_row.scores[col] || 0;
                qpRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: '80px',
                        padding: '8px 2px',
                        borderRight: 'solid 1px #FFFF00',
                        textAlign: 'center',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: '#FFFF00'
                    },
                    text: score.toFixed(1)
                }));
            });
            wrapper.appendChild(qpRow);
        }

        // ============ RANK ROW ============
        if (data.rankings && data.rankings.length > 0) {
            const rankRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    borderLeft: 'solid 1px #FFA500',
                    borderRight: 'solid 1px #FFA500',
                    borderBottom: 'solid 2px #FFA500',
                    backgroundColor: '#FFA500',
                    fontWeight: 'bold'
                }
            });

            rankRow.appendChild($({
                tag: 'div',
                style: {
                    width: '299px',
                    padding: '8px 5px',
                    borderRight: 'solid 1px #FFA500',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontFamily: 'Quattrocento Sans',
                    backgroundColor: '#FFA500'
                },
                text: 'RANK'
            }));

            // Create a map of column to rank
            const rankMap = {};
            data.rankings.forEach(item => {
                rankMap[item.column] = item.rank;
            });

            documentColumns.forEach((col) => {
                rankRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: '80px',
                        padding: '8px 2px',
                        borderRight: 'solid 1px #FFA500',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: '#FFA500'
                    },
                    text: rankMap[col] !== undefined ? rankMap[col] : ''
                }));
            });
            wrapper.appendChild(rankRow);
        }

        contentDiv.appendChild(wrapper);
        return contentDiv;
    };

    // ============ EXPORT TO EXCEL WITH FULL STYLING - FIXED ============
    const exportToExcel = (data) => {
        if (!XLSX) {
            alert('Excel export library not loaded. Please refresh the page.');
            return;
        }

        if (!data || !data.evaluators || data.evaluators.length === 0) {
            alert('No data available to export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Create worksheet data
            let wsData = [];
            
            // Title - DYNAMIC from database
            wsData.push([data.event?.name || '36TH IN-HOUSE REVIEW']);
            wsData.push([`${data.category?.type || 'CATEGORY'}: ${data.category?.name || ''}`]);
            wsData.push([]);
            
            // Get document columns from first evaluator
            let documentColumns = [];
            let documentsList = [];
            
            if (data.evaluators && data.evaluators.length > 0 && data.evaluators[0].documents) {
                const docs = Object.values(data.evaluators[0].documents);
                docs.sort((a, b) => a.column - b.column);
                docs.forEach(doc => {
                    documentColumns.push(doc.column);
                    documentsList.push(doc);
                });
            }
            
            // Process each evaluator
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    const evaluator = evaluatorSheet.evaluator;
                    
                    wsData.push([`Evaluator ${evaluator.number}: ${evaluator.name}`]);
                    wsData.push(['Score Sheet']);
                    wsData.push([]);
                    
                    // Header row with column numbers
                    let headerRow = ['CRITERIA'];
                    documentColumns.forEach(col => headerRow.push(col));
                    wsData.push(headerRow);
                    
                    // Title row - WITH FULL TEXT
                    let titleRow = ['TITLE'];
                    const documents = Object.values(evaluatorSheet.documents || {});
                    documents.sort((a, b) => a.column - b.column);
                    documents.forEach(doc => titleRow.push(doc.title));
                    wsData.push(titleRow);
                    
                    // Criteria rows
                    if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                        evaluatorSheet.criteria_rows.forEach((criteriaRow) => {
                            let row = [];
                            
                            // Criteria name without percentage in parentheses
                            const criteriaName = criteriaRow.percentage 
                                ? `${criteriaRow.name}` 
                                : criteriaRow.name;
                            row.push(criteriaName);
                            
                            const scores = criteriaRow.scores || {};
                            
                            documents.forEach(doc => {
                                const score = scores[doc.column] !== undefined ? scores[doc.column] : 0;
                                row.push(score > 0 
                                    ? (Number.isInteger(score) ? score : parseFloat(score.toFixed(1))) 
                                    : 0);
                            });
                            wsData.push(row);
                        });
                    }
                    
                    // Total row
                    let totalRow = ['Total'];
                    documents.forEach(doc => totalRow.push(parseFloat((doc.total_score || 0).toFixed(1))));
                    wsData.push(totalRow);
                    wsData.push([]);
                    wsData.push([]);
                });
            }
            
            // Quality of Presentation row
            if (data.quality_presentation_row) {
                wsData.push(['Quality of Presentation']);
                let qpRow = ['Quality of Presentation'];
                documentColumns.forEach(col => {
                    qpRow.push(parseFloat((data.quality_presentation_row.scores[col] || 0).toFixed(1)));
                });
                wsData.push(qpRow);
                wsData.push([]);
            }
            
            // Rank row
            if (data.rankings) {
                const rankMap = {};
                data.rankings.forEach(item => {
                    rankMap[item.column] = item.rank;
                });
                
                let rankRow = ['RANK'];
                documentColumns.forEach(col => {
                    rankRow.push(rankMap[col] || '');
                });
                wsData.push(rankRow);
            }
            
            // FIX: Ensure we have data before creating worksheet
            if (wsData.length < 3) {
                throw new Error('No data to export');
            }
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // ============ APPLY EXCEL STYLING ============
            
            // Calculate column widths
            const colWidths = [
                { wch: 50 }, // CRITERIA/TITLE column - WIDER for wrapped text
                ...documentColumns.map(() => ({ wch: 30 })) // Document columns - WIDER for wrapped titles
            ];
            ws['!cols'] = colWidths;
            
            // Track rows for styling
            let currentRow = 0;
            
            // Style main title (row 0)
            if (wsData[0] && wsData[0][0]) {
                const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
                ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[0][0] };
                ws[cellRef].s = {
                    font: { bold: true, sz: 20, name: 'Quattrocento Sans' },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
            currentRow++;
            
            // Style category title (row 1)
            if (wsData[1] && wsData[1][0]) {
                const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
                ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[1][0] };
                ws[cellRef].s = {
                    font: { bold: true, sz: 18, name: 'Quattrocento Sans' },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
            currentRow += 2; // Skip empty row
            
            // Process each evaluator section
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    // Evaluator header
                    if (wsData[currentRow] && wsData[currentRow][0]) {
                        const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
                        ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[currentRow][0] };
                        ws[cellRef].s = {
                            font: { bold: true, sz: 16, name: 'Quattrocento Sans', color: { rgb: 'FFFFFF' } },
                            fill: { fgColor: { rgb: '2C3E50' } },
                            alignment: { horizontal: 'left', vertical: 'center' }
                        };
                    }
                    currentRow++;
                    
                    // "Score Sheet" text
                    if (wsData[currentRow] && wsData[currentRow][0]) {
                        const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
                        ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[currentRow][0] };
                        ws[cellRef].s = {
                            font: { bold: true, sz: 20, name: 'Quattrocento Sans' },
                            alignment: { horizontal: 'center', vertical: 'center' }
                        };
                    }
                    currentRow++;
                    
                    // Skip empty row
                    currentRow++;
                    
                    // HEADER ROW (CRITERIA, 1,2,3...)
                    const headerRowIndex = currentRow;
                    
                    // Get color for header based on evaluator index
                    const headerColor = evalIndex % 3 === 0 ? 'B4C6E7' : 
                                    evalIndex % 3 === 1 ? 'A8D08D' : 
                                    'FFD965';
                    
                    // CRITERIA cell in header
                    if (wsData[headerRowIndex] && wsData[headerRowIndex][0]) {
                        const criteriaHeaderCell = XLSX.utils.encode_cell({ r: headerRowIndex, c: 0 });
                        ws[criteriaHeaderCell] = ws[criteriaHeaderCell] || { t: 's', v: 'CRITERIA' };
                        ws[criteriaHeaderCell].s = {
                            font: { bold: true, sz: 18, name: 'Quattrocento Sans' },
                            fill: { fgColor: { rgb: headerColor } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                top: { style: 'medium', color: { rgb: '000000' } },
                                bottom: { style: 'thin', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        };
                    }
                    
                    // Column numbers (1, 2, 3...)
                    documentColumns.forEach((col, colIndex) => {
                        if (wsData[headerRowIndex] && wsData[headerRowIndex][colIndex + 1] !== undefined) {
                            const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex + 1 });
                            ws[cellRef] = ws[cellRef] || { t: 'n', v: col };
                            ws[cellRef].s = {
                                font: { bold: true, sz: 18, name: 'Quattrocento Sans' },
                                fill: { fgColor: { rgb: headerColor } },
                                alignment: { horizontal: 'center', vertical: 'center' },
                                border: {
                                    top: { style: 'medium', color: { rgb: '000000' } },
                                    bottom: { style: 'thin', color: { rgb: '000000' } },
                                    left: { style: 'thin', color: { rgb: '000000' } },
                                    right: { style: 'thin', color: { rgb: '000000' } }
                                }
                            };
                        }
                    });
                    currentRow++;
                    
                    // TITLE ROW - WITH WRAPPED TEXT
                    const titleRowIndex = currentRow;
                    const documents = Object.values(evaluatorSheet.documents || {});
                    documents.sort((a, b) => a.column - b.column);
                    
                    // TITLE cell
                    if (wsData[titleRowIndex] && wsData[titleRowIndex][0]) {
                        const titleCell = XLSX.utils.encode_cell({ r: titleRowIndex, c: 0 });
                        ws[titleCell] = ws[titleCell] || { t: 's', v: 'TITLE' };
                        ws[titleCell].s = {
                            font: { bold: true, sz: 20, name: 'Quattrocento Sans', italic: true },
                            fill: { fgColor: { rgb: 'F9F9F9' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                bottom: { style: 'thin', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        };
                    }
                    
                    // Document title cells
                    documents.forEach((doc, colIndex) => {
                        if (wsData[titleRowIndex] && wsData[titleRowIndex][colIndex + 1] !== undefined) {
                            const cellRef = XLSX.utils.encode_cell({ r: titleRowIndex, c: colIndex + 1 });
                            ws[cellRef] = ws[cellRef] || { t: 's', v: doc.title };
                            ws[cellRef].s = {
                                font: { sz: 11, name: 'Times New Roman', color: { rgb: '325BBA' } },
                                alignment: { 
                                    horizontal: 'center', 
                                    vertical: 'center',
                                    wrapText: true
                                },
                                fill: { fgColor: { rgb: 'F9F9F9' } },
                                border: {
                                    bottom: { style: 'thin', color: { rgb: '000000' } },
                                    left: { style: 'thin', color: { rgb: '000000' } },
                                    right: { style: 'thin', color: { rgb: '000000' } }
                                }
                            };
                        }
                    });
                    
                    // Set row height for title row
                    if (!ws['!rows']) ws['!rows'] = [];
                    ws['!rows'][titleRowIndex] = ws['!rows'][titleRowIndex] || {};
                    ws['!rows'][titleRowIndex].hpt = 45;
                    currentRow++;
                    
                    // CRITERIA SCORE ROWS
                    if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                        evaluatorSheet.criteria_rows.forEach((criteriaRow, critIndex) => {
                            const rowIndex = currentRow;
                            
                            // Background color - alternating white/gray
                            const bgColor = critIndex % 2 === 0 ? 'FFFFFF' : 'F9F9F9';
                            
                            // Criteria name cell
                            if (wsData[rowIndex] && wsData[rowIndex][0] !== undefined) {
                                const criteriaCell = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
                                const criteriaName = criteriaRow.percentage 
                                    ? `${criteriaRow.name}` 
                                    : criteriaRow.name;
                                
                                ws[criteriaCell] = ws[criteriaCell] || { t: 's', v: criteriaName };
                                ws[criteriaCell].s = {
                                    font: { bold: true, sz: 13, name: 'Arial Narrow' },
                                    fill: { fgColor: { rgb: bgColor } },
                                    alignment: { horizontal: 'left', vertical: 'center' },
                                    border: {
                                        bottom: critIndex === evaluatorSheet.criteria_rows.length - 1 
                                            ? { style: 'medium', color: { rgb: '000000' } } 
                                            : { style: 'thin', color: { rgb: '000000' } },
                                        left: { style: 'thin', color: { rgb: '000000' } },
                                        right: { style: 'thin', color: { rgb: '000000' } }
                                    }
                                };
                            }
                            
                            // Score cells
                            const scores = criteriaRow.scores || {};
                            documents.forEach((doc, colIndex) => {
                                if (wsData[rowIndex] && wsData[rowIndex][colIndex + 1] !== undefined) {
                                    const score = scores[doc.column] !== undefined ? scores[doc.column] : 0;
                                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex + 1 });
                                    
                                    ws[cellRef] = ws[cellRef] || { 
                                        t: 'n', 
                                        v: score > 0 ? (Number.isInteger(score) ? score : parseFloat(score.toFixed(1))) : 0 
                                    };
                                    
                                    ws[cellRef].s = {
                                        font: { sz: 13, name: 'Times New Roman' },
                                        fill: { fgColor: { rgb: bgColor } },
                                        alignment: { horizontal: 'center', vertical: 'center' },
                                        border: {
                                            bottom: critIndex === evaluatorSheet.criteria_rows.length - 1 
                                                ? { style: 'medium', color: { rgb: '000000' } } 
                                                : { style: 'thin', color: { rgb: '000000' } },
                                            left: { style: 'thin', color: { rgb: '000000' } },
                                            right: { style: 'thin', color: { rgb: '000000' } }
                                        }
                                    };
                                }
                            });
                            
                            currentRow++;
                        });
                    }
                    
                    // TOTAL ROW
                    const totalRowIndex = currentRow;
                    
                    // Total label cell
                    if (wsData[totalRowIndex] && wsData[totalRowIndex][0] !== undefined) {
                        const totalLabelCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 });
                        ws[totalLabelCell] = ws[totalLabelCell] || { t: 's', v: 'Total' };
                        ws[totalLabelCell].s = {
                            font: { bold: true, sz: 18, name: 'Times New Roman' },
                            fill: { fgColor: { rgb: 'FFFFFF' } },
                            alignment: { horizontal: 'left', vertical: 'center' },
                            border: {
                                bottom: { style: 'medium', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        };
                    }
                    
                    // Total score cells
                    documents.forEach((doc, colIndex) => {
                        if (wsData[totalRowIndex] && wsData[totalRowIndex][colIndex + 1] !== undefined) {
                            const cellRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex + 1 });
                            ws[cellRef] = ws[cellRef] || { t: 'n', v: parseFloat((doc.total_score || 0).toFixed(1)) };
                            ws[cellRef].s = {
                                font: { bold: true, sz: 18, name: 'Times New Roman' },
                                fill: { fgColor: { rgb: 'FFFFFF' } },
                                alignment: { horizontal: 'center', vertical: 'center' },
                                border: {
                                    bottom: { style: 'medium', color: { rgb: '000000' } },
                                    left: { style: 'thin', color: { rgb: '000000' } },
                                    right: { style: 'thin', color: { rgb: '000000' } }
                                }
                            };
                        }
                    });
                    currentRow += 3; // Skip empty rows
                });
            }
            
            // Style Quality of Presentation row
            if (data.quality_presentation_row) {
                // Quality of Presentation label row
                if (wsData[currentRow] && wsData[currentRow][0]) {
                    const qpLabelRowCell = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
                    ws[qpLabelRowCell] = ws[qpLabelRowCell] || { t: 's', v: 'Quality of Presentation' };
                    ws[qpLabelRowCell].s = {
                        font: { bold: true, sz: 13, name: 'Quattrocento Sans' },
                        alignment: { horizontal: 'left', vertical: 'center' }
                    };
                }
                currentRow++;
                
                // QP data row
                const qpDataRowIndex = currentRow;
                
                // QP Label cell
                if (wsData[qpDataRowIndex] && wsData[qpDataRowIndex][0]) {
                    const qpLabelCell = XLSX.utils.encode_cell({ r: qpDataRowIndex, c: 0 });
                    ws[qpLabelCell] = ws[qpLabelCell] || { t: 's', v: 'Quality of Presentation' };
                    ws[qpLabelCell].s = {
                        font: { bold: true, sz: 14, name: 'Quattrocento Sans' },
                        fill: { fgColor: { rgb: 'FFFF00' } },
                        alignment: { horizontal: 'left', vertical: 'center' },
                        border: {
                            top: { style: 'medium', color: { rgb: 'FFFF00' } },
                            bottom: { style: 'thin', color: { rgb: 'FFFF00' } },
                            left: { style: 'thin', color: { rgb: 'FFFF00' } },
                            right: { style: 'thin', color: { rgb: 'FFFF00' } }
                        }
                    };
                }
                
                // QP Score cells
                documentColumns.forEach((col, colIndex) => {
                    if (wsData[qpDataRowIndex] && wsData[qpDataRowIndex][colIndex + 1] !== undefined) {
                        const score = data.quality_presentation_row.scores[col] || 0;
                        const cellRef = XLSX.utils.encode_cell({ r: qpDataRowIndex, c: colIndex + 1 });
                        ws[cellRef] = ws[cellRef] || { t: 'n', v: parseFloat(score.toFixed(1)) };
                        ws[cellRef].s = {
                            font: { bold: true, sz: 14, name: 'Quattrocento Sans' },
                            fill: { fgColor: { rgb: 'FFFF00' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                top: { style: 'medium', color: { rgb: 'FFFF00' } },
                                bottom: { style: 'thin', color: { rgb: 'FFFF00' } },
                                left: { style: 'thin', color: { rgb: 'FFFF00' } },
                                right: { style: 'thin', color: { rgb: 'FFFF00' } }
                            }
                        };
                    }
                });
                currentRow += 2;
            }
            
            // Style Rank row
            if (data.rankings) {
                const rankMap = {};
                data.rankings.forEach(item => {
                    rankMap[item.column] = item.rank;
                });
                
                const rankRowIndex = currentRow;
                
                // Rank Label cell
                if (wsData[rankRowIndex] && wsData[rankRowIndex][0]) {
                    const rankLabelCell = XLSX.utils.encode_cell({ r: rankRowIndex, c: 0 });
                    ws[rankLabelCell] = ws[rankLabelCell] || { t: 's', v: 'RANK' };
                    ws[rankLabelCell].s = {
                        font: { bold: true, sz: 17, name: 'Quattrocento Sans' },
                        fill: { fgColor: { rgb: 'FFA500' } },
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            bottom: { style: 'medium', color: { rgb: 'FFA500' } },
                            left: { style: 'thin', color: { rgb: 'FFA500' } },
                            right: { style: 'thin', color: { rgb: 'FFA500' } }
                        }
                    };
                }
                
                // Rank value cells
                documentColumns.forEach((col, colIndex) => {
                    if (wsData[rankRowIndex] && wsData[rankRowIndex][colIndex + 1] !== undefined) {
                        const cellRef = XLSX.utils.encode_cell({ r: rankRowIndex, c: colIndex + 1 });
                        ws[cellRef] = ws[cellRef] || { t: 's', v: rankMap[col] || '' };
                        ws[cellRef].s = {
                            font: { bold: true, sz: 17, name: 'Quattrocento Sans' },
                            fill: { fgColor: { rgb: 'FFA500' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                bottom: { style: 'medium', color: { rgb: 'FFA500' } },
                                left: { style: 'thin', color: { rgb: 'FFA500' } },
                                right: { style: 'thin', color: { rgb: 'FFA500' } }
                            }
                        };
                    }
                });
            }
            
            // FIX: Make sure we append the sheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Summary Report');
            
            // Save the file
            const eventNameForFile = data.event?.name?.replace(/[^a-z0-9]/gi, '_') || 'Event';
            const fileName = `${eventNameForFile}_${data.category?.name?.replace(/[^a-z0-9]/gi, '_') || 'Summary'}_Report.xlsx`;
            XLSX.writeFile(wb, fileName);
            
        } catch (error) {
            console.error('Excel export error:', error);
            alert('Error exporting to Excel: ' + error.message);
        }
    };

    // ============ EXPORT TO PDF WITH FULL STYLING - FIXED ============
    const exportToPDF = (data) => {
        if (!jsPDF) {
            alert('PDF export library not loaded. Please refresh the page.');
            return;
        }

        try {
            // A4 Landscape dimensions: 297mm x 210mm
            const doc = new jsPDF({ 
                orientation: 'landscape', 
                unit: 'mm', 
                format: 'a4'
            });
            
            // Set default font to Quattrocento Sans
            doc.setFont('Quattrocento Sans');
            
            // Page dimensions
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            
            // Title - CENTERED
            doc.setFontSize(22);
            doc.setFont('Quattrocento Sans', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(data.event?.name || '36TH IN-HOUSE REVIEW', pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(20);
            doc.text(`${data.category?.type || 'CATEGORY'}: ${data.category?.name || ''}`, pageWidth / 2, 30, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setFont('Quattrocento Sans', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' });
            
            let yPos = 50;
            
            // Get document columns
            let documentColumns = [];
            if (data.evaluators && data.evaluators.length > 0 && data.evaluators[0].documents) {
                const docs = Object.values(data.evaluators[0].documents);
                docs.sort((a, b) => a.column - b.column);
                docs.forEach(doc => {
                    documentColumns.push(doc.column);
                });
            }
            
            // Calculate column widths for better fit
            const criteriaColWidth = 55;
            const scoreColWidth = 18;
            const totalTableWidth = criteriaColWidth + (documentColumns.length * scoreColWidth);
            const startX = (pageWidth - totalTableWidth) / 2; // Center the table horizontally
            
            // Process each evaluator
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    // Check if we need a new page
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    const evaluator = evaluatorSheet.evaluator;
                    
                    // Evaluator header - CENTERED
                    doc.setFontSize(16);
                    doc.setFont('Quattrocento Sans', 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Evaluator ${evaluator.number}: ${evaluator.name}`, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 8;
                    
                    // Score Sheet title - CENTERED
                    doc.setFontSize(20);
                    doc.setFont('Quattrocento Sans', 'bold');
                    doc.text('Score Sheet', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 12;
                    
                    // Prepare table data
                    const documents = Object.values(evaluatorSheet.documents || {});
                    documents.sort((a, b) => a.column - b.column);
                    
                    // Headers
                    const headers = ['CRITERIA', ...documentColumns.map(col => col.toString())];
                    
                    // Body rows
                    let body = [];
                    
                    // Title row
                    let titleRow = ['TITLE'];
                    documents.forEach(doc => titleRow.push(doc.title));
                    body.push(titleRow);
                    
                    // Criteria rows
                    if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                        evaluatorSheet.criteria_rows.forEach((criteriaRow) => {
                            let row = [];
                            const criteriaName = criteriaRow.percentage 
                                ? `${criteriaRow.name}` 
                                : criteriaRow.name;
                            row.push(criteriaName);
                            
                            const scores = criteriaRow.scores || {};
                            documents.forEach(doc => {
                                const score = scores[doc.column] !== undefined ? scores[doc.column] : 0;
                                row.push(score > 0 
                                    ? (Number.isInteger(score) ? score : score.toFixed(1)) 
                                    : '0');
                            });
                            body.push(row);
                        });
                    }
                    
                    // Total row
                    let totalRow = ['Total'];
                    documents.forEach(doc => totalRow.push((doc.total_score || 0).toFixed(1)));
                    body.push(totalRow);
                    
                    // Get header color based on evaluator index
                    let headerColor;
                    if (evalIndex % 3 === 0) headerColor = [180, 198, 231]; // #b4c6e7
                    else if (evalIndex % 3 === 1) headerColor = [168, 208, 141]; // #a8d08d
                    else headerColor = [255, 217, 101]; // #ffd965
                    
                    // Generate table - CENTERED on page
                    doc.autoTable({
                        head: [headers],
                        body: body,
                        startY: yPos,
                        margin: { left: startX, right: pageWidth - startX - totalTableWidth },
                        theme: 'grid',
                        styles: { 
                            fontSize: 9, 
                            cellPadding: 2,
                            font: 'Quattrocento Sans',
                            halign: 'center',
                            valign: 'middle',
                            lineColor: [0, 0, 0],
                            lineWidth: 0.1,
                            textColor: [0, 0, 0]
                        },
                        headStyles: { 
                            fillColor: headerColor,
                            textColor: [0, 0, 0],
                            fontStyle: 'bold',
                            halign: 'center',
                            fontSize: 14,
                            font: 'Quattrocento Sans'
                        },
                        columnStyles: {
                            0: { 
                                cellWidth: criteriaColWidth, 
                                halign: 'left',
                                fontStyle: 'bold',
                                fontSize: 10,
                                font: 'Quattrocento Sans'
                            }
                        },
                        didParseCell: function(data) {
                            // Style title row
                            if (data.row.index === 0 && data.section === 'body') {
                                if (data.column.index === 0) {
                                    data.cell.styles.fontStyle = 'bolditalic';
                                    data.cell.styles.fontSize = 12;
                                    data.cell.styles.halign = 'center';
                                    data.cell.styles.textColor = [0, 0, 0];
                                    data.cell.styles.font = 'Quattrocento Sans';
                                } else {
                                    data.cell.styles.font = 'Quattrocento Sans';
                                    data.cell.styles.fontSize = 8;
                                    data.cell.styles.textColor = [50, 91, 186];
                                    data.cell.styles.cellWidth = scoreColWidth;
                                    data.cell.styles.fontStyle = 'normal';
                                }
                            }
                            
                            // Style criteria rows
                            if (data.row.index > 0 && data.row.index < body.length - 1 && data.section === 'body') {
                                if (data.column.index === 0) {
                                    data.cell.styles.font = 'Quattrocento Sans';
                                    data.cell.styles.fontSize = 10;
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.halign = 'left';
                                    data.cell.styles.cellWidth = criteriaColWidth;
                                } else {
                                    data.cell.styles.font = 'Quattrocento Sans';
                                    data.cell.styles.fontSize = 10;
                                    data.cell.styles.fontStyle = 'normal';
                                    data.cell.styles.cellWidth = scoreColWidth;
                                }
                                
                                // Alternating row colors
                                if (data.row.index % 2 === 1) {
                                    data.cell.styles.fillColor = [255, 255, 255];
                                } else {
                                    data.cell.styles.fillColor = [249, 249, 249];
                                }
                            }
                            
                            // Style total row
                            if (data.row.index === body.length - 1 && data.section === 'body') {
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fontSize = 14;
                                data.cell.styles.font = 'Quattrocento Sans';
                                data.cell.styles.fillColor = [255, 255, 255];
                                data.cell.styles.textColor = [0, 0, 0];
                                if (data.column.index === 0) {
                                    data.cell.styles.halign = 'left';
                                    data.cell.styles.cellWidth = criteriaColWidth;
                                } else {
                                    data.cell.styles.cellWidth = scoreColWidth;
                                }
                            }
                        }
                    });
                    
                    yPos = doc.lastAutoTable.finalY + 20;
                });
            }
            
            // Quality of Presentation and Rank table
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }
            
            if (data.quality_presentation_row || data.rankings) {
                // Quality of Presentation header - CENTERED
                if (data.quality_presentation_row) {
                    doc.setFontSize(14);
                    doc.setFont('Quattrocento Sans', 'bold');
                    doc.text('Quality of Presentation', pageWidth / 2, yPos, { align: 'center' });
                    yPos += 8;
                }
                
                let summaryHeaders = ['', ...documentColumns.map(col => col.toString())];
                let summaryBody = [];
                
                // Quality of Presentation row
                if (data.quality_presentation_row) {
                    let qpRow = ['Quality of Presentation'];
                    documentColumns.forEach(col => {
                        qpRow.push((data.quality_presentation_row.scores[col] || 0).toFixed(1));
                    });
                    summaryBody.push(qpRow);
                }
                
                // Rank row
                if (data.rankings) {
                    const rankMap = {};
                    data.rankings.forEach(item => {
                        rankMap[item.column] = item.rank;
                    });
                    
                    let rankRow = ['RANK'];
                    documentColumns.forEach(col => {
                        rankRow.push(rankMap[col] || '');
                    });
                    summaryBody.push(rankRow);
                }
                
                if (summaryBody.length > 0) {
                    // Calculate summary table width and center it
                    const summaryTotalWidth = criteriaColWidth + (documentColumns.length * scoreColWidth);
                    const summaryStartX = (pageWidth - summaryTotalWidth) / 2;
                    
                    doc.autoTable({
                        head: [summaryHeaders],
                        body: summaryBody,
                        startY: yPos,
                        margin: { left: summaryStartX, right: pageWidth - summaryStartX - summaryTotalWidth },
                        theme: 'grid',
                        styles: { 
                            fontSize: 11, 
                            cellPadding: 3,
                            font: 'Quattrocento Sans',
                            halign: 'center',
                            valign: 'middle',
                            textColor: [0, 0, 0],
                            lineWidth: 0.2
                        },
                        headStyles: { 
                            fillColor: data.quality_presentation_row ? [255, 255, 0] : [255, 165, 0],
                            textColor: [0, 0, 0],
                            fontStyle: 'bold',
                            fontSize: 13,
                            font: 'Quattrocento Sans'
                        },
                        columnStyles: {
                            0: { 
                                cellWidth: criteriaColWidth, 
                                halign: 'left',
                                fontStyle: 'bold',
                                font: 'Quattrocento Sans'
                            },
                            ...Object.fromEntries(
                                documentColumns.map((_, idx) => [idx + 1, { cellWidth: scoreColWidth, font: 'Quattrocento Sans' }])
                            )
                        },
                        didParseCell: function(data) {
                            if (data.section === 'body') {
                                if (data.row.index === 0 && data.quality_presentation_row) {
                                    data.cell.styles.fillColor = [255, 255, 0];
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.fontSize = 12;
                                    data.cell.styles.font = 'Quattrocento Sans';
                                } else if (data.row.index === 1 || !data.quality_presentation_row) {
                                    data.cell.styles.fillColor = [255, 165, 0];
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.fontSize = 14;
                                    data.cell.styles.font = 'Quattrocento Sans';
                                }
                                
                                if (data.column.index === 0) {
                                    data.cell.styles.halign = 'left';
                                    data.cell.styles.cellWidth = criteriaColWidth;
                                } else {
                                    data.cell.styles.cellWidth = scoreColWidth;
                                }
                            }
                        }
                    });
                }
            }
            
            // Add footer with page numbers - CENTERED
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setFont('Quattrocento Sans', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }
            
            // Save the file
            const eventNameForFile = data.event?.name?.replace(/[^a-z0-9]/gi, '_') || 'Event';
            doc.save(`${eventNameForFile}_${data.category?.name?.replace(/[^a-z0-9]/gi, '_') || 'Summary'}_Report.pdf`);
            
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Error exporting to PDF: ' + error.message);
        }
    };

    return container;
};
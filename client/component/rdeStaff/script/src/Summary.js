import { $, Path, Request } from "../../../../lib/lib.js"
const XLSX = window.XLSX
const jsPDF = window.jspdf?.jsPDF || window.jspdf

export const Summary = (eventIdParam, categoryIdParam) => {
    let panel
    let eventId = Path(4)
    let categoryId = categoryIdParam
    
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
            backgroundColor: '#f5f7fa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        },
        elementHandler: (el) => { panel = el }
    })

    // Loading state
    const loadingDiv = $({
        tag: 'div',
        style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '16px',
            color: '#1a2a3a',
            backgroundColor: '#ffffff',
            padding: '30px 50px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e8ecf0',
                    borderTop: '4px solid #1976D2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            }),
            $({ tag: 'div', text: 'Loading summary report...', style: { color: '#64748b', fontSize: '14px' } })
        ]
    })
    container.appendChild(loadingDiv)

    // Add keyframes for spinner
    const styleEl = document.createElement('style')
    styleEl.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `
    document.head.appendChild(styleEl)

    const req = new Request('/ranking')
    req.Post([
        { name: 'generateSummaryReport', value: '1' },
        { name: 'eventId', value: eventId },
        { name: 'categoryId', value: categoryId || 0 }
    ])
    req.Json()
    
    req.Send().then(response => {
        container.removeChild(loadingDiv)
        
        if (!response.success) {
            container.appendChild(createErrorPanel(response.error || 'Failed to load data'))
            return
        }
        
        const data = response.data
        
        // Fetch final rank data
        const fetchFinalRankData = () => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/ranking', false);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            const params = new URLSearchParams({
                getFinalRank: '1',
                eventId: eventId,
                categoryId: categoryId || 0
            }).toString();
            
            xhr.send(params);
            
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        return response.data;
                    }
                } catch (e) {
                    console.error('Error parsing final rank data:', e);
                }
            }
            return null;
        };
        
        const finalRankData = fetchFinalRankData();
        
        container.appendChild(createHeader(data))
        container.appendChild(createContent(data, finalRankData))
        
    }).catch(error => {
        container.removeChild(loadingDiv)
        container.appendChild(createErrorPanel('Network error: ' + error.message))
    })

    const createErrorPanel = (message) => {
        return $({
            tag: 'div',
            style: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '14px',
                color: '#1a2a3a',
                backgroundColor: '#ffffff',
                padding: '30px 40px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                textAlign: 'center',
                border: '1px solid #fecaca'
            },
            child: [
                $({ tag: 'div', text: '⚠️', style: { fontSize: '40px', marginBottom: '12px' } }),
                $({ tag: 'h3', text: 'Error Loading Report', style: { marginBottom: '12px', color: '#1a2a3a', fontSize: '18px', fontWeight: '600' } }),
                $({ tag: 'p', text: message, style: { marginBottom: '20px', color: '#64748b', fontSize: '14px' } }),
                $({
                    tag: 'button',
                    text: 'Close',
                    style: {
                        padding: '10px 32px',
                        backgroundColor: '#1976D2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    },
                    event: {
                        type: 'click',
                        method: () => { if (panel) panel.remove() },
                        type2: 'mouseenter',
                        method2: (e) => { e.currentTarget.style.backgroundColor = '#1565C0' },
                        type3: 'mouseleave',
                        method3: (e) => { e.currentTarget.style.backgroundColor = '#1976D2' }
                    }
                })
            ]
        })
    }

    const createHeader = (data) => {
        return $({
            tag: 'div',
            style: {
                height: '64px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                color: '#1a2a3a',
                padding: '0 24px',
                boxSizing: 'border-box',
                borderBottom: '1px solid #e8ecf0',
                flexShrink: 0,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            },
            child: [
                // Back button
                $({
                    tag: 'button',
                    style: {
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#1976D2',
                        border: '1px solid #e8ecf0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    },
                    child: [
                        $({ tag: 'span', att: { className: 'fa-solid fa-arrow-left' }, style: { fontSize: '14px' } }),
                        $({ tag: 'span', text: 'Back' })
                    ],
                    event: {
                        type: 'click',
                        method: () => { if (panel) panel.remove() },
                        type2: 'mouseenter',
                        method2: (e) => { e.currentTarget.style.backgroundColor = '#f8fafc' },
                        type3: 'mouseleave',
                        method3: (e) => { e.currentTarget.style.backgroundColor = 'transparent' }
                    }
                }),
                // Title
                $({
                    tag: 'div',
                    style: {
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a2a3a',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    },
                    text: data.event?.name || 'Score Summary'
                }),
                // Export buttons
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '10px' },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 18px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background-color 0.2s'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-file-excel' } }),
                                $({ tag: 'span', text: 'Excel' })
                            ],
                            event: { 
                                type: 'click', 
                                method: () => exportToExcel(data),
                                type2: 'mouseenter',
                                method2: (e) => { e.currentTarget.style.backgroundColor = '#16a34a' },
                                type3: 'mouseleave',
                                method3: (e) => { e.currentTarget.style.backgroundColor = '#22c55e' }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 18px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'background-color 0.2s'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-file-pdf' } }),
                                $({ tag: 'span', text: 'PDF' })
                            ],
                            event: { 
                                type: 'click', 
                                method: () => exportToPDF(data),
                                type2: 'mouseenter',
                                method2: (e) => { e.currentTarget.style.backgroundColor = '#dc2626' },
                                type3: 'mouseleave',
                                method3: (e) => { e.currentTarget.style.backgroundColor = '#ef4444' }
                            }
                        })
                    ]
                })
            ]
        })
    }

    const createContent = (data, finalRankData) => {
        if (!data) return $({ tag: 'div', text: 'No data available' })
        
        const contentDiv = $({
            tag: 'div',
            style: {
                flex: 1,
                width: '100%',
                overflow: 'auto',
                padding: '24px',
                boxSizing: 'border-box',
                backgroundColor: '#f5f7fa'
            }
        })

        // Main wrapper
        const wrapper = $({
            tag: 'div',
            style: {
                width: '100%',
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                padding: '32px 40px',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid #e8ecf0'
            }
        })

        // HEADER SECTION
        wrapper.appendChild($({
            tag: 'div',
            style: {
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a2a3a',
                textAlign: 'center',
                marginBottom: '4px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                letterSpacing: '-0.5px'
            },
            text: data.event?.name || data.event?.title
        }))

        wrapper.appendChild($({
            tag: 'div',
            style: {
                fontSize: '16px',
                fontWeight: '500',
                color: '#64748b',
                textAlign: 'center',
                marginBottom: '28px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            },
            text: `${data.category?.type}: ${data.category?.name || ''}`
        }))

        // Check if we have evaluator data
        const hasEvaluatorData = data.evaluators && Array.isArray(data.evaluators) && data.evaluators.length > 0
        
        if (!hasEvaluatorData) {
            wrapper.appendChild($({
                tag: 'div',
                style: {
                    padding: '40px',
                    textAlign: 'center',
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px dashed #cbd5e1',
                    fontSize: '16px'
                },
                text: 'No evaluator data available for this category'
            }))
            contentDiv.appendChild(wrapper)
            return contentDiv
        }

        // Get document columns from the first evaluator
        let documentColumns = []
        let documentTitles = {}
        let maxTitleLength = 0
        
        // Check if the first evaluator has documents
        const firstEvaluator = data.evaluators[0]
        if (firstEvaluator.documents) {
            const documents = Object.values(firstEvaluator.documents)
            documents.sort((a, b) => a.column - b.column)
            
            documents.forEach(doc => {
                documentColumns.push(doc.column)
                documentTitles[doc.id] = doc.title
                maxTitleLength = Math.max(maxTitleLength, doc.title.length)
            })
        }
        
        const documentCount = documentColumns.length;
        const criteriaColWidth = 260;
        const baseCharWidth = 7;
        let scoreColWidth = Math.min(260, Math.max(90, maxTitleLength * baseCharWidth));
        
        if (documentCount > 10) {
            scoreColWidth = Math.min(scoreColWidth, 110);
        }
        
        const totalTableWidth = criteriaColWidth + (scoreColWidth * documentCount) + 40;

        // Helper function to get zero-score document IDs for an evaluator
        const getZeroScoreDocuments = (evaluatorSheet) => {
            const zeroScoreDocs = [];
            const documents = Object.values(evaluatorSheet.documents || {});
            documents.forEach(doc => {
                if (doc.total_score === 0 || doc.total_score === 0.0) {
                    zeroScoreDocs.push(doc.id);
                }
            });
            return zeroScoreDocs;
        };

        // EVALUATOR SHEETS
        data.evaluators.forEach((evaluatorSheet, evalIndex) => {
            const evaluator = evaluatorSheet.evaluator
            const headerColors = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#fce4ec', '#f3e5f5']
            const headerColor = headerColors[evalIndex % headerColors.length]
            
            // Get zero-score documents for this evaluator
            const zeroScoreDocIds = getZeroScoreDocuments(evaluatorSheet);
            
            // Evaluator Header
            wrapper.appendChild($({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: evalIndex > 0 ? '32px' : '8px',
                    marginBottom: '16px',
                    padding: '12px 20px',
                    backgroundColor: headerColor,
                    borderRadius: '10px',
                    border: '1px solid #e8ecf0'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#1976D2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px',
                            flexShrink: 0
                        },
                        text: evaluator.number || 'E'
                    }),
                    $({
                        tag: 'div',
                        style: {
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1a2a3a',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        text: `Evaluator ${evaluator.number}: ${evaluator.name}`
                    })
                ]
            }))

            // Get documents for this evaluator
            const documents = Object.values(evaluatorSheet.documents || {})
            documents.sort((a, b) => a.column - b.column)
            
            // If no documents, skip this evaluator
            if (documents.length === 0) {
                wrapper.appendChild($({
                    tag: 'div',
                    style: {
                        padding: '16px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1',
                        marginBottom: '12px',
                        fontSize: '13px'
                    },
                    text: 'No scored documents for this evaluator'
                }))
                return
            }

            const totalRowWidth = criteriaColWidth + (scoreColWidth * documentCount);

            const tableContainer = $({
                tag: 'div',
                style: {
                    width: '100%',
                    overflow: 'auto',
                    borderRadius: '10px',
                    border: '1px solid #e8ecf0',
                    backgroundColor: '#ffffff',
                    WebkitOverflowScrolling: 'touch',
                    maxWidth: '100%'
                }
            });

            // Inner container to prevent shrinking
            const tableInner = $({
                tag: 'div',
                style: {
                    minWidth: `${totalRowWidth}px`,
                    width: '100%'
                }
            });

            // ===== HEADER ROW =====
            const headerRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: headerColor,
                    borderBottom: '2px solid #e8ecf0',
                    fontWeight: '600'
                }
            })

            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${criteriaColWidth}px`,
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#1a2a3a',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    borderRight: '1px solid rgba(0,0,0,0.08)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                text: 'CRITERIA'
            }))

            documentColumns.forEach((col, colIndex) => {
                headerRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${scoreColWidth}px`,
                        padding: '10px 6px',
                        fontSize: '13px',
                        color: '#1a2a3a',
                        fontWeight: '600',
                        textAlign: 'center',
                        flexShrink: 0,
                        borderRight: colIndex < documentColumns.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    },
                    text: col
                }))
            })
            tableInner.appendChild(headerRow)

            // ===== TITLE ROW =====
            const titleRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#fafbfc',
                    borderBottom: '1px solid #e8ecf0'
                }
            })

            titleRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${criteriaColWidth}px`,
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#1976D2',
                    flexShrink: 0,
                    borderRight: '1px solid #e8ecf0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                text: 'TITLE'
            }))

            documents.forEach((doc, docIndex) => {
                const isZeroScore = zeroScoreDocIds.includes(doc.id);
                titleRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${scoreColWidth}px`,
                        padding: '8px 6px',
                        textAlign: 'center',
                        fontSize: scoreColWidth > 110 ? '11px' : '10px',
                        color: isZeroScore ? '#721c24' : '#1976D2',
                        fontWeight: isZeroScore ? '700' : '500',
                        flexShrink: 0,
                        borderRight: docIndex < documents.length - 1 ? '1px solid #e8ecf0' : 'none',
                        wordWrap: 'break-word',
                        lineHeight: '1.3',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        backgroundColor: isZeroScore ? '#f8d7da' : 'transparent',
                        borderRadius: isZeroScore ? '4px' : '0'
                    },
                    att: { title: doc.title },
                    text: doc.title 
                }))
            })
            tableInner.appendChild(titleRow)

            // ===== CRITERIA SCORE ROWS =====
            if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                evaluatorSheet.criteria_rows.forEach((criteriaRow, critIndex) => {
                    const scoreRow = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            backgroundColor: critIndex % 2 === 0 ? '#ffffff' : '#fafbfc',
                            borderBottom: '1px solid #f0f2f5'
                        }
                    })

                    const criteriaName = criteriaRow.percentage 
                        ? `${criteriaRow.name}` 
                        : criteriaRow.name
                    
                    scoreRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${criteriaColWidth}px`,
                            padding: '8px 14px',
                            fontSize: '13px',
                            color: '#1a2a3a',
                            fontWeight: '500',
                            flexShrink: 0,
                            borderRight: '1px solid #f0f2f5',
                            wordWrap: 'break-word',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        att: { title: criteriaName },
                        text: criteriaName
                    }))

                    const scores = criteriaRow.scores || {}
                    
                    documents.forEach((doc, docIndex) => {
                        const score = scores[doc.column] !== undefined ? scores[doc.column] : 0
                        const isZeroScore = zeroScoreDocIds.includes(doc.id);
                        
                        scoreRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${scoreColWidth}px`,
                                padding: '8px 6px',
                                textAlign: 'center',
                                fontSize: '14px',
                                color: isZeroScore ? '#721c24' : '#1a2a3a',
                                flexShrink: 0,
                                borderRight: docIndex < documents.length - 1 ? '1px solid #f0f2f5' : 'none',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                backgroundColor: isZeroScore ? '#f8d7da' : 'transparent',
                                borderRadius: isZeroScore ? '4px' : '0',
                                fontWeight: isZeroScore ? '700' : '400'
                            },
                            text: score > 0 
                                ? (Number.isInteger(score) ? score : score.toFixed(1)) 
                                : '0'
                        }))
                    })
                    
                    tableInner.appendChild(scoreRow)
                })
            }
            
            // ===== TOTAL ROW =====
            const totalRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#f8fafc',
                    borderTop: '2px solid #e8ecf0',
                    fontWeight: '600'
                }
            })

            totalRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${criteriaColWidth}px`,
                    padding: '10px 14px',
                    fontSize: '14px',
                    color: '#1a2a3a',
                    fontWeight: '700',
                    flexShrink: 0,
                    borderRight: '1px solid #e8ecf0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                text: 'Total'
            }))

            documents.forEach((doc, docIndex) => {
                const isZeroScore = zeroScoreDocIds.includes(doc.id);
                const totalScore = doc.total_score || 0;
                
                totalRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${scoreColWidth}px`,
                        padding: '10px 6px',
                        textAlign: 'center',
                        fontSize: '15px',
                        fontWeight: '700',
                        color: isZeroScore ? '#721c24' : '#1976D2',
                        flexShrink: 0,
                        borderRight: docIndex < documents.length - 1 ? '1px solid #e8ecf0' : 'none',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        backgroundColor: isZeroScore ? '#f8d7da' : 'transparent',
                        borderRadius: isZeroScore ? '4px' : '0'
                    },
                    text: totalScore.toFixed(1)
                }))
            })
            tableInner.appendChild(totalRow)
            
            // ===== RANK ROW (per evaluator) =====
            if (evaluatorSheet.rank_row) {
                const rankRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        backgroundColor: '#fff8e1',
                        borderTop: '1px solid #e8ecf0',
                        fontWeight: '600'
                    }
                })

                rankRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${criteriaColWidth}px`,
                        padding: '10px 14px',
                        fontSize: '14px',
                        color: '#e65100',
                        fontWeight: '700',
                        flexShrink: 0,
                        borderRight: '1px solid #e8ecf0',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    },
                    text: 'Rank'
                }))

                documents.forEach((doc, docIndex) => {
                    const rankValue = evaluatorSheet.rank_row[doc.column] || ''
                    const isTop = rankValue === 1 || rankValue === 2 || rankValue === 3
                    const isZeroScore = zeroScoreDocIds.includes(doc.id);
                    const colors = { 1: '#f1c40f', 2: '#bdc3c7', 3: '#cd7f32' }
                    
                    rankRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${scoreColWidth}px`,
                            padding: '10px 6px',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: isZeroScore ? '#721c24' : (isTop ? '#1a2a3a' : '#64748b'),
                            backgroundColor: isZeroScore ? '#f8d7da' : (isTop ? (colors[rankValue] || 'transparent') : 'transparent'),
                            borderRadius: (isZeroScore || isTop) ? '4px' : '0',
                            flexShrink: 0,
                            borderRight: docIndex < documents.length - 1 ? '1px solid #e8ecf0' : 'none',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        text: rankValue
                    }))
                })
                tableInner.appendChild(rankRow)
            }

            // ===== FINAL CONSOLIDATED RANK ROW =====
            if (finalRankData && finalRankData.final_rank_rows) {
                const finalRankRowData = finalRankData.final_rank_rows[evaluator.id];
                
                if (finalRankRowData) {
                    const finalRankRow = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            backgroundColor: '#f3e5f5',
                            borderTop: '2px solid #9b59b6',
                            fontWeight: '600',
                            marginTop: '2px'
                        }
                    });

                    finalRankRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${criteriaColWidth}px`,
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#4a235a',
                            fontWeight: '600',
                            flexShrink: 0,
                            borderRight: '1px solid #e8ecf0',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        text: 'Final Rank (1224)'
                    }));

                    documents.forEach((doc, docIndex) => {
                        const finalRank = finalRankRowData[doc.column] || '';
                        const isTop = finalRank === 1 || finalRank === 2 || finalRank === 3;
                        const isZeroScore = zeroScoreDocIds.includes(doc.id);
                        const colors = { 1: '#f1c40f', 2: '#bdc3c7', 3: '#cd7f32' };
                        
                        finalRankRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${scoreColWidth}px`,
                                padding: '10px 6px',
                                textAlign: 'center',
                                fontSize: '16px',
                                fontWeight: '700',
                                color: isZeroScore ? '#721c24' : (isTop ? '#1a2a3a' : '#4a235a'),
                                backgroundColor: isZeroScore ? '#f8d7da' : (isTop ? (colors[finalRank] || '#f3e5f5') : 'transparent'),
                                borderRadius: (isZeroScore || isTop) ? '4px' : '0',
                                flexShrink: 0,
                                borderRight: docIndex < documents.length - 1 ? '1px solid #e8ecf0' : 'none',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            text: finalRank
                        }));
                    });

                    tableInner.appendChild(finalRankRow);
                }
            }

            // Append tableInner to tableContainer
            tableContainer.appendChild(tableInner);
            wrapper.appendChild(tableContainer);
            wrapper.appendChild($({
                tag: 'div',
                style: { height: '8px' }
            }))
        })
        
        // ===== CRITERIA RANKINGS SECTION =====
        if (data.criteria_rankings && Object.keys(data.criteria_rankings).length > 0) {
            wrapper.appendChild($({
                tag: 'div',
                style: { height: '32px' }
            }))
            
            wrapper.appendChild($({
                tag: 'div',
                style: {
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a2a3a',
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.3px'
                },
                text: 'Ranking by Criteria'
            }))
            
            const rankingsContainer = $({
                tag: 'div',
                style: {
                    width: '100%',
                    overflow: 'auto',
                    borderRadius: '10px',
                    border: '1px solid #e8ecf0'
                }
            });
            
            const criteriaIds = Object.keys(data.criteria_rankings).sort((a, b) => parseInt(a) - parseInt(b))
            
            // Only show criteria rankings if we have document columns
            if (documentColumns.length > 0) {
                criteriaIds.forEach((criteriaId, index) => {
                    const criteriaData = data.criteria_rankings[criteriaId]
                    const criteriaName = criteriaData.name
                    const rankings = criteriaData.rankings || []
                    
                    const rankMap = {}
                    const scoreMap = {}
                    rankings.forEach(item => {
                        rankMap[item.column] = item.rank
                        scoreMap[item.column] = item.total_score
                    })
                    
                    const headerColors = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#fce4ec', '#f3e5f5']
                    const headerColor = headerColors[index % headerColors.length]
                    
                    // Criteria header
                    rankingsContainer.appendChild($({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 16px',
                            backgroundColor: headerColor,
                            borderBottom: '1px solid #e8ecf0',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: '#1a2a3a',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        text: criteriaName
                    }))
                    
                    // Ranking row
                    const criteriaRankRow = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            backgroundColor: '#fafbfc',
                            borderBottom: '1px solid #e8ecf0'
                        }
                    })

                    criteriaRankRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${criteriaColWidth}px`,
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            flexShrink: 0,
                            borderRight: '1px solid #e8ecf0',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        },
                        text: 'RANK'
                    }))

                    documentColumns.forEach((col, colIndex) => {
                        const rank = rankMap[col] !== undefined ? rankMap[col] : ''
                        const isTop = rank === 1 || rank === 2 || rank === 3;
                        const colors = { 1: '#f1c40f', 2: '#bdc3c7', 3: '#cd7f32' };
                        
                        criteriaRankRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${scoreColWidth}px`,
                                padding: '8px 6px',
                                textAlign: 'center',
                                fontSize: '15px',
                                fontWeight: '700',
                                color: isTop ? '#1a2a3a' : '#64748b',
                                backgroundColor: isTop ? (colors[rank] || 'transparent') : 'transparent',
                                borderRadius: isTop ? '4px' : '0',
                                flexShrink: 0,
                                borderRight: colIndex < documentColumns.length - 1 ? '1px solid #e8ecf0' : 'none',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            text: rank
                        }))
                    })
                    rankingsContainer.appendChild(criteriaRankRow)
                    
                    // Score details row
                    if (rankings.length > 0) {
                        const scoreDetailsRow = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: '100%',
                                backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #e8ecf0'
                            }
                        })

                        scoreDetailsRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${criteriaColWidth}px`,
                                padding: '6px 14px',
                                fontSize: '11px',
                                color: '#94a3b8',
                                fontStyle: 'italic',
                                flexShrink: 0,
                                borderRight: '1px solid #e8ecf0',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            text: 'Total Score'
                        }))

                        documentColumns.forEach((col, colIndex) => {
                            const score = scoreMap[col] || 0
                            scoreDetailsRow.appendChild($({
                                tag: 'div',
                                style: {
                                    width: `${scoreColWidth}px`,
                                    padding: '6px 6px',
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    flexShrink: 0,
                                    borderRight: colIndex < documentColumns.length - 1 ? '1px solid #e8ecf0' : 'none',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                },
                                text: score.toFixed(1)
                            }))
                        })
                        rankingsContainer.appendChild(scoreDetailsRow)
                    }
                })
                
                wrapper.appendChild(rankingsContainer);
            }
        }

        // Only add average rank section if we have documents
        if (documentColumns.length > 0) {
            wrapper.appendChild(createAverageRankSection(eventId, categoryId, documentColumns, data))
        }

        contentDiv.appendChild(wrapper)
        return contentDiv
    }

    const getZeroScoreDocuments = (evaluatorSheet) => {
        const zeroScoreDocs = [];
        const documents = Object.values(evaluatorSheet.documents || {});
        documents.forEach(doc => {
            if (doc.total_score === 0 || doc.total_score === 0.0) {
                zeroScoreDocs.push(doc.id);
            }
        });
        return zeroScoreDocs;
    };

    const createAverageRankSection = (eventId, categoryId, documentColumns, summaryData) => {
        const container = $({
            tag: 'div',
            style: {
                width: '100%',
                marginTop: '32px'
            }
        })

        container.appendChild($({
            tag: 'div',
            style: {
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a2a3a',
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                letterSpacing: '-0.3px'
            },
            text: 'Average Rank Across All Evaluators'
        }))

        const loadingDiv = $({
            tag: 'div',
            style: {
                textAlign: 'center',
                padding: '24px',
                color: '#94a3b8',
                fontStyle: 'italic',
                fontSize: '14px'
            },
            text: 'Loading average ranks...'
        })
        container.appendChild(loadingDiv)

        const req = new Request('/ranking')
        req.Post([
            { name: 'getAverageRank', value: '1' },
            { name: 'eventId', value: eventId },
            { name: 'categoryId', value: categoryId }
        ])
        req.Json()
        
        req.Send().then(response => {
            container.removeChild(loadingDiv)
            
            if (!response.success || !response.data) {
                container.appendChild($({
                    tag: 'div',
                    style: {
                        padding: '20px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '14px',
                        border: '1px solid #fcd34d'
                    },
                    text: response.error || 'No average rank data available'
                }))
                return
            }

            const rankData = response.data
            
            let evaluatorNames = []
            if (summaryData && summaryData.evaluators && summaryData.evaluators.length > 0) {
                evaluatorNames = summaryData.evaluators.map(evalSheet => {
                    const evaluator = evalSheet.evaluator
                    return {
                        full: evaluator.name,
                        number: evaluator.number
                    }
                })
            }
            
            const evaluatorCount = evaluatorNames.length
            
            const finalRankWidth = 100
            const averageRankWidth = 240
            
            let maxTitleLength = 0
            const allDocs = Object.values(rankData.average_ranks || {})
            allDocs.forEach(doc => {
                if (doc.title && doc.title.length > maxTitleLength) {
                    maxTitleLength = doc.title.length
                }
            })
            let titleWidth = Math.min(600, Math.max(250, maxTitleLength * 7.5))
            
            let maxEvalNameLength = 0
            evaluatorNames.forEach(evaluator => {
                if (evaluator.full.length > maxEvalNameLength) {
                    maxEvalNameLength = evaluator.full.length
                }
            })
            let evaluatorColWidth = Math.min(300, Math.max(200, maxEvalNameLength * 6.5))
            let totalWidth = finalRankWidth + titleWidth + (evaluatorColWidth * evaluatorCount) + averageRankWidth + 40
            
            const maxTotalWidth = 1300
            if (totalWidth > maxTotalWidth) {
                const scaleFactor = (maxTotalWidth - 40) / (totalWidth - 40)
                titleWidth = Math.floor(titleWidth * scaleFactor)
                evaluatorColWidth = Math.floor(evaluatorColWidth * scaleFactor)
                totalWidth = finalRankWidth + titleWidth + (evaluatorColWidth * evaluatorCount) + averageRankWidth + 40
            }

            const tableWrapper = $({
                tag: 'div',
                style: {
                    width: '100%',
                    overflow: 'auto',
                    borderRadius: '10px',
                    border: '1px solid #e8ecf0',
                    backgroundColor: '#ffffff'
                }
            })

            const table = $({
                tag: 'div',
                style: {
                    minWidth: `${totalWidth}px`,
                    width: '100%'
                }
            })

            const headerRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#f1f5f9',
                    borderBottom: '2px solid #e2e8f0',
                    fontWeight: '600'
                }
            })

            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${finalRankWidth}px`,
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    borderRight: '1px solid #e2e8f0'
                },
                text: 'Rank'
            }))

            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${titleWidth}px`,
                    padding: '10px 14px',
                    fontSize: '11px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    borderRight: '1px solid #e2e8f0'
                },
                text: 'Document Title'
            }))
            
            evaluatorNames.forEach((evaluator, index) => {
                headerRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${evaluatorColWidth}px`,
                        padding: '10px 6px',
                        textAlign: 'center',
                        fontSize: '10px',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        flexShrink: 0,
                        borderRight: index < evaluatorNames.length - 1 ? '1px solid #e2e8f0' : 'none',
                        wordWrap: 'break-word',
                        lineHeight: '1.2'
                    },
                    att: { title: evaluator.full },
                    text: evaluator.full
                }))
            })
            
            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${averageRankWidth}px`,
                    padding: '10px 6px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    backgroundColor: '#fef3c7',
                    borderLeft: '1px solid #e2e8f0'
                },
                text: 'Average'
            }))

            table.appendChild(headerRow)

            const sortedDocs = Object.values(rankData.average_ranks || {}).sort((a, b) => a.final_rank - b.final_rank)


            const rankColors = {
                1: { bg: '#fef9e7', border: '#f1c40f', text: '#7d6608' },
                2: { bg: '#f4f6f7', border: '#bdc3c7', text: '#5d6d7e' },
                3: { bg: '#fdf2e9', border: '#cd7f32', text: '#6e2c00' },
                default: { bg: '#f8f9fa', border: '#e8ecf0', text: '#2c3e50' }
            }

            sortedDocs.forEach((doc, index) => {
                const isEven = index % 2 === 0
                const rowBg = isEven ? '#ffffff' : '#fafbfc'
                
                const row = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        backgroundColor: rowBg,
                        borderBottom: index === sortedDocs.length - 1 ? 'none' : '1px solid #f0f2f5',
                        transition: 'background-color 0.15s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = rowBg
                        }
                    }
                })

                const rank = doc.final_rank
                const color = rankColors[rank] || rankColors.default
                
                let badgeStyle = {
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    backgroundColor: color.bg,
                    color: color.text,
                    border: `2px solid ${color.border}`
                }
                
                if (rank === 1) {
                    badgeStyle = {
                        ...badgeStyle,
                        backgroundColor: '#fef9e7',
                        color: '#7d6608',
                        border: '2px solid #f1c40f',
                        boxShadow: '0 2px 8px rgba(241, 196, 15, 0.3)'
                    }
                } else if (rank === 2) {
                    badgeStyle = {
                        ...badgeStyle,
                        backgroundColor: '#f4f6f7',
                        color: '#5d6d7e',
                        border: '2px solid #bdc3c7',
                        boxShadow: '0 2px 8px rgba(189, 195, 199, 0.3)'
                    }
                } else if (rank === 3) {
                    badgeStyle = {
                        ...badgeStyle,
                        backgroundColor: '#fdf2e9',
                        color: '#6e2c00',
                        border: '2px solid #cd7f32',
                        boxShadow: '0 2px 8px rgba(205, 127, 50, 0.3)'
                    }
                }
                
                const rankCell = $({
                    tag: 'div',
                    style: {
                        width: `${finalRankWidth}px`,
                        padding: '10px 8px',
                        textAlign: 'center',
                        flexShrink: 0,
                        borderRight: '1px solid #f0f2f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: badgeStyle,
                            text: rank
                        })
                    ]
                })
                row.appendChild(rankCell)

                row.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${titleWidth}px`,
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#1a2a3a',
                        flexShrink: 0,
                        borderRight: '1px solid #f0f2f5',
                        wordWrap: 'break-word',
                        lineHeight: '1.4'
                    },
                    att: { title: doc.title },
                    text: doc.title
                }))

                const rankByColumn = {}
                if (doc.final_ranks && Array.isArray(doc.final_ranks)) {
                    doc.final_ranks.forEach((rank, idx) => {
                        rankByColumn[idx + 1] = rank
                    })
                }

                for (let i = 1; i <= evaluatorNames.length; i++) {
                    const rankValue = rankByColumn[i] !== undefined ? rankByColumn[i] : ''
                    const isTop = rankValue === 1 || rankValue === 2 || rankValue === 3
                    const colors = { 1: '#fef9e7', 2: '#f4f6f7', 3: '#fdf2e9' }
                    const textColors = { 1: '#7d6608', 2: '#5d6d7e', 3: '#6e2c00' }
                    
                    row.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${evaluatorColWidth}px`,
                            padding: '10px 6px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: isTop ? '700' : '500',
                            color: isTop ? textColors[rankValue] : '#64748b',
                            backgroundColor: isTop ? colors[rankValue] : 'transparent',
                            borderRadius: isTop ? '4px' : '0',
                            flexShrink: 0,
                            borderRight: i < evaluatorNames.length ? '1px solid #f0f2f5' : 'none'
                        },
                        text: rankValue !== '' ? rankValue : '—'
                    }))
                }

                const avgValue = doc.formatted_average || (doc.average ? doc.average.toFixed(1) : '0.0')
                const avgNum = parseFloat(avgValue)
                let avgColor = '#64748b'
                let avgBg = '#f8fafc'
                
                if (avgNum <= 2) {
                    avgColor = '#15803d'
                    avgBg = '#dcfce7'
                } else if (avgNum <= 3.5) {
                    avgColor = '#b45309'
                    avgBg = '#fef3c7'
                } else {
                    avgColor = '#b91c1c'
                    avgBg = '#fecaca'
                }
                
                row.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${averageRankWidth}px`,
                        padding: '10px 6px',
                        textAlign: 'center',
                        flexShrink: 0,
                        borderLeft: '1px solid #f0f2f5'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: avgColor,
                                backgroundColor: avgBg
                            },
                            text: avgValue
                        })
                    ]
                }))

                table.appendChild(row)
            })

            tableWrapper.appendChild(table)
            container.appendChild(tableWrapper)

            const legend = $({
                tag: 'div',
                style: {
                    marginTop: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    padding: '12px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e8ecf0',
                    fontSize: '12px',
                    color: '#64748b',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                },
                child: [
                    $({ 
                        tag: 'span', 
                        style: { display: 'flex', alignItems: 'center', gap: '6px' }, 
                        child: [
                            $({ tag: 'span', style: { display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#fef9e7', border: '2px solid #f1c40f', borderRadius: '3px' } }),
                            $({ tag: 'span', text: '1st Place' })
                        ] 
                    }),
                    $({ 
                        tag: 'span', 
                        style: { display: 'flex', alignItems: 'center', gap: '6px' }, 
                        child: [
                            $({ tag: 'span', style: { display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#f4f6f7', border: '2px solid #bdc3c7', borderRadius: '3px' } }),
                            $({ tag: 'span', text: '2nd Place' })
                        ] 
                    }),
                    $({ 
                        tag: 'span', 
                        style: { display: 'flex', alignItems: 'center', gap: '6px' }, 
                        child: [
                            $({ tag: 'span', style: { display: 'inline-block', width: '14px', height: '14px', backgroundColor: '#fdf2e9', border: '2px solid #cd7f32', borderRadius: '3px' } }),
                            $({ tag: 'span', text: '3rd Place' })
                        ] 
                    }),
                    $({ tag: 'span', style: { color: '#94a3b8' }, text: `👥 ${rankData.summary?.total_evaluators || 0} Evaluators • 📄 ${rankData.summary?.total_documents || 0} Documents` })
                ]
            })
            container.appendChild(legend)

        }).catch(error => {
            if (container.contains(loadingDiv)) {
                container.removeChild(loadingDiv)
            }
            container.appendChild($({
                tag: 'div',
                style: {
                    padding: '20px',
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '14px',
                    border: '1px solid #fca5a5'
                },
                text: 'Error loading average ranks: ' + error.message
            }))
        })

        return container
    }

    //  EXPORT TO EXCEL
    const exportToExcel = async (data) => { 
        if (!XLSX) {
            alert('Excel export library not loaded. Please refresh the page.')
            return
        }

        if (!data || !data.evaluators || data.evaluators.length === 0) {
            alert('No data available to export')
            return
        }

        try {
            const rankReq = new Request('/ranking')
            rankReq.Post([
                { name: 'getAverageRank', value: '1' },
                { name: 'eventId', value: eventId },
                { name: 'categoryId', value: categoryId }
            ])
            rankReq.Json()
            
            const rankResponse = await rankReq.Send()
            const rankData = rankResponse.success ? rankResponse.data : null
            
            const wb = XLSX.utils.book_new()
            
            let wsData = []
            
            // Title - DYNAMIC from database
            wsData.push([data.event?.name || '36TH IN-HOUSE REVIEW'])
            wsData.push([`${data.category?.type || 'CATEGORY'}: ${data.category?.name || ''}`])
            wsData.push([])
            
            let documentColumns = []
            let documentsList = []
            
            if (data.evaluators && data.evaluators.length > 0 && data.evaluators[0].documents) {
                const docs = Object.values(data.evaluators[0].documents)
                docs.sort((a, b) => a.column - b.column)
                docs.forEach(doc => {
                    documentColumns.push(doc.column)
                    documentsList.push(doc)
                })
            }
            
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    const evaluator = evaluatorSheet.evaluator
                    
                    wsData.push([`Evaluator ${evaluator.number}: ${evaluator.name}`])
                    wsData.push(['Score Sheet'])
                    wsData.push([])
                    
                    let headerRow = ['CRITERIA']
                    documentColumns.forEach(col => headerRow.push(col))
                    wsData.push(headerRow)
                    
                    // Title row - WITH FULL TEXT
                    let titleRow = ['TITLE']
                    const documents = Object.values(evaluatorSheet.documents || {})
                    documents.sort((a, b) => a.column - b.column)
                    documents.forEach(doc => titleRow.push(doc.title))
                    wsData.push(titleRow)
                    
                    // Criteria rows
                    if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                        evaluatorSheet.criteria_rows.forEach((criteriaRow) => {
                            let row = []
                            
                            const criteriaName = criteriaRow.percentage 
                                ? `${criteriaRow.name}` 
                                : criteriaRow.name
                            row.push(criteriaName)
                            
                            const scores = criteriaRow.scores || {}
                            
                            documents.forEach(doc => {
                                const score = scores[doc.column] !== undefined ? scores[doc.column] : 0
                                row.push(score > 0 
                                    ? (Number.isInteger(score) ? score : parseFloat(score.toFixed(1))) 
                                    : 0)
                            })
                            wsData.push(row)
                        })
                    }
                    
                    // Total row
                    let totalRow = ['Total']
                    documents.forEach(doc => totalRow.push(parseFloat((doc.total_score || 0).toFixed(1))))
                    wsData.push(totalRow)
                    
                    if (evaluatorSheet.rank_row) {
                        let rankExcelRow = []
                        evaluatorSheet.rank_row.forEach((value) => {
                            rankExcelRow.push(value)
                        })
                        wsData.push(rankExcelRow)
                    }
                    
                    wsData.push([])
                    wsData.push([])
                })
            }
            
            if (data.criteria_rankings && Object.keys(data.criteria_rankings).length > 0) {
                wsData.push([])
                wsData.push([])
                wsData.push(['RANKING BY CRITERIA'])
                wsData.push([])
                
                const criteriaIds = Object.keys(data.criteria_rankings).sort((a, b) => parseInt(a) - parseInt(b))
                
                criteriaIds.forEach((criteriaId) => {
                    const criteriaData = data.criteria_rankings[criteriaId]
                    const criteriaName = criteriaData.name
                    const rankings = criteriaData.rankings || []
                    
                    const rankMap = {}
                    rankings.forEach(item => {
                        rankMap[item.column] = item.rank
                    })
                    
                    wsData.push([`${criteriaName}`])
                    
                    let rankRow = ['RANK']
                    documentColumns.forEach(col => {
                        rankRow.push(rankMap[col] || '')
                    })
                    wsData.push(rankRow)
                    
                    let scoreRow = ['Total Score']
                    documentColumns.forEach(col => {
                        const rankingItem = rankings.find(item => item.column === col)
                        scoreRow.push(rankingItem ? parseFloat(rankingItem.total_score.toFixed(1)) : 0)
                    })
                    wsData.push(scoreRow)
                    wsData.push([])
                })
            }

            let evaluatorNames = []
            if (rankData && rankData.average_ranks) {
                if (data.evaluators && data.evaluators.length > 0) {
                    evaluatorNames = data.evaluators.map(evalSheet => {
                        const evaluator = evalSheet.evaluator
                        return evaluator.name || `Evaluator ${evaluator.number}`
                    })
                }
                
                wsData.push([])
                wsData.push([])
                wsData.push(['AVERAGE RANK ACROSS ALL EVALUATORS'])
                wsData.push([])
                
                let headerRow = ['Final Rank', 'Document Title', ...evaluatorNames, 'Total Rank Score', 'Average Rank']
                wsData.push(headerRow)
                
                const sortedDocs = Object.values(rankData.average_ranks || {}).sort((a, b) => a.final_rank - b.final_rank)
                
                sortedDocs.forEach(doc => {
                    let row = [doc.final_rank, doc.title]
                    
                    for (let i = 0; i < evaluatorNames.length; i++) {
                        const rankValue = doc.final_ranks && doc.final_ranks[i] !== undefined ? doc.final_ranks[i] : ''
                        row.push(rankValue)
                    }
                    
                    row.push(doc.total_rank_score || 0)

                    row.push(doc.formatted_average || doc.average?.toFixed(1) || '0.0')
                    wsData.push(row)
                })
            }
            
            if (wsData.length < 3) {
                throw new Error('No data to export')
            }
            
            const ws = XLSX.utils.aoa_to_sheet(wsData)

            const baseColWidths = [
                { wch: 15 }, // Final Rank
                { wch: 50 }, // Document Title
                ...evaluatorNames.map(() => ({ wch: 25 })), // Evaluator columns
                { wch: 18 }, // Total Rank Score
                { wch: 15 }  // Average Rank
            ]
            
            // For the evaluator sheets section, we need to keep the original column widths
            // We'll set the column widths for the entire sheet
            ws['!cols'] = baseColWidths
            
            // Track rows for styling
            let currentRow = 0
            
            // Style main title (row 0)
            if (wsData[0] && wsData[0][0]) {
                const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 })
                ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[0][0] }
                ws[cellRef].s = {
                    font: { bold: true, sz: 20, name: 'Quattrocento Sans' },
                    alignment: { horizontal: 'center', vertical: 'center' }
                }
            }
            currentRow++
            
            // Style category title (row 1)
            if (wsData[1] && wsData[1][0]) {
                const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 })
                ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[1][0] }
                ws[cellRef].s = {
                    font: { bold: true, sz: 18, name: 'Quattrocento Sans' },
                    alignment: { horizontal: 'center', vertical: 'center' }
                }
            }
            currentRow += 2 // Skip empty row
            
            // Process each evaluator section
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    // Evaluator header
                    if (wsData[currentRow] && wsData[currentRow][0]) {
                        const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 })
                        ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[currentRow][0] }
                        ws[cellRef].s = {
                            font: { bold: true, sz: 16, name: 'Quattrocento Sans', color: { rgb: 'FFFFFF' } },
                            fill: { fgColor: { rgb: '2C3E50' } },
                            alignment: { horizontal: 'left', vertical: 'center' }
                        }
                    }
                    currentRow++
                    
                    // "Score Sheet" text
                    if (wsData[currentRow] && wsData[currentRow][0]) {
                        const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 })
                        ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[currentRow][0] }
                        ws[cellRef].s = {
                            font: { bold: true, sz: 20, name: 'Quattrocento Sans' },
                            alignment: { horizontal: 'center', vertical: 'center' }
                        }
                    }
                    currentRow++
                    
                    // Skip empty row
                    currentRow++
                    
                    // HEADER ROW (CRITERIA, 1,2,3...)
                    const headerRowIndex = currentRow
                    
                    // Get color for header based on evaluator index
                    const headerColor = evalIndex % 3 === 0 ? 'B4C6E7' : 
                                    evalIndex % 3 === 1 ? 'A8D08D' : 
                                    'FFD965'
                    
                    // CRITERIA cell in header
                    if (wsData[headerRowIndex] && wsData[headerRowIndex][0]) {
                        const criteriaHeaderCell = XLSX.utils.encode_cell({ r: headerRowIndex, c: 0 })
                        ws[criteriaHeaderCell] = ws[criteriaHeaderCell] || { t: 's', v: 'CRITERIA' }
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
                        }
                    }
                    
                    // Column numbers
                    documentColumns.forEach((col, colIndex) => {
                        if (wsData[headerRowIndex] && wsData[headerRowIndex][colIndex + 1] !== undefined) {
                            const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex + 1 })
                            ws[cellRef] = ws[cellRef] || { t: 'n', v: col }
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
                            }
                        }
                    })
                    currentRow++
                    
                    // TITLE ROW - WITH WRAPPED TEXT
                    const titleRowIndex = currentRow
                    const documents = Object.values(evaluatorSheet.documents || {})
                    documents.sort((a, b) => a.column - b.column)
                    
                    // TITLE cell
                    if (wsData[titleRowIndex] && wsData[titleRowIndex][0]) {
                        const titleCell = XLSX.utils.encode_cell({ r: titleRowIndex, c: 0 })
                        ws[titleCell] = ws[titleCell] || { t: 's', v: 'TITLE' }
                        ws[titleCell].s = {
                            font: { bold: true, sz: 20, name: 'Quattrocento Sans', italic: true },
                            fill: { fgColor: { rgb: 'F9F9F9' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                bottom: { style: 'thin', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        }
                    }
                    
                    // Document title cells
                    documents.forEach((doc, colIndex) => {
                        if (wsData[titleRowIndex] && wsData[titleRowIndex][colIndex + 1] !== undefined) {
                            const cellRef = XLSX.utils.encode_cell({ r: titleRowIndex, c: colIndex + 1 })
                            ws[cellRef] = ws[cellRef] || { t: 's', v: doc.title }
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
                            }
                        }
                    })
                    
                    // Set row height for title row
                    if (!ws['!rows']) ws['!rows'] = []
                    ws['!rows'][titleRowIndex] = ws['!rows'][titleRowIndex] || {}
                    ws['!rows'][titleRowIndex].hpt = 45
                    currentRow++
                    
                    // CRITERIA SCORE ROWS
                    if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                        evaluatorSheet.criteria_rows.forEach((criteriaRow, critIndex) => {
                            const rowIndex = currentRow
                            
                            // Background color - alternating white/gray
                            const bgColor = critIndex % 2 === 0 ? 'FFFFFF' : 'F9F9F9'
                            
                            // Criteria name cell
                            if (wsData[rowIndex] && wsData[rowIndex][0] !== undefined) {
                                const criteriaCell = XLSX.utils.encode_cell({ r: rowIndex, c: 0 })
                                const criteriaName = criteriaRow.percentage 
                                    ? `${criteriaRow.name}` 
                                    : criteriaRow.name
                                
                                ws[criteriaCell] = ws[criteriaCell] || { t: 's', v: criteriaName }
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
                                }
                            }
                            
                            // Score cells
                            const scores = criteriaRow.scores || {}
                            documents.forEach((doc, colIndex) => {
                                if (wsData[rowIndex] && wsData[rowIndex][colIndex + 1] !== undefined) {
                                    const score = scores[doc.column] !== undefined ? scores[doc.column] : 0
                                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex + 1 })
                                    
                                    ws[cellRef] = ws[cellRef] || { 
                                        t: 'n', 
                                        v: score > 0 ? (Number.isInteger(score) ? score : parseFloat(score.toFixed(1))) : 0 
                                    }
                                    
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
                                    }
                                }
                            })
                            
                            currentRow++
                        })
                    }
                    
                    // TOTAL ROW
                    const totalRowIndex = currentRow
                    
                    // Total label cell
                    if (wsData[totalRowIndex] && wsData[totalRowIndex][0] !== undefined) {
                        const totalLabelCell = XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 })
                        ws[totalLabelCell] = ws[totalLabelCell] || { t: 's', v: 'Total' }
                        ws[totalLabelCell].s = {
                            font: { bold: true, sz: 18, name: 'Times New Roman' },
                            fill: { fgColor: { rgb: 'FFFFFF' } },
                            alignment: { horizontal: 'left', vertical: 'center' },
                            border: {
                                bottom: { style: 'medium', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        }
                    }
                    
                    // Total score cells
                    documents.forEach((doc, colIndex) => {
                        if (wsData[totalRowIndex] && wsData[totalRowIndex][colIndex + 1] !== undefined) {
                            const cellRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex + 1 })
                            ws[cellRef] = ws[cellRef] || { t: 'n', v: parseFloat((doc.total_score || 0).toFixed(1)) }
                            ws[cellRef].s = {
                                font: { bold: true, sz: 18, name: 'Times New Roman' },
                                fill: { fgColor: { rgb: 'FFFFFF' } },
                                alignment: { horizontal: 'center', vertical: 'center' },
                                border: {
                                    bottom: { style: 'medium', color: { rgb: '000000' } },
                                    left: { style: 'thin', color: { rgb: '000000' } },
                                    right: { style: 'thin', color: { rgb: '000000' } }
                                }
                            }
                        }
                    })
                    currentRow++
                    
                    //  RANK ROW STYLING 
                    if (evaluatorSheet.rank_row) {
                        const rankRowIndex = currentRow
                        
                        // Rank Label cell
                        if (wsData[rankRowIndex] && wsData[rankRowIndex][0] !== undefined) {
                            const rankLabelCell = XLSX.utils.encode_cell({ r: rankRowIndex, c: 0 })
                            ws[rankLabelCell] = ws[rankLabelCell] || { t: 's', v: 'Rank' }
                            ws[rankLabelCell].s = {
                                font: { bold: true, sz: 18, name: 'Times New Roman', color: { rgb: '8B4513' } },
                                fill: { fgColor: { rgb: 'FFE6B3' } },
                                alignment: { horizontal: 'left', vertical: 'center' },
                                border: {
                                    bottom: { style: 'medium', color: { rgb: '000000' } },
                                    left: { style: 'thin', color: { rgb: '000000' } },
                                    right: { style: 'thin', color: { rgb: '000000' } }
                                }
                            }
                        }
                        
                        // Rank value cells
                        documentColumns.forEach((col, colIndex) => {
                            if (wsData[rankRowIndex] && wsData[rankRowIndex][colIndex + 1] !== undefined) {
                                const cellRef = XLSX.utils.encode_cell({ r: rankRowIndex, c: colIndex + 1 })
                                ws[cellRef] = ws[cellRef] || { t: 's', v: wsData[rankRowIndex][colIndex + 1] }
                                ws[cellRef].s = {
                                    font: { bold: true, sz: 18, name: 'Times New Roman', color: { rgb: '8B4513' } },
                                    fill: { fgColor: { rgb: 'FFE6B3' } },
                                    alignment: { horizontal: 'center', vertical: 'center' },
                                    border: {
                                        bottom: { style: 'medium', color: { rgb: '000000' } },
                                        left: { style: 'thin', color: { rgb: '000000' } },
                                        right: { style: 'thin', color: { rgb: '000000' } }
                                    }
                                }
                            }
                        })
                        currentRow++
                    }
                    
                    // Skip empty rows
                    currentRow += 2
                })
            }
            
            // Style Quality of Presentation row
            if (data.quality_presentation_row) {
                // Quality of Presentation label row
                if (wsData[currentRow] && wsData[currentRow][0]) {
                    const qpLabelRowCell = XLSX.utils.encode_cell({ r: currentRow, c: 0 })
                    ws[qpLabelRowCell] = ws[qpLabelRowCell] || { t: 's', v: 'Quality of Presentation' }
                    ws[qpLabelRowCell].s = {
                        font: { bold: true, sz: 13, name: 'Quattrocento Sans' },
                        alignment: { horizontal: 'left', vertical: 'center' }
                    }
                }
                currentRow++
                
                // QP data row
                const qpDataRowIndex = currentRow
                
                // QP Label cell
                if (wsData[qpDataRowIndex] && wsData[qpDataRowIndex][0]) {
                    const qpLabelCell = XLSX.utils.encode_cell({ r: qpDataRowIndex, c: 0 })
                    ws[qpLabelCell] = ws[qpLabelCell] || { t: 's', v: 'Quality of Presentation' }
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
                    }
                }
                
                // QP Score cells
                documentColumns.forEach((col, colIndex) => {
                    if (wsData[qpDataRowIndex] && wsData[qpDataRowIndex][colIndex + 1] !== undefined) {
                        const score = data.quality_presentation_row.scores[col] || 0
                        const cellRef = XLSX.utils.encode_cell({ r: qpDataRowIndex, c: colIndex + 1 })
                        ws[cellRef] = ws[cellRef] || { t: 'n', v: parseFloat(score.toFixed(1)) }
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
                        }
                    }
                })
                currentRow += 2
            }
            
            // Style Rank row
            if (data.rankings) {
                const rankMap = {}
                data.rankings.forEach(item => {
                    rankMap[item.column] = item.rank
                })
                
                const rankRowIndex = currentRow
                
                // Rank Label cell
                if (wsData[rankRowIndex] && wsData[rankRowIndex][0]) {
                    const rankLabelCell = XLSX.utils.encode_cell({ r: rankRowIndex, c: 0 })
                    ws[rankLabelCell] = ws[rankLabelCell] || { t: 's', v: 'RANK' }
                    ws[rankLabelCell].s = {
                        font: { bold: true, sz: 17, name: 'Quattrocento Sans' },
                        fill: { fgColor: { rgb: 'FFA500' } },
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            bottom: { style: 'medium', color: { rgb: 'FFA500' } },
                            left: { style: 'thin', color: { rgb: 'FFA500' } },
                            right: { style: 'thin', color: { rgb: 'FFA500' } }
                        }
                    }
                }
                
                // Rank value cells
                documentColumns.forEach((col, colIndex) => {
                    if (wsData[rankRowIndex] && wsData[rankRowIndex][colIndex + 1] !== undefined) {
                        const cellRef = XLSX.utils.encode_cell({ r: rankRowIndex, c: colIndex + 1 })
                        ws[cellRef] = ws[cellRef] || { t: 's', v: rankMap[col] || '' }
                        ws[cellRef].s = {
                            font: { bold: true, sz: 17, name: 'Quattrocento Sans' },
                            fill: { fgColor: { rgb: 'FFA500' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                bottom: { style: 'medium', color: { rgb: 'FFA500' } },
                                left: { style: 'thin', color: { rgb: 'FFA500' } },
                                right: { style: 'thin', color: { rgb: 'FFA500' } }
                            }
                        }
                    }
                })
            }
            
            // FIX: Make sure we append the sheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Summary Report')
            
            // Save the file
            const eventNameForFile = data.event?.name?.replace(/[^a-z0-9]/gi, '_') || 'Event'
            const fileName = `${eventNameForFile}_${data.category?.name?.replace(/[^a-z0-9]/gi, '_') || 'Summary'}_Report.xlsx`
            XLSX.writeFile(wb, fileName)
            
        } catch (error) {
            alert('Error exporting to Excel: ' + error.message)
        }
    }

    //  EXPORT TO PDF
    const exportToPDF = async (data) => { 
        if (!jsPDF) {
            alert('PDF export library not loaded. Please refresh the page.')
            return
        }

        try {
            // FIRST, FETCH THE AVERAGE RANK DATA USING THE SAME API AS CANVAS
            const rankReq = new Request('/ranking')
            rankReq.Post([
                { name: 'getAverageRank', value: '1' },
                { name: 'eventId', value: eventId },
                { name: 'categoryId', value: categoryId }
            ])
            rankReq.Json()
            
            const rankResponse = await rankReq.Send()
            const rankData = rankResponse.success ? rankResponse.data : null
            
            // A4 Landscape dimensions: 297mm x 210mm
            const doc = new jsPDF({ 
                orientation: 'landscape', 
                unit: 'mm', 
                format: 'a4'
            })
            
            // Set default font to Quattrocento Sans
            doc.setFont('Quattrocento Sans')
            
            // Page dimensions
            const pageWidth = doc.internal.pageSize.getWidth()
            const pageHeight = doc.internal.pageSize.getHeight()
            const margin = 15
            
            // Title - CENTERED
            doc.setFontSize(22)
            doc.setFont('Quattrocento Sans', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text(data.event?.name, pageWidth / 2, 20, { align: 'center' })
            
            doc.setFontSize(20)
            doc.text(`${data.category?.type || 'CATEGORY'}: ${data.category?.name || ''}`, pageWidth / 2, 30, { align: 'center' })
            
            doc.setFontSize(10)
            doc.setFont('Quattrocento Sans', 'normal')
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' })
            
            let yPos = 50
            
            // Get document columns
            let documentColumns = []
            if (data.evaluators && data.evaluators.length > 0 && data.evaluators[0].documents) {
                const docs = Object.values(data.evaluators[0].documents)
                docs.sort((a, b) => a.column - b.column)
                docs.forEach(doc => {
                    documentColumns.push(doc.column)
                })
            }
            
            // Calculate column widths for better fit
            const criteriaColWidth = 55
            const scoreColWidth = 18
            const totalTableWidth = criteriaColWidth + (documentColumns.length * scoreColWidth)
            const startX = (pageWidth - totalTableWidth) / 2 // Center the table horizontally
            
            // Process each evaluator
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    // Check if we need a new page
                    if (yPos > pageHeight - 40) {
                        doc.addPage()
                        yPos = 20
                    }
                    
                    const evaluator = evaluatorSheet.evaluator
                    
                    // Evaluator header - CENTERED
                    doc.setFontSize(16)
                    doc.setFont('Quattrocento Sans', 'bold')
                    doc.setTextColor(0, 0, 0)
                    doc.text(`Evaluator ${evaluator.number}: ${evaluator.name}`, pageWidth / 2, yPos, { align: 'center' })
                    yPos += 8
                    
                    // Score Sheet title - CENTERED
                    doc.setFontSize(20)
                    doc.setFont('Quattrocento Sans', 'bold')
                    doc.text('Score Sheet', pageWidth / 2, yPos, { align: 'center' })
                    yPos += 12
                    
                    // Prepare table data
                    const documents = Object.values(evaluatorSheet.documents || {})
                    documents.sort((a, b) => a.column - b.column)
                    
                    // Headers
                    const headers = ['CRITERIA', ...documentColumns.map(col => col.toString())]
                    
                    // Body rows
                    let body = []
                    
                    // Title row
                    let titleRow = ['TITLE']
                    documents.forEach(doc => titleRow.push(doc.title))
                    body.push(titleRow)
                    
                    // Criteria rows
                    if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                        evaluatorSheet.criteria_rows.forEach((criteriaRow) => {
                            let row = []
                            const criteriaName = criteriaRow.percentage 
                                ? `${criteriaRow.name}` 
                                : criteriaRow.name
                            row.push(criteriaName)
                            
                            const scores = criteriaRow.scores || {}
                            documents.forEach(doc => {
                                const score = scores[doc.column] !== undefined ? scores[doc.column] : 0
                                row.push(score > 0 
                                    ? (Number.isInteger(score) ? score : score.toFixed(1)) 
                                    : '0')
                            })
                            body.push(row)
                        })
                    }
                    
                    // Total row
                    let totalRow = ['Total']
                    documents.forEach(doc => totalRow.push((doc.total_score || 0).toFixed(1)))
                    body.push(totalRow)

                    if (evaluatorSheet.rank_row) {
                        let rankRowData = []
                        evaluatorSheet.rank_row.forEach(value => {
                            rankRowData.push(value)
                        })
                        body.push(rankRowData)
                    }
                    
                    // Get header color based on evaluator index
                    let headerColor
                    if (evalIndex % 3 === 0) headerColor = [180, 198, 231] // #b4c6e7
                    else if (evalIndex % 3 === 1) headerColor = [168, 208, 141] // #a8d08d
                    else headerColor = [255, 217, 101] // #ffd965
                    
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
                                    data.cell.styles.fontStyle = 'bolditalic'
                                    data.cell.styles.fontSize = 12
                                    data.cell.styles.halign = 'center'
                                    data.cell.styles.textColor = [0, 0, 0]
                                    data.cell.styles.font = 'Quattrocento Sans'
                                } else {
                                    data.cell.styles.font = 'Quattrocento Sans'
                                    data.cell.styles.fontSize = 8
                                    data.cell.styles.textColor = [50, 91, 186]
                                    data.cell.styles.cellWidth = scoreColWidth
                                    data.cell.styles.fontStyle = 'normal'
                                }
                            }
                            if (data.row.index === body.length - 1 && data.section === 'body') {
                                // This is the rank row
                                data.cell.styles.fontStyle = 'bold'
                                data.cell.styles.fontSize = 14
                                data.cell.styles.font = 'Times New Roman'
                                data.cell.styles.fillColor = [255, 230, 179] // #ffe6b3
                                data.cell.styles.textColor = [139, 69, 19] // #8b4513
                                if (data.column.index === 0) {
                                    data.cell.styles.halign = 'left'
                                } else {
                                    data.cell.styles.halign = 'center'
                                }
                            }
                            // Style criteria rows
                            if (data.row.index > 0 && data.row.index < body.length - 1 && data.section === 'body') {
                                if (data.column.index === 0) {
                                    data.cell.styles.font = 'Quattrocento Sans'
                                    data.cell.styles.fontSize = 10
                                    data.cell.styles.fontStyle = 'bold'
                                    data.cell.styles.halign = 'left'
                                    data.cell.styles.cellWidth = criteriaColWidth
                                } else {
                                    data.cell.styles.font = 'Quattrocento Sans'
                                    data.cell.styles.fontSize = 10
                                    data.cell.styles.fontStyle = 'normal'
                                    data.cell.styles.cellWidth = scoreColWidth
                                }
                                
                                // Alternating row colors
                                if (data.row.index % 2 === 1) {
                                    data.cell.styles.fillColor = [255, 255, 255]
                                } else {
                                    data.cell.styles.fillColor = [249, 249, 249]
                                }
                            }
                            
                            // Style total row
                            if (data.row.index === body.length - 1 && data.section === 'body') {
                                data.cell.styles.fontStyle = 'bold'
                                data.cell.styles.fontSize = 14
                                data.cell.styles.font = 'Quattrocento Sans'
                                data.cell.styles.fillColor = [255, 255, 255]
                                data.cell.styles.textColor = [0, 0, 0]
                                if (data.column.index === 0) {
                                    data.cell.styles.halign = 'left'
                                    data.cell.styles.cellWidth = criteriaColWidth
                                } else {
                                    data.cell.styles.cellWidth = scoreColWidth
                                }
                            }
                        }
                    })
                    
                    yPos = doc.lastAutoTable.finalY + 20
                })
            }
            
            //  CRITERIA RANKINGS IN PDF 
            if (data.criteria_rankings && Object.keys(data.criteria_rankings).length > 0) {
                // Check if we need a new page
                if (yPos > pageHeight - 60) {
                    doc.addPage()
                    yPos = 20
                }
                
                // Title for criteria rankings
                doc.setFontSize(18)
                doc.setFont('Quattrocento Sans', 'bold')
                doc.setTextColor(0, 0, 0)
                doc.text('RANKING BY CRITERIA', pageWidth / 2, yPos, { align: 'center' })
                yPos += 15
                
                const criteriaIds = Object.keys(data.criteria_rankings).sort((a, b) => parseInt(a) - parseInt(b))
                const headerColors = [
                    [180, 198, 231], // #b4c6e7
                    [168, 208, 141], // #a8d08d
                    [255, 217, 101], // #ffd965
                    [244, 176, 132], // #f4b084
                    [194, 165, 207]  // #c2a5cf
                ]
                
                criteriaIds.forEach((criteriaId, index) => {
                    // Check for page break
                    if (yPos > pageHeight - 50) {
                        doc.addPage()
                        yPos = 20
                    }
                    
                    const criteriaData = data.criteria_rankings[criteriaId]
                    const criteriaName = criteriaData.name
                    const rankings = criteriaData.rankings || []
                    
                    // Create rank map
                    const rankMap = {}
                    const scoreMap = {}
                    rankings.forEach(item => {
                        rankMap[item.column] = item.rank
                        scoreMap[item.column] = item.total_score
                    })
                    
                    // Table headers
                    const headers = ['', ...documentColumns.map(col => col.toString())]
                    
                    // Table body
                    let body = [
                        ['RANK', ...documentColumns.map(col => rankMap[col] || '')],
                        ['Total Score', ...documentColumns.map(col => (scoreMap[col] || 0).toFixed(1))]
                    ]
                    
                    const headerColor = headerColors[index % headerColors.length]
                    const summaryTotalWidth = criteriaColWidth + (documentColumns.length * scoreColWidth)
                    const summaryStartX = (pageWidth - summaryTotalWidth) / 2
                    
                    // Criteria title
                    doc.setFontSize(14)
                    doc.setFont('Quattrocento Sans', 'bold')
                    doc.setTextColor(0, 0, 0)
                    doc.text(`${criteriaName}`, pageWidth / 2, yPos, { align: 'center' })
                    yPos += 8
                    
                    // Generate table
                    doc.autoTable({
                        head: [headers],
                        body: body,
                        startY: yPos,
                        margin: { left: summaryStartX, right: pageWidth - summaryStartX - summaryTotalWidth },
                        theme: 'grid',
                        styles: { 
                            fontSize: 10, 
                            cellPadding: 3,
                            font: 'Quattrocento Sans',
                            halign: 'center',
                            valign: 'middle',
                            textColor: [0, 0, 0],
                            lineWidth: 0.1
                        },
                        headStyles: { 
                            fillColor: headerColor,
                            textColor: [0, 0, 0],
                            fontStyle: 'bold',
                            fontSize: 12,
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
                                if (data.column.index === 0) {
                                    data.cell.styles.halign = 'left'
                                    data.cell.styles.fontStyle = 'bold'
                                    data.cell.styles.fillColor = [245, 245, 245]
                                }
                                
                                if (data.row.index === 0) {
                                    data.cell.styles.fontStyle = 'bold'
                                    data.cell.styles.fillColor = headerColor
                                }
                                
                                if (data.row.index === 1) {
                                    data.cell.styles.fontStyle = 'normal'
                                    data.cell.styles.fillColor = [249, 249, 249]
                                }
                            }
                        }
                    })
                    
                    yPos = doc.lastAutoTable.finalY + 15
                })
            }
            
            //AVERAGE RANK SECTION IN PDF
            if (rankData && rankData.average_ranks) {
                // Check if we need a new page
                if (yPos > pageHeight - 80) {
                    doc.addPage()
                    yPos = 20
                }
                
                // Title for average ranks
                doc.setFontSize(18)
                doc.setFont('Quattrocento Sans', 'bold')
                doc.setTextColor(0, 0, 0)
                doc.text('AVERAGE RANK ACROSS ALL EVALUATORS', pageWidth / 2, yPos, { align: 'center' })
                yPos += 10
                
                // Get evaluator names from the original data - WITH FULL NAMES
                let evaluatorNames = []
                if (data.evaluators && data.evaluators.length > 0) {
                    evaluatorNames = data.evaluators.map(evalSheet => {
                        const evaluator = evalSheet.evaluator
                        return evaluator.name || `Evaluator ${evaluator.number}`
                    })
                }
                
                // Get the pre-calculated average ranks from the API
                const sortedDocs = Object.values(rankData.average_ranks || {}).sort((a, b) => a.final_rank - b.final_rank)
                
                // Prepare table data - USE FULL EVALUATOR NAMES WITH TOTAL RANK SCORE
                const headers = ['Final Rank', 'Document Title', ...evaluatorNames, 'Total Rank Score', 'Average Rank']
                
                const body = sortedDocs.map(doc => {
                    const row = [doc.final_rank.toString(), doc.title]
                    
                    // Add final ranks for each evaluator (from doc.final_ranks array)
                    for (let i = 0; i < evaluatorNames.length; i++) {
                        const rankValue = doc.final_ranks && doc.final_ranks[i] !== undefined ? doc.final_ranks[i].toString() : '-'
                        row.push(rankValue)
                    }
                    
                    // Add Total Rank Score
                    row.push((doc.total_rank_score || 0).toFixed(1))
                    
                    // Add Average Rank
                    row.push(doc.formatted_average || doc.average?.toFixed(1) || '0.0')
                    return row
                })
                
                // Calculate column widths dynamically based on number of evaluators
                const evaluatorCount = evaluatorNames.length
                const finalRankWidth = 20
                const titleWidth = 70

                // Calculate average width needed for evaluator names based on longest name
                let maxNameLength = 0
                evaluatorNames.forEach(name => {
                    maxNameLength = Math.max(maxNameLength, name.length)
                })

                // Adjust evaluator column width based on name length (approx 1.5mm per character)
                const evaluatorColWidth = Math.max(15, Math.min(40, maxNameLength * 1.5))
                const totalRankScoreWidth = 20 // NEW: Width for Total Rank Score column
                const avgRankWidth = 20

                // Update total width calculation to include Total Rank Score
                const avgTotalWidth = finalRankWidth + titleWidth + (evaluatorColWidth * evaluatorCount) + totalRankScoreWidth + avgRankWidth
                const avgStartX = (pageWidth - avgTotalWidth) / 2
                
                // Create column styles dynamically
                const columnStyles = {
                    0: { cellWidth: finalRankWidth, fontStyle: 'bold' },
                    1: { cellWidth: titleWidth, halign: 'left' },
                    [evaluatorCount + 1]: { cellWidth: totalRankScoreWidth, fillColor: [192, 57, 43], textColor: [255, 255, 255], fontStyle: 'bold' }, // Total Rank Score column
                    [evaluatorCount + 2]: { cellWidth: avgRankWidth, fillColor: [230, 126, 34], textColor: [255, 255, 255], fontStyle: 'bold' } // Average Rank column
                }

                // Add styles for evaluator columns with proper text handling
                for (let i = 0; i < evaluatorCount; i++) {
                    columnStyles[i + 2] = { 
                        cellWidth: evaluatorColWidth,
                        fontStyle: 'normal',
                        fontSize: 7,
                        halign: 'center'
                    }
                }
                
                // Generate table
                doc.autoTable({
                    head: [headers],
                    body: body,
                    startY: yPos,
                    margin: { left: avgStartX, right: pageWidth - avgStartX - avgTotalWidth },
                    theme: 'grid',
                    styles: { 
                        fontSize: 8, 
                        cellPadding: 2,
                        font: 'Quattrocento Sans',
                        halign: 'center',
                        valign: 'middle',
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                        textColor: [0, 0, 0],
                        overflow: 'linebreak' // Allow text to wrap
                    },
                    headStyles: { 
                        fillColor: [155, 89, 182], // #9b59b6
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 8,
                        font: 'Quattrocento Sans',
                        halign: 'center',
                        valign: 'middle'
                    },
                    columnStyles: columnStyles,
                    didParseCell: function(data) {
                        // Style final rank column (index 0)
                        if (data.column.index === 0 && data.section === 'body') {
                            const rank = parseInt(data.cell.raw)
                            if (rank === 1) {
                                data.cell.styles.fillColor = [241, 196, 15] // Gold
                                data.cell.styles.textColor = [255, 255, 255]
                            } else if (rank === 2) {
                                data.cell.styles.fillColor = [189, 195, 199] // Silver
                                data.cell.styles.textColor = [255, 255, 255]
                            } else if (rank === 3) {
                                data.cell.styles.fillColor = [205, 127, 50] // Bronze
                                data.cell.styles.textColor = [255, 255, 255]
                            }
                        }
                        
                        // Style top rank per evaluator
                        if (data.section === 'body' && data.column.index > 1 && data.column.index < evaluatorCount + 1) {
                            const rankValue = parseFloat(data.cell.raw)
                            if (rankValue === 1) {
                                data.cell.styles.fillColor = [39, 174, 96] // Green
                                data.cell.styles.textColor = [255, 255, 255]
                                data.cell.styles.fontStyle = 'bold'
                            }
                        }
                        
                        // Style header cells - ensure evaluator names are properly displayed
                        if (data.section === 'head' && data.column.index > 1 && data.column.index < evaluatorCount + 1) {
                            data.cell.styles.halign = 'center';
                            data.cell.styles.valign = 'middle';
                            data.cell.styles.cellWidth = evaluatorColWidth;
                            // Allow text to wrap in header
                            data.cell.styles.overflow = 'linebreak';
                        }
                    }
                })
                
                yPos = doc.lastAutoTable.finalY + 15
            }
            
            // Add footer with page numbers - CENTERED
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(9)
                doc.setFont('Quattrocento Sans', 'normal')
                doc.setTextColor(100, 100, 100)
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                )
            }
            
            // Save the file
            const eventNameForFile = data.event?.name?.replace(/[^a-z0-9]/gi, '_') || 'Event'
            doc.save(`${eventNameForFile}_${data.category?.name?.replace(/[^a-z0-9]/gi, '_') || 'Summary'}_Report.pdf`)
            
        } catch (error) {
            alert('Error exporting to PDF: ' + error.message)
        }
    }
    return container
}
import { $, Path, Request } from "../../../../lib/lib.js"
const XLSX = window.XLSX
const jsPDF = window.jspdf?.jsPDF || window.jspdf

export const Summary = () => {
    let panel
    let eventId = Path(4) || ''
    let categoryId = Path(6) || '0'
    
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
            fontSize: '18px',
            color: '#2c3e50',
            backgroundColor: 'white',
            padding: '20px 40px',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        text: 'Loading summary report...'
    })
    container.appendChild(loadingDiv)

    // Fetch data from API - USING CORRECT ENDPOINT
    const req = new Request('/ranking')
    req.Post([
        { name: 'generateSummaryReport', value: '1' },
        { name: 'eventId', value: eventId },
        { name: 'categoryId', value: categoryId }
    ])
    req.Json()
    
    req.Send().then(response => {
        container.removeChild(loadingDiv)
        
        if (!response.success) {
            container.appendChild(createErrorPanel(response.error || 'Failed to load data'))
            return
        }
        
        const data = response.data
        
        container.appendChild(createHeader(data))
        container.appendChild(createContent(data))
    }).catch(error => {
        container.removeChild(loadingDiv)
        container.appendChild(createErrorPanel('Network error: ' + error.message))
    })

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
                        method: () => { if (panel) panel.remove() }
                    }
                })
            ]
        })
    }

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
                        backgroundColor: 'transparent',
                        color: 'deepskyblue',
                        border:'solid thin deepskyblue',
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
                        method: () => { if (panel) panel.remove() }
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
        })
    }

    // Main Content - EXACT EXCEL FORMAT WITH AVERAGE RANKS
    const createContent = (data) => {
        if (!data) return $({ tag: 'div', text: 'No data available' })
        
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
        })

        // Main wrapper
        const wrapper = $({
            tag: 'div',
            style: {
                width: '100%',
                minWidth: '1200px',
                margin: '0 auto',
                backgroundColor: '#ddd',
                padding: '30px',
                boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                border: 'solid 1px #ddd'
            }
        })

        // HEADER SECTION - DYNAMIC EVENT TITLE 
        wrapper.appendChild($({
            tag: 'div',
            style: {
                fontSize: '30px',
                fontWeight: 'bold',
                color: '#040720',
                textAlign: 'center',
                marginBottom: '5px',
                fontFamily: 'Quattrocento Sans',
                textTransform: 'uppercase'
            },
            text: data.event?.name || data.event?.title
        }))

        wrapper.appendChild($({
            tag: 'div',
            style: {
                fontSize: '19px',
                fontWeight: 'bold',
                color: '#040720',
                textAlign: 'center',
                marginBottom: '25px',
                fontFamily: 'Quattrocento Sans',
                textTransform: 'uppercase'
            },
            text: `${data.category?.type}: ${data.category?.name || ''}`
        }))

        // Get document columns from the first evaluator
        let documentColumns = []
        let documentTitles = {}
        let maxTitleLength = 0
        
        if (data.evaluators && data.evaluators.length > 0 && data.evaluators[0].documents) {
            const documents = Object.values(data.evaluators[0].documents)
            documents.sort((a, b) => a.column - b.column)
            
            documents.forEach(doc => {
                documentColumns.push(doc.column)
                documentTitles[doc.id] = doc.title
                // Calculate max title length for dynamic width
                maxTitleLength = Math.max(maxTitleLength, doc.title.length)
            })
        }
        
        const documentCount = documentColumns.length;
        
        const criteriaColWidth = 280;
        const baseCharWidth = 8;
        const minScoreWidth = 80;
        const maxScoreWidth = 320;
        let scoreColWidth = Math.min(maxScoreWidth, Math.max(minScoreWidth, maxTitleLength * baseCharWidth));
        
        // If there are many documents, cap the width to prevent overflow
        if (documentCount > 10) {
            scoreColWidth = Math.min(scoreColWidth, 120);
        }
        
        //total table width
        const totalTableWidth = criteriaColWidth + (scoreColWidth * documentCount);
        
        // Fetch final rank data FIRST
        let finalRankData = null;
        
        // Create a synchronous XMLHttpRequest to get final rank data
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/ranking', false); // false makes it synchronous
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        const params = new URLSearchParams({
            getFinalRank: '1',
            eventId: eventId,
            categoryId: categoryId
        }).toString();
        
        xhr.send(params);
        
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    finalRankData = response.data;
                }
            } catch (e) {
                console.error('Error parsing final rank data:', e);
            }
        }
        
        // EVALUATOR SHEETS 
        if (data.evaluators && Array.isArray(data.evaluators)) {
            data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                const evaluator = evaluatorSheet.evaluator
                
                // Evaluator Header (centered)
                wrapper.appendChild($({
                    tag: 'div',
                    style: {
                        fontSize: '19px',
                        fontWeight: 'bold',
                        color: '#040720',
                        marginTop: evalIndex > 0 ? '30px' : '10px',
                        marginBottom: '5px',
                        marginLeft: '30px',
                        fontFamily: 'Quattrocento Sans',
                        fontWeight: 'bold',
                        textAlign: 'left',
                        width: '100%'
                    },
                    text: `Evaluator ${evaluator.number}: ${evaluator.name}`
                }))

                wrapper.appendChild($({
                    tag: 'div',
                    style: {
                        fontSize: '25px',
                        fontWeight: 'bold',
                        color: '#040720',
                        textAlign: 'center',
                        alignItems: 'center',
                        marginBottom: '20px',
                        fontFamily: 'Quattrocento Sans',
                        textTransform: 'uppercase',
                        borderBottom: 'solid 2px #545770',
                        paddingBottom: '10px',
                        width: '100%',  
                        maxWidth: '1000px', 
                        marginLeft: 'auto',
                        marginRight: 'auto'  
                    },
                    text: 'Score Sheet'
                }))

                // Create table container with fixed width and auto margins for centering
                const tableContainer = $({
                    tag: 'div',
                    style: {
                        width: `${totalTableWidth}px`,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        borderCollapse: 'collapse'
                    }
                });

                // CRITERIA ROW (Column Headers) 
                const criteriaRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderTop: 'solid 2px #040720',
                        borderLeft: 'solid 1px #040720',
                        borderRight: 'solid 1px #040720',
                        backgroundColor: evalIndex % 3 === 0 ? '#b4c6e7' : evalIndex % 3 === 1 ? '#a8d08d' : '#ffd965',      
                        fontWeight: 'bold'
                    }
                })

                // CRITERIA cell
                criteriaRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${criteriaColWidth}px`,
                        padding: '8px 5px',
                        borderRight: 'solid 1px #040720',
                        borderBottom: 'solid 1px #040720',
                        fontSize: '20px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: evalIndex % 3 === 0 ? '#b4c6e7' : evalIndex % 3 === 1 ? '#a8d08d' : '#ffd965',   
                    },
                    text: 'CRITERIA'
                }))

                // Column numbers
                documentColumns.forEach((col) => {
                    criteriaRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${scoreColWidth}px`,
                            padding: '8px 2px',
                            borderRight: 'solid 1px #040720',
                            borderBottom: 'solid 1px #040720',
                            textAlign: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontFamily: 'Quattrocento Sans',
                            backgroundColor: evalIndex % 3 === 0 ? '#b4c6e7' : evalIndex % 3 === 1 ? '#a8d08d' : '#ffd965', 
                        },
                        text: col
                    }))
                })
                tableContainer.appendChild(criteriaRow)

                // TITLE ROW 
                const titleRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderLeft: 'solid 1px #040720',
                        borderRight: 'solid 1px #040720',
                        backgroundColor: '#f9f9f9'
                    }
                })

                titleRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${criteriaColWidth}px`,
                        padding: '8px 5px',
                        borderRight: 'solid 1px #040720',
                        borderBottom: 'solid 1px #040720',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: '#f9f9f9',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    },
                    text: 'TITLE'
                }))

                // Document titles
                const documents = Object.values(evaluatorSheet.documents || {})
                documents.sort((a, b) => a.column - b.column)
                
                documents.forEach((doc) => {
                    titleRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${scoreColWidth}px`,
                            padding: '8px 2px',
                            borderRight: 'solid 1px #040720',
                            borderBottom: 'solid 1px #040720',
                            textAlign: 'center',
                            fontSize: scoreColWidth > 100 ? '12px' : '11px',
                            fontFamily: 'Times New Roman',
                            wordWrap: 'break-word',  
                            whiteSpace: 'normal',         
                            overflow: 'visible',
                            color: '#325BBA',
                            backgroundColor: '#f9f9f9',
                            lineHeight: '1.2'
                        },
                        att: { title: doc.title },
                        text: doc.title 
                    }))
                })
                tableContainer.appendChild(titleRow)

                // CRITERIA SCORE ROWS 
                if (evaluatorSheet.criteria_rows && Array.isArray(evaluatorSheet.criteria_rows)) {
                    evaluatorSheet.criteria_rows.forEach((criteriaRow, critIndex) => {
                        const scoreRow = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: '100%',
                                borderLeft: 'solid 1px #040720',
                                borderRight: 'solid 1px #040720',
                                backgroundColor: critIndex % 2 === 0 ? '#fff' : '#f9f9f9'
                            }
                        })

                        // Criteria name with percentage
                        const criteriaName = criteriaRow.percentage 
                            ? `${criteriaRow.name}` 
                            : criteriaRow.name
                        
                        scoreRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${criteriaColWidth}px`,
                                padding: '8px 5px',
                                borderRight: 'solid 1px #040720',
                                borderBottom: critIndex === evaluatorSheet.criteria_rows.length - 1 ? 'solid 2px #040720' : 'solid 1px #040720',
                                fontSize: '14px',
                                fontFamily: 'Arial Narrow',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                whiteSpace: 'normal',
                                overflow: 'visible',
                                wordWrap: 'break-word'
                            },
                            att: { title: criteriaName },
                            text: criteriaName
                        }))

                        // Scores for each document
                        const scores = criteriaRow.scores || {}
                        
                        documents.forEach((doc) => {
                            const score = scores[doc.column] !== undefined ? scores[doc.column] : 0
                            
                            scoreRow.appendChild($({
                                tag: 'div',
                                style: {
                                    width: `${scoreColWidth}px`,
                                    padding: '8px 2px',
                                    borderRight: 'solid 1px #040720',
                                    borderBottom: critIndex === evaluatorSheet.criteria_rows.length - 1 ? 'solid 2px #040720' : 'solid 1px #040720',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontFamily: 'Times New Roman',
                                },
                                text: score > 0 
                                    ? (Number.isInteger(score) ? score : score.toFixed(1)) 
                                    : '0'
                            }))
                        })
                        
                        tableContainer.appendChild(scoreRow)
                    })
                }
                
                // TOTAL ROW 
                const totalRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderLeft: 'solid 1px #040720',
                        borderRight: 'solid 1px #040720',
                        borderBottom: 'solid 2px #040720',
                        backgroundColor: '#ffffff',
                        fontWeight: 'bold'
                    }
                })

                totalRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${criteriaColWidth}px`,
                        padding: '8px 5px',
                        borderRight: 'solid 1px #040720',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        fontFamily: 'Times New Roman',
                        backgroundColor: '#ffffff'
                    },
                    text: 'Total'
                }))

                documents.forEach((doc) => {
                    totalRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${scoreColWidth}px`,
                            padding: '8px 2px',
                            borderRight: 'solid 1px #040720',
                            textAlign: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fontFamily: 'Times New Roman',
                            backgroundColor: '#ffffff'
                        },
                        text: (doc.total_score || 0).toFixed(1)
                    }))
                })
                tableContainer.appendChild(totalRow)
                
                // RANK ROW (PER EVALUATOR) 
                if (evaluatorSheet.rank_row) {
                    const rankRow = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            borderLeft: 'solid 1px #040720',
                            borderRight: 'solid 1px #040720',
                            borderBottom: 'solid 2px #040720',
                            backgroundColor: '#ffe6b3',
                            fontWeight: 'bold'
                        }
                    })

                    rankRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${criteriaColWidth}px`,
                            padding: '8px 5px',
                            borderRight: 'solid 1px #040720',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontFamily: 'Times New Roman',
                            backgroundColor: '#ffe6b3',
                            color: '#8b4513'
                        },
                        text: 'Rank'
                    }))

                    documents.forEach((doc) => {
                        const rankValue = evaluatorSheet.rank_row[doc.column] || ''
                        rankRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${scoreColWidth}px`,
                                padding: '8px 2px',
                                borderRight: 'solid 1px #040720',
                                textAlign: 'center',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                fontFamily: 'Times New Roman',
                                backgroundColor: '#ffe6b3',
                                color: '#8b4513'
                            },
                            text: rankValue
                        }))
                    })
                    tableContainer.appendChild(rankRow)
                }

                // FINAL CONSOLIDATED RANK ROW (1224 STANDARD) - ADD THIS AFTER RANK ROW
                if (finalRankData && finalRankData.final_rank_rows) {
                    const finalRankRowData = finalRankData.final_rank_rows[evaluator.id];
                    
                    if (finalRankRowData) {
                        const finalRankRow = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: '100%',
                                borderLeft: 'solid 1px #9b59b6',
                                borderRight: 'solid 1px #9b59b6',
                                borderBottom: 'solid 2px #9b59b6',
                                backgroundColor: '#e1d5e7',
                                fontWeight: 'bold',
                                marginTop: '5px'
                            }
                        });

                        finalRankRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${criteriaColWidth}px`,
                                padding: '8px 5px',
                                borderRight: 'solid 1px #9b59b6',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                fontFamily: 'Quattrocento Sans',
                                backgroundColor: '#e1d5e7',
                                color: '#4a235a'
                            },
                            text: 'Final Rank (1224)'
                        }));

                        documents.forEach((doc) => {
                            const finalRank = finalRankRowData[doc.column] || '';
                            
                            // Style based on rank
                            let bgColor = '#e1d5e7';
                            let textColor = '#4a235a';
                            let fontWeight = 'bold';
                            
                            if (finalRank === 1) {
                                bgColor = '#f1c40f'; // Gold
                                textColor = '#000000';
                            } else if (finalRank === 2) {
                                bgColor = '#bdc3c7'; // Silver
                                textColor = '#000000';
                            } else if (finalRank === 3) {
                                bgColor = '#cd7f32'; // Bronze
                                textColor = '#ffffff';
                            }
                            
                            finalRankRow.appendChild($({
                                tag: 'div',
                                style: {
                                    width: `${scoreColWidth}px`,
                                    padding: '8px 2px',
                                    borderRight: 'solid 1px #9b59b6',
                                    textAlign: 'center',
                                    fontSize: '18px',
                                    fontWeight: fontWeight,
                                    fontFamily: 'Quattrocento Sans',
                                    backgroundColor: bgColor,
                                    color: textColor
                                },
                                text: finalRank
                            }));
                        });

                        tableContainer.appendChild(finalRankRow);
                    }
                }

                wrapper.appendChild(tableContainer);

                // Add spacing after rank rows
                wrapper.appendChild($({
                    tag: 'div',
                    style: { height: '30px', width: '100%' }
                }))
            })
        }
        
        // CRITERIA RANKINGS SECTIONS 
        if (data.criteria_rankings && Object.keys(data.criteria_rankings).length > 0) {
            
            // Add spacing before criteria rankings
            wrapper.appendChild($({
                tag: 'div',
                style: { height: '40px', width: '100%' }
            }))
            
            // Title for criteria rankings section
            wrapper.appendChild($({
                tag: 'div',
                style: {
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#040720',
                    textAlign: 'center',
                    alignItems: 'center',
                    marginBottom: '20px',
                    fontFamily: 'Quattrocento Sans',
                    textTransform: 'uppercase',
                    borderBottom: 'solid 2px #333',
                    paddingBottom: '10px',
                    width: '100%',  
                    maxWidth: '1000px', 
                    marginLeft: 'auto',
                    marginRight: 'auto'  
                },
                text: 'RANKING BY CRITERIA'
            }))
            
            // Create centered container for rankings
            const rankingsContainer = $({
                tag: 'div',
                style: {
                    width: `${totalTableWidth}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }
            });
            
            // Get all criteria IDs and sort them
            const criteriaIds = Object.keys(data.criteria_rankings).sort((a, b) => parseInt(a) - parseInt(b))
            
            // Loop through each criteria
            criteriaIds.forEach((criteriaId, index) => {
                const criteriaData = data.criteria_rankings[criteriaId]
                const criteriaName = criteriaData.name
                const rankings = criteriaData.rankings || []
                
                // Create a map of column to rank for this criteria
                const rankMap = {}
                const scoreMap = {}
                rankings.forEach(item => {
                    rankMap[item.column] = item.rank
                    scoreMap[item.column] = item.total_score
                })
                
                // Criteria header with alternating colors
                const headerColors = ['#b4c6e7', '#a8d08d', '#ffd965', '#f4b084', '#c2a5cf']
                const headerColor = headerColors[index % headerColors.length]
                
                // Criteria name header
                rankingsContainer.appendChild($({
                    tag: 'div',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#040720',
                        marginTop: index > 0 ? '30px' : '10px',
                        marginBottom: '10px',
                        fontFamily: 'Quattrocento Sans',
                        padding: '8px 15px',
                        backgroundColor: headerColor,
                        borderLeft: 'solid 3px #040720',
                        borderRight: 'solid 3px #040720',
                        borderTop: 'solid 2px #040720',
                        borderBottom: 'solid 2px #040720',
                        borderRadius: '5px 5px 0 0'
                    },
                    text: `${criteriaName}`
                }))
                
                // Create ranking row for this criteria
                const criteriaRankRow = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        borderLeft: 'solid 1px #040720',
                        borderRight: 'solid 1px #040720',
                        borderBottom: 'solid 2px #040720',
                        backgroundColor: headerColor,
                        fontWeight: 'bold',
                        marginBottom: '15px'
                    }
                })

                // Label cell
                criteriaRankRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${criteriaColWidth}px`,
                        padding: '8px 5px',
                        borderRight: 'solid 1px #040720',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: headerColor
                    },
                    text: 'RANK'
                }))

                // Rank value cells
                documentColumns.forEach((col) => {
                    const rank = rankMap[col] !== undefined ? rankMap[col] : ''
                    criteriaRankRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${scoreColWidth}px`,
                            padding: '8px 2px',
                            borderRight: 'solid 1px #040720',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            fontFamily: 'Quattrocento Sans',
                            backgroundColor: headerColor
                        },
                        text: rank
                    }))
                })
                rankingsContainer.appendChild(criteriaRankRow)
                
                // Add score details row
                if (rankings.length > 0) {
                    const scoreDetailsRow = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            borderLeft: 'solid 1px #ddd',
                            borderRight: 'solid 1px #ddd',
                            borderBottom: 'solid 1px #ddd',
                            backgroundColor: '#f9f9f9',
                            fontSize: '12px',
                            marginBottom: '5px'
                        }
                    })

                    scoreDetailsRow.appendChild($({
                        tag: 'div',
                        style: {
                            width: `${criteriaColWidth}px`,
                            padding: '4px 5px',
                            borderRight: 'solid 1px #ddd',
                            fontFamily: 'Quattrocento Sans',
                            fontStyle: 'italic',
                            color: '#555'
                        },
                        text: 'Total Score'
                    }))

                    documentColumns.forEach((col) => {
                        const score = scoreMap[col] || 0
                        scoreDetailsRow.appendChild($({
                            tag: 'div',
                            style: {
                                width: `${scoreColWidth}px`,
                                padding: '4px 2px',
                                borderRight: 'solid 1px #ddd',
                                textAlign: 'center',
                                fontFamily: 'Quattrocento Sans',
                                color: '#555'
                            },
                            text: score.toFixed(1)
                        }))
                    })
                    rankingsContainer.appendChild(scoreDetailsRow)
                }
            })
            
            wrapper.appendChild(rankingsContainer);
        }

        // AVERAGE RANK SECTION 
        wrapper.appendChild(createAverageRankSection(eventId, categoryId, documentColumns, data))

        // FINAL RANK ROW (Global) - Remove this section if it's duplicate
        if (data.rankings && data.rankings.length > 0) {
            const finalRankContainer = $({
                tag: 'div',
                style: {
                    width: `${totalTableWidth}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: '30px'
                }
            });
            
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
            })

            rankRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${criteriaColWidth}px`,
                    padding: '8px 5px',
                    borderRight: 'solid 1px #FFA500',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontFamily: 'Quattrocento Sans',
                    backgroundColor: '#FFA500'
                },
                text: 'RANK'
            }))

            // Create a map of column to rank
            const rankMap = {}
            data.rankings.forEach(item => {
                rankMap[item.column] = item.rank
            })

            documentColumns.forEach((col) => {
                rankRow.appendChild($({
                    tag: 'div',
                    style: {
                        width: `${scoreColWidth}px`,
                        padding: '8px 2px',
                        borderRight: 'solid 1px #FFA500',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        fontFamily: 'Quattrocento Sans',
                        backgroundColor: '#FFA500'
                    },
                    text: rankMap[col] !== undefined ? rankMap[col] : ''
                }))
            })
            
            finalRankContainer.appendChild(rankRow);
            wrapper.appendChild(finalRankContainer);
        }

        contentDiv.appendChild(wrapper)
        return contentDiv
    }

    //  AVERAGE RANK SECTION 
    const createAverageRankSection = (eventId, categoryId, documentColumns, summaryData) => {
        const container = $({
            tag: 'div',
            style: {
                width: '100%',
                marginTop: '40px',
                marginBottom: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }
        })

        // Title (centered)
        container.appendChild($({
            tag: 'div',
            style: {
                fontSize: '22px',
                fontWeight: 'bold',
                color: '#040720',
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: 'Quattrocento Sans',
                textTransform: 'uppercase',
                borderBottom: 'solid 2px #9b59b6',
                paddingBottom: '10px',
                width: '100%',
                maxWidth: '1000px'
            },
            text: 'AVERAGE RANK ACROSS ALL EVALUATORS'
        }))

        // Loading indicator (centered)
        const loadingDiv = $({
            tag: 'div',
            style: {
                textAlign: 'center',
                padding: '20px',
                color: '#666',
                fontStyle: 'italic'
            },
            text: 'Loading average ranks...'
        })
        container.appendChild(loadingDiv)

        // Fetch average rank data
        const req = new Request('/ranking')
        req.Post([
            { name: 'getAverageRank', value: '1' },
            { name: 'eventId', value: eventId },
            { name: 'categoryId', value: categoryId }
        ])
        req.Json()
        
        req.Send().then(response => {
            // Remove loading indicator
            container.removeChild(loadingDiv)
            
            if (!response.success || !response.data) {
                container.appendChild($({
                    tag: 'div',
                    style: {
                        padding: '20px',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: 'solid 1px #ffeeba',
                        borderRadius: '4px',
                        textAlign: 'center'
                    },
                    text: response.error || 'No average rank data available'
                }))
                return
            }

            const rankData = response.data
            
            //  GET EVALUATOR NAMES FROM SUMMARY DATA 
            let evaluatorNames = []
            if (summaryData && summaryData.evaluators && summaryData.evaluators.length > 0) {
                evaluatorNames = summaryData.evaluators.map(evalSheet => {
                    const evaluator = evalSheet.evaluator
                    const fullName = evaluator.name
                    
                    return {
                        full: fullName,
                        number: evaluator.number
                    }
                })
            }
            
            //  DYNAMIC COLUMN WIDTH CALCULATION 
            const evaluatorCount = evaluatorNames.length
            
            // Calculate maximum name length to determine column width
            let maxNameLength = 0
            evaluatorNames.forEach(evaluator => {
                maxNameLength = Math.max(maxNameLength, evaluator.full.length)
            })
            
            const finalRankWidth = 100
            const averageRankWidth = 120
            
            const minEvalWidth = Math.max(180, maxNameLength * 8)
            const maxEvalWidth = 350 // Upper limit for very long names
            const minTitleWidth = 300
            const maxTitleWidth = 500
            
            // Calculate total width dynamically
            let evaluatorColWidth = Math.min(maxEvalWidth, minEvalWidth)
            let titleWidth = Math.min(maxTitleWidth, Math.max(minTitleWidth, 400))
            
            // Adjust if total is too wide
            let totalWidth = finalRankWidth + titleWidth + (evaluatorColWidth * evaluatorCount) + averageRankWidth
            const maxTotalWidth = 1600 // Maximum table width
            
            if (totalWidth > maxTotalWidth) {
                // Scale down proportionally
                const scaleFactor = maxTotalWidth / totalWidth
                titleWidth = Math.floor(titleWidth * scaleFactor)
                evaluatorColWidth = Math.floor(evaluatorColWidth * scaleFactor)
                totalWidth = finalRankWidth + titleWidth + (evaluatorColWidth * evaluatorCount) + averageRankWidth + 30
            }
            
            // Create average rank table with fixed width
            const table = $({
                tag: 'div',
                style: {
                    width: `${totalWidth}px`,
                    border: 'solid 1px #9b59b6',
                    marginTop: '10px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    overflow: 'visible'
                }
            })

            //  HEADER ROW 
            const headerRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#9b59b6',
                    color: 'white',
                    fontWeight: 'bold',
                    borderBottom: 'solid 2px #040720'
                }
            })

            // Final Rank header
            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${finalRankWidth}px`,
                    padding: '12px 5px',
                    borderRight: 'solid 1px #fff',
                    textAlign: 'center',
                    fontSize: '14px',
                    backgroundColor: '#9b59b6',
                    flexShrink: 0
                },
                text: 'Final Rank'
            }))

            // Document Title header
            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${titleWidth}px`,
                    padding: '12px 5px',
                    borderRight: 'solid 1px #fff',
                    textAlign: 'center',
                    fontSize: '14px',
                    backgroundColor: '#9b59b6',
                    flexShrink: 0
                },
                text: 'Document Title'
            }))
            
            // Evaluator headers - WITH FULL NAMES, NO TRUNCATION
            evaluatorNames.forEach((evaluator, index) => {
                const headerCell = $({
                    tag: 'div',
                    style: {
                        width: `${evaluatorColWidth}px`,
                        padding: '12px 5px',
                        borderRight: index < evaluatorNames.length - 1 ? 'solid 1px #fff' : 'none',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'help',
                        backgroundColor: '#9b59b6',
                        flexShrink: 0,
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        lineHeight: '1.3'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                display: 'inline',
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                                fontSize: '12px'
                            },
                            text: evaluator.full // FULL NAME
                        })
                    ]
                })
                
                // Still keep title attribute for additional info
                headerCell.setAttribute('title', evaluator.full)
                headerRow.appendChild(headerCell)
            })
            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${averageRankWidth}px`, // Reuse average rank width or adjust as needed
                    padding: '12px 5px',
                    borderRight: 'solid 1px #fff',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#f39c12', // Different color to distinguish
                    flexShrink: 0
                },
                text: 'Total Rank Score'
            }))
            // Average Rank header
            headerRow.appendChild($({
                tag: 'div',
                style: {
                    width: `${averageRankWidth}px`,
                    padding: '12px 5px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#e67e22',
                    flexShrink: 0
                },
                text: 'Average Rank'
            }))

            table.appendChild(headerRow)

            // Sort documents by final rank
            const sortedDocs = Object.values(rankData.average_ranks || {}).sort((a, b) => a.final_rank - b.final_rank)

            // Data rows
            sortedDocs.forEach((doc, index) => {
                const row = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        width: '100%',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        borderBottom: index === sortedDocs.length - 1 ? 'none' : 'solid 1px #ddd'
                    }
                })

                // Final rank cell
                const rankColor = doc.final_rank === 1 ? '#f1c40f' : 
                                doc.final_rank === 2 ? '#bdc3c7' : 
                                doc.final_rank === 3 ? '#cd7f32' : '#9b59b6'
                
                const rankCell = $({
                    tag: 'div',
                    style: {
                        width: `${finalRankWidth}px`,
                        padding: '10px 5px',
                        borderRight: 'solid 1px #ddd',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: rankColor,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                display: 'inline-block',
                                width: '30px',
                                height: '30px',
                                lineHeight: '30px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                textAlign: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            },
                            text: doc.final_rank
                        })
                    ]
                })
                row.appendChild(rankCell)

                const titleCell = $({
                    tag: 'div',
                    style: {
                        width: `${titleWidth}px`,
                        padding: '10px 5px',
                        borderRight: 'solid 1px #ddd',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        lineHeight: '1.4',
                        flexShrink: 0
                    },
                    text: doc.title
                })
                titleCell.setAttribute('title', doc.title)
                row.appendChild(titleCell)

                // Individual evaluator ranks
                const rankByColumn = {}
                if (doc.final_ranks && Array.isArray(doc.final_ranks)) {
                    doc.final_ranks.forEach((rank, idx) => {
                        rankByColumn[idx + 1] = rank
                    })
                }

                for (let i = 1; i <= evaluatorNames.length; i++) {
                    const rankValue = rankByColumn[i] !== undefined ? rankByColumn[i] : ''
                    const isTopRank = rankValue === 1
                    
                    const rankCell = $({
                        tag: 'div',
                        style: {
                            width: `${evaluatorColWidth}px`,
                            padding: '10px 5px',
                            borderRight: i < evaluatorNames.length ? 'solid 1px #ddd' : 'none',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isTopRank ? '#27ae60' : '#34495e',
                            backgroundColor: isTopRank ? '#e8f8f5' : 'transparent',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        child: [
                            $({
                                tag: 'span',
                                style: {
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    borderRadius: isTopRank ? '20px' : '0',
                                    backgroundColor: isTopRank ? '#27ae60' : 'transparent',
                                    color: isTopRank ? 'white' : 'inherit',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                },
                                text: rankValue !== '' ? rankValue : '—'
                            })
                        ]
                    })
                    
                    if (evaluatorNames[i-1]) {
                        const rankText = rankValue !== '' ? `Final Rank: ${rankValue}` : 'Not scored'
                        rankCell.setAttribute('title', `${evaluatorNames[i-1].full}: ${rankText}`)
                    }
                    
                    row.appendChild(rankCell)
                }

                // ADD TOTAL RANK SCORE CELL (NEW)
                const totalRankScore = doc.total_rank_score || 0
                const totalScoreCell = $({
                    tag: 'div',
                    style: {
                        width: `${averageRankWidth}px`,
                        padding: '10px 5px',
                        borderRight: 'solid 1px #ddd',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#c0392b',
                        backgroundColor: '#fde9e9',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#c0392b',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            },
                            text: totalRankScore.toFixed(1)
                        })
                    ]
                })
                totalScoreCell.setAttribute('title', `Sum of final ranks from all evaluators`)
                row.appendChild(totalScoreCell)

                // Average rank cell
                const avgValue = doc.formatted_average || (doc.average ? doc.average.toFixed(1) : '0.0')
                const avgCell = $({
                    tag: 'div',
                    style: {
                        width: `${averageRankWidth}px`,
                        padding: '10px 5px',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#e67e22',
                        backgroundColor: '#fff3e0',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#e67e22',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            },
                            text: avgValue
                        })
                    ]
                })
                avgCell.setAttribute('title', `Average of final ranks from ${doc.count || evaluatorNames.length} evaluators`)
                row.appendChild(avgCell)

                table.appendChild(row)
            })

            container.appendChild(table)

            // Legend and Summary (centered with table)
            const legendAndSummary = $({
                tag: 'div',
                style: {
                    marginTop: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    width: `${totalWidth}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                },
                child: [
                    // Legend
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '20px',
                            padding: '8px 15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '20px',
                            fontSize: '12px',
                            flexWrap: 'wrap'
                        },
                        child: [
                            $({ tag: 'span', style: { display: 'flex', alignItems: 'center', gap: '4px' }, 
                                child: [
                                    $({ tag: 'span', style: { fontSize: '16px' }, text: '🥇' }),
                                    $({ tag: 'span', text: '1st Place' })
                                ] 
                            }),
                            $({ tag: 'span', style: { display: 'flex', alignItems: 'center', gap: '4px' }, 
                                child: [
                                    $({ tag: 'span', style: { fontSize: '16px' }, text: '🥈' }),
                                    $({ tag: 'span', text: '2nd Place' })
                                ] 
                            }),
                            $({ tag: 'span', style: { display: 'flex', alignItems: 'center', gap: '4px' }, 
                                child: [
                                    $({ tag: 'span', style: { fontSize: '16px' }, text: '🥉' }),
                                    $({ tag: 'span', text: '3rd Place' })
                                ] 
                            })
                        ]
                    }),
                    // Summary
                    $({
                        tag: 'div',
                        style: {
                            padding: '8px 15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: '#666'
                        },
                        child: [
                            $({ tag: 'span', style: { marginRight: '15px' }, text: `👥 Evaluators: ${rankData.summary?.total_evaluators || 0}` }),
                            $({ tag: 'span', style: { marginRight: '15px' }, text: `📄 Documents: ${rankData.summary?.total_documents || 0}` }),
                            $({ tag: 'span', text: `🕒 ${rankData.summary?.generated_at || ''}` })
                        ]
                    })
                ]
            })

            container.appendChild(legendAndSummary)

        }).catch(error => {
            if (container.contains(loadingDiv)) {
                container.removeChild(loadingDiv)
            }
            container.appendChild($({
                tag: 'div',
                style: {
                    padding: '20px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: 'solid 1px #f5c6cb',
                    borderRadius: '4px',
                    textAlign: 'center',
                    width: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                },
                text: 'Error loading average ranks: ' + error.message
            }))
        })

        return container
    }
    //  EXPORT TO EXCEL
    const exportToExcel = async (data) => {  // Add async here
        if (!XLSX) {
            alert('Excel export library not loaded. Please refresh the page.')
            return
        }

        if (!data || !data.evaluators || data.evaluators.length === 0) {
            alert('No data available to export')
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
            
            const wb = XLSX.utils.book_new()
            
            // Create worksheet data
            let wsData = []
            
            // Title - DYNAMIC from database
            wsData.push([data.event?.name || '36TH IN-HOUSE REVIEW'])
            wsData.push([`${data.category?.type || 'CATEGORY'}: ${data.category?.name || ''}`])
            wsData.push([])
            
            // Get document columns from first evaluator
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
            
            // Process each evaluator - DATA PREPARATION ONLY (NO STYLING)
            if (data.evaluators && Array.isArray(data.evaluators)) {
                data.evaluators.forEach((evaluatorSheet, evalIndex) => {
                    const evaluator = evaluatorSheet.evaluator
                    
                    wsData.push([`Evaluator ${evaluator.number}: ${evaluator.name}`])
                    wsData.push(['Score Sheet'])
                    wsData.push([])
                    
                    // Header row with column numbers
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
                            
                            // Criteria name without percentage in parentheses
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
                    
                    // Rank row for evaluator
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
            
            //  CRITERIA RANKINGS IN EXCEL 
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
                    
                    // Create rank map
                    const rankMap = {}
                    rankings.forEach(item => {
                        rankMap[item.column] = item.rank
                    })
                    
                    // Criteria header
                    wsData.push([`${criteriaName}`])
                    
                    // Rank row
                    let rankRow = ['RANK']
                    documentColumns.forEach(col => {
                        rankRow.push(rankMap[col] || '')
                    })
                    wsData.push(rankRow)
                    
                    // Score row (optional)
                    let scoreRow = ['Total Score']
                    documentColumns.forEach(col => {
                        const rankingItem = rankings.find(item => item.column === col)
                        scoreRow.push(rankingItem ? parseFloat(rankingItem.total_score.toFixed(1)) : 0)
                    })
                    wsData.push(scoreRow)
                    wsData.push([])
                })
            }
            
            // ============ AVERAGE RANK SECTION IN EXCEL (USING API DATA) ============
            // Move this BEFORE creating the worksheet and column widths
            let evaluatorNames = []
            if (rankData && rankData.average_ranks) {
                // Get evaluator names from the original data - WITH FULL NAMES
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
                
                // Header row - USE FULL EVALUATOR NAMES
                let headerRow = ['Final Rank', 'Document Title', ...evaluatorNames, 'Total Rank Score', 'Average Rank']
                wsData.push(headerRow)
                
                // Get the pre-calculated average ranks from the API
                const sortedDocs = Object.values(rankData.average_ranks || {}).sort((a, b) => a.final_rank - b.final_rank)
                
                // Data rows - use the data from the API with Total Rank Score
                sortedDocs.forEach(doc => {
                    let row = [doc.final_rank, doc.title]
                    
                    // Add final ranks for each evaluator (from doc.final_ranks array)
                    for (let i = 0; i < evaluatorNames.length; i++) {
                        const rankValue = doc.final_ranks && doc.final_ranks[i] !== undefined ? doc.final_ranks[i] : ''
                        row.push(rankValue)
                    }
                    
                    // Add Total Rank Score
                    row.push(doc.total_rank_score || 0)
                    
                    // Add Average Rank
                    row.push(doc.formatted_average || doc.average?.toFixed(1) || '0.0')
                    wsData.push(row)
                })
            }
            
            if (wsData.length < 3) {
                throw new Error('No data to export')
            }
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData)
            
            // Calculate column widths - UPDATE THIS to include evaluator columns and Total Rank Score
            const baseColWidths = [
                { wch: 15 }, // Final Rank
                { wch: 50 }, // Document Title
                ...evaluatorNames.map(() => ({ wch: 25 })), // Evaluator columns - wider for full names
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
    const exportToPDF = async (data) => {  // Add async here
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
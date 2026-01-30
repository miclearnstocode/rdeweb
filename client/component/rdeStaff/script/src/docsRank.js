import {$} from "../../../../lib/lib.js";

export const RankDocs = ({evalName, docList}) => {
    const DocumentList = ({title, criteria, Total, category, center_code, display_name}) => {
        // SIMPLE SUM: Just add up all the scores (no weighting)
        const calculatedTotal = criteria.reduce((sum, criterion) => {
            // Convert score to number (handle string or number)
            const score = parseFloat(criterion.score) || 0;
            return sum + score;
        }, 0);
        
        // Use Total if provided, otherwise use calculated total
        const finalTotal = (Total !== undefined && !isNaN(Total) && Total !== null) ? 
                          Total : calculatedTotal;

        const CriteriaList = criteria.map(data => {
            const score = parseFloat(data.score) || 0;
            
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    border: 'solid thin #666',
                    color: 'black',
                    backgroundColor: '#f9f9f9'
                },
                child: [
                    $({
                        tag: 'div',
                        text: data.name,
                        style: {
                            width: '60%',
                            border: 'solid thin #666',
                            padding: '.3rem',
                            backgroundColor: 'white'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '20%',
                            border: 'solid thin #666',
                            padding: '.3rem',
                            textAlign: 'center',
                            backgroundColor: 'white'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: data.percentage,
                                style: {
                                    fontWeight: 'bold'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '20%',
                            border: 'solid thin #666',
                            padding: '.3rem',
                            textAlign: 'center',
                            backgroundColor: 'white'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: `${data.score}`,
                                style: {
                                    fontWeight: 'bold'
                                }
                            })
                        ]
                    })
                ]
            })
        });

        const TotalScore = () => {
            // Calculate the correct total to display
            const displayTotal = finalTotal;
            
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    marginRight: '0',
                    marginLeft: 'auto',
                    fontSize: '1.1vw',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: '#2c3e50',
                    border: 'solid thin #666',
                    marginTop: '1vh'
                },
                child: [
                    $({
                        tag: 'div',
                        text: 'TOTAL SCORE',
                        style: {
                            padding: '.4rem',
                            width: '80%',
                            textAlign: 'right',
                            fontWeight: 'bold'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: displayTotal,
                        style: {
                            padding: '.4rem',
                            fontSize: '1rem',
                            width: '20%',
                            textAlign: 'center',
                            backgroundColor: '#3498db',
                            fontWeight: 'bold'
                        }
                    }),
                ]
            }))
        }

        // Don't push TotalScore if we don't have any criteria
        if (criteria.length > 0) {
            CriteriaList.push(TotalScore());
        }

        // Add center/category info if available
        const centerInfo = display_name || category;
        
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                margin: '1vh auto auto',
                border: 'solid thin #ddd',
                padding: '.5rem',
                backgroundColor: 'white',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            },
            child: [
                // Center/Category information
                centerInfo && $({
                    tag: 'div',
                    style: {
                        display: 'inline-block',
                        width: '99%',
                        padding: '.3rem',
                        color: 'black',
                        fontSize: '0.9vw',
                        fontStyle: 'italic',
                        backgroundColor: '#f0f0f0',
                        marginBottom: '0.5rem',
                        borderRadius: '3px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: center_code ? 'Center: ' : 'Category: ',
                            style: {
                                fontWeight: 'bold',
                                color: 'deepskyblue'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: centerInfo,
                            style: {
                                color: 'black'
                            }
                        })
                    ]
                }),
                
                // Title
                $({
                    tag: 'div',
                    style: {
                        display: 'inline-block',
                        width: '99%',
                        padding: '.3rem',
                        color: 'deepskyblue',
                        fontSize: '1vw',
                        marginBottom: '0.5rem'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: 'Title: ',
                            style: {
                                fontWeight: 'bold',
                                color: 'black'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: `"${title}"`,
                            style: {
                                color: 'black',
                                fontStyle: 'italic'
                            }
                        })
                    ]
                }),
                
                // Criteria Table Header (only if we have criteria)
                criteria.length > 0 && $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        border: 'solid thin #666',
                        backgroundColor: '#34495e',
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: 'Criteria',
                            style: {
                                width: '60%',
                                padding: '.3rem',
                                textAlign: 'center'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '20%',
                                padding: '.3rem',
                                textAlign: 'center'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Score',
                            style: {
                                width: '20%',
                                padding: '.3rem',
                                textAlign: 'center'
                            }
                        })
                    ]
                }),
                
                // Criteria List (only if we have criteria)
                criteria.length > 0 && $({
                    tag: 'div',
                    child: CriteriaList
                }),
                
                // Message if no criteria
                criteria.length === 0 && $({
                    tag: 'div',
                    style: {
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#999',
                        fontStyle: 'italic'
                    },
                    text: 'No scores recorded for this document'
                })
            ].filter(Boolean) // Remove any falsy values
        }))
    }

    return $({
        tag: 'div',
        style: {
            width: '95%',
            padding: '.5rem',
            backgroundColor: 'white',
            margin: '1vh 2vh auto',
            fontFamily: 'Helvetica',
            userSelect: 'text',
            border: 'solid thin #ddd',
            borderRadius: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    fontSize: '1.2vw',
                    color: 'white',
                    fontWeight: 'bold',
                    backgroundColor: '#2c3e50',
                    padding: '.5rem',
                    borderRadius: '3px',
                    marginBottom: '1rem',
                    borderBottom: 'solid 3px deepskyblue'
                },
                text: 'Evaluator: ' + evalName
            }),
            $({
                tag: 'div',
                child: docList.map((v, index) => {
                    return DocumentList({
                        title: v.file.title || `Document ${index + 1}`,
                        criteria: v.criteria || [],
                        Total: v.TotalScore,
                        category: v.file.category,
                        center_code: v.file.center_code,
                        display_name: v.file.display_name
                    })
                })
            })
        ]
    })
}
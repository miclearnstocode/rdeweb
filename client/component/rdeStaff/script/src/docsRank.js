import {$} from "../../../../lib/lib.js";

export const RankDocs = ({evalName, docList}) => {
    const DocumentList = ({title, criteria, Total, category, center_code, display_name}) => {
        // SIMPLE SUM: Just add up all the scores (no weighting)
        const calculatedTotal = criteria.reduce((sum, criterion) => {
            const score = parseFloat(criterion.score) || 0;
            return sum + score;
        }, 0);
        
        const finalTotal = (Total !== undefined && !isNaN(Total) && Total !== null) ? 
                        Total : calculatedTotal;

        const CriteriaList = criteria.map((data, index) => {
            const score = parseFloat(data.score) || 0;
            
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    borderBottom: index === criteria.length - 1 ? 'none' : '1px solid #f0f2f5',
                    backgroundColor: index % 2 === 0 ? '#fafbfc' : '#ffffff',
                    transition: 'background-color 0.15s ease'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafbfc' : '#ffffff';
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        text: data.name,
                        style: {
                            flex: '3',
                            padding: '10px 14px',
                            color: '#1a2a3a',
                            fontSize: '13px',
                            borderRight: '1px solid #f0f2f5'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: data.percentage || '—',
                        style: {
                            flex: '1',
                            padding: '10px 14px',
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '13px',
                            fontWeight: '500',
                            borderRight: '1px solid #f0f2f5'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            flex: '1',
                            padding: '10px 14px',
                            textAlign: 'center'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: `${data.score}`,
                                style: {
                                    fontWeight: '600',
                                    color: '#1976D2',
                                    backgroundColor: '#e3f2fd',
                                    padding: '2px 12px',
                                    borderRadius: '4px',
                                    fontSize: '13px'
                                }
                            })
                        ]
                    })
                ]
            })
        });

        const TotalScore = () => {
            const displayTotal = finalTotal;
            
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e8ecf0',
                    marginTop: '4px',
                    borderRadius: '0 0 6px 6px'
                },
                child: [
                    $({
                        tag: 'div',
                        text: 'TOTAL SCORE',
                        style: {
                            flex: '3',
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: '#475569',
                            fontSize: '13px',
                            letterSpacing: '0.5px'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            flex: '2',
                            padding: '10px 14px',
                            textAlign: 'center'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: displayTotal,
                                style: {
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    backgroundColor: '#1976D2',
                                    padding: '4px 20px',
                                    borderRadius: '6px',
                                    fontSize: '15px'
                                }
                            })
                        ]
                    })
                ]
            })
        }

        if (criteria.length > 0) {
            CriteriaList.push(TotalScore());
        }

        const centerInfo = display_name || category;

        // Score summary badge
        const scoreBadgeColor = finalTotal >= 90 ? '#22c55e' : 
                                finalTotal >= 75 ? '#f59e0b' : 
                                finalTotal >= 60 ? '#f97316' : '#ef4444';

        return $({
            tag: 'div',
            style: {
                width: '100%',
                marginBottom: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e8ecf0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }
            },
            child: [
                // Header: Title + Score Badge
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        backgroundColor: '#fafbfc',
                        borderBottom: '1px solid #e8ecf0',
                        flexWrap: 'wrap',
                        gap: '8px'
                    },
                    child: [
                        // Title
                        $({
                            tag: 'div',
                            style: {
                                flex: 1,
                                minWidth: '200px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: title || 'Untitled Document',
                                    style: {
                                        color: '#1a2a3a',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        lineHeight: '1.4'
                                    }
                                }),
                                centerInfo && $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: center_code ? '🏛️' : '📂',
                                            style: { fontSize: '12px' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: centerInfo,
                                            style: {
                                                color: '#64748b',
                                                fontSize: '12px'
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        // Score Badge
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#f8fafc',
                                padding: '6px 14px 6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e8ecf0'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Score:',
                                    style: {
                                        color: '#64748b',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: finalTotal,
                                    style: {
                                        color: scoreBadgeColor,
                                        fontSize: '16px',
                                        fontWeight: '700'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                
                // Criteria Table
                criteria.length > 0 ? $({
                    tag: 'div',
                    child: [
                        // Table Header
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                backgroundColor: '#f1f5f9',
                                borderBottom: '2px solid #e8ecf0'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Criteria',
                                    style: {
                                        flex: '3',
                                        padding: '10px 14px',
                                        color: '#475569',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Weight',
                                    style: {
                                        flex: '1',
                                        padding: '10px 14px',
                                        textAlign: 'center',
                                        color: '#475569',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Score',
                                    style: {
                                        flex: '1',
                                        padding: '10px 14px',
                                        textAlign: 'center',
                                        color: '#475569',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                })
                            ]
                        }),
                        // Criteria Rows
                        $({
                            tag: 'div',
                            child: CriteriaList
                        })
                    ]
                }) : $({
                    tag: 'div',
                    style: {
                        padding: '24px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '14px',
                        fontStyle: 'italic'
                    },
                    text: 'No scores recorded for this document'
                })
            ].filter(Boolean)
        })
    }

    return $({
        tag: 'div',
        style: {
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 0',
            backgroundColor: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        child: [
            // Evaluator Header
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e8ecf0'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#1976D2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '16px',
                            flexShrink: 0
                        },
                        text: evalName ? evalName.charAt(0).toUpperCase() : 'E'
                    }),
                    $({
                        tag: 'div',
                        style: {
                            flex: 1
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: evalName || 'Evaluator',
                                style: {
                                    color: '#1a2a3a',
                                    fontSize: '18px',
                                    fontWeight: '600'
                                }
                            }),
                            $({
                                tag: 'div',
                                text: `${docList.length} document${docList.length !== 1 ? 's' : ''} evaluated`,
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '13px'
                                }
                            })
                        ]
                    })
                ]
            }),
            // Document List
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                },
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
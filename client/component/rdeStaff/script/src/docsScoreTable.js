import {$, Fragment} from "../../../../lib/lib.js";

export const TableScore = (name, criteria) => {
    const List = () => {
        const tableField = ({ evalName, criteria, score, percentage, scorePercentage, descrip }) => {
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '1px solid #f0f2f5',
                    transition: 'background-color 0.15s ease',
                    gap: '12px'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            flex: 1,
                            minWidth: 0
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: criteria,
                                style: {
                                    color: '#1a2a3a',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '2px'
                                }
                            }),
                            descrip ? $({
                                tag: 'div',
                                text: descrip,
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                    fontStyle: 'italic'
                                }
                            }) : null
                        ]
                    }),
                    $({
                        tag: 'div',
                        text: percentage + '%',
                        style: {
                            color: '#64748b',
                            fontSize: '13px',
                            fontWeight: '500',
                            minWidth: '80px',
                            textAlign: 'center'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: score,
                        style: {
                            color: '#1976D2',
                            fontSize: '15px',
                            fontWeight: '600',
                            minWidth: '60px',
                            textAlign: 'center',
                            backgroundColor: '#e3f2fd',
                            padding: '4px 12px',
                            borderRadius: '6px'
                        }
                    })
                ]
            });
        };

        const ListCrit = (criteriaList) => {
            let fullList = [];
            const segregate = (evalName) => {
                let list = [];
                let pointIndex;
                let total = 0;
                criteria.forEach((val, index) => {
                    if (val.fullname === evalName) {
                        list.push(val);
                        pointIndex = index;
                        total += val.score * 1;
                    }
                });
                return [list, pointIndex, total];
            };

            for (let x = 0; x < criteriaList.length; x++) {
                let list = [];
                list.push(criteriaList[x]);
                let name = criteriaList[x].fullname;
                const [subList, indexPoint, TotalScore] = segregate(name);
                fullList.push({
                    evalName: name,
                    criteria: subList,
                    totalScore: TotalScore,
                });
                x = indexPoint;
            }

            let totalG = 0;
            let average = 0;
            fullList.forEach(val => {
                totalG += val.totalScore;
            });
            average = fullList.length > 0 ? totalG / fullList.length : 0;

            return { List: fullList, AverageScore: average };
        };

        const scoredData = ListCrit(criteria);
        const SubDocsList = scoredData.List.map((val) => {
            const Sublist = val.criteria.map((v) => {
                return tableField({
                    score: v.score,
                    criteria: v.name,
                    descrip: v.description,
                    percentage: v.percentage
                });
            });

            // Add total score row for this evaluator
            Sublist.push($({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e8ecf0',
                    marginTop: '4px',
                    borderRadius: '0 0 8px 8px'
                },
                child: [
                    $({
                        tag: 'span',
                        text: 'Total Score:',
                        style: {
                            color: '#475569',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginRight: '16px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: val.totalScore,
                        style: {
                            color: '#1976D2',
                            fontSize: '15px',
                            fontWeight: '700'
                        }
                    })
                ]
            }));

            return $({
                tag: 'div',
                style: {
                    marginBottom: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e8ecf0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e8ecf0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: 'Evaluator:',
                                style: {
                                    color: '#64748b',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: val.evalName,
                                style: {
                                    color: '#1a2a3a',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        child: Sublist
                    })
                ]
            });
        });

        // Add average score section
        SubDocsList.push($({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '16px 20px',
                marginTop: '8px',
                backgroundColor: '#f0f7ff',
                borderRadius: '10px',
                border: '1px solid #dbeafe',
                gap: '20px'
            },
            child: [
                $({
                    tag: 'span',
                    text: 'Average Score:',
                    style: {
                        color: '#1a2a3a',
                        fontSize: '15px',
                        fontWeight: '600'
                    }
                }),
                $({
                    tag: 'span',
                    text: scoredData.AverageScore.toFixed(2),
                    style: {
                        color: '#1976D2',
                        fontSize: '20px',
                        fontWeight: '700',
                        backgroundColor: '#e3f2fd',
                        padding: '4px 20px',
                        borderRadius: '8px'
                    }
                })
            ]
        }));

        // Table header
        const header = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px 8px 0 0',
                borderBottom: '2px solid #e8ecf0',
                gap: '12px',
                fontWeight: '600'
            },
            child: [
                $({
                    tag: 'div',
                    text: 'CRITERIA',
                    style: {
                        flex: 1,
                        color: '#475569',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'PERCENTAGE',
                    style: {
                        color: '#475569',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '80px',
                        textAlign: 'center'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'SCORE',
                    style: {
                        color: '#475569',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '60px',
                        textAlign: 'center'
                    }
                })
            ]
        });

        const contentWrapper = $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e8ecf0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            },
            child: [
                header,
                $({
                    tag: 'div',
                    child: SubDocsList
                })
            ]
        });

        return contentWrapper;
    };

    return $({
        tag: 'div',
        style: {
            width: '100%',
            maxWidth: '1200px',
            margin: '20px auto',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #e8ecf0'
        },
        child: [
            // Title section
            $({
                tag: 'div',
                style: {
                    padding: '8px 0 20px 0',
                    borderBottom: '2px solid #f0f2f5',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '4px',
                            height: '32px',
                            backgroundColor: '#1976D2',
                            borderRadius: '2px'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: 'Title:',
                                style: {
                                    color: '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: name || 'Untitled',
                                style: {
                                    color: '#1a2a3a',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }
                            })
                        ]
                    })
                ]
            }),
            List()
        ]
    });
};
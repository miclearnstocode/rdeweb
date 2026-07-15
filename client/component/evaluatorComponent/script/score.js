import { $, Request, Waiting } from '../../../lib/lib.js'

export const ScoreBoard = ({ resId, eventId, center, categoryId, userType }) => {
    let AbstainState = false;
    const dataArray = [];

    const Submit = async () => {
        const allScoresZero = dataArray.every(item => item.score === 0 || item.score === '0');

        if (allScoresZero) {
            const confirmZero = confirm("All scores are zero. Are you sure you want to save zero scores for all criteria?");
            if (!confirmZero) {
                return;
            }
        }

        const loading = Waiting();
        document.body.appendChild(loading);
        loading.offsetHeight;

        const form = new FormData();
        form.append('center', center || '');
        form.append('categoryId', categoryId || '');
        form.append('userType', userType || 'center');
        form.append('docId', resId);
        form.append('scoreSave', '1');

        dataArray.forEach(val => {
            form.append('criteriaId[]', val.criteriaId);
            form.append('Score[]', val.score);
        });

        try {
            const response = await fetch('/scoreboard', {
                method: 'POST',
                body: form
            });

            const data = await response.json();

            if (loading && loading.parentNode) {
                loading.remove();
            }

            alert(data.message);

            if (data.status) {
                // Optionally refresh or update UI
            }
        } catch (error) {
            if (loading && loading.parentNode) {
                loading.remove();
            }

            console.error('Error saving scores:', error);
            alert('Error saving scores. Please try again.');
        }
    };

    const InputEvent = ({ id, value }) => {
        for (let x = 0; x < dataArray.length; x++) {
            if (dataArray[x].criteriaId == id) {
                dataArray[x].score = value;
            }
        }
    };

    const scoreBoardCriPanel = () => {
        const PerCritScore = ({ name, description, percentage, crit_id }) => {
            return $({
                tag: 'div',
                style: {
                    width: '95%',
                    margin: '10px auto',
                    borderRadius: '10px',
                    fontSize: '13px',
                    background: '#ffffff',
                    border: '1px solid #e8ecf1',
                    padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                },
                child: [
                    // Criteria Name
                    $({
                        tag: 'div',
                        text: name,
                        style: {
                            color: '#0f172a',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '6px',
                            letterSpacing: '0.3px'
                        }
                    }),

                    // Description with icon
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '12px',
                            padding: '6px 12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '6px',
                            borderLeft: '3px solid #3b82f6'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-info-circle' },
                                style: {
                                    color: '#3b82f6',
                                    fontSize: '13px',
                                    marginTop: '2px'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    innerHTML: `<i>"${description}"</i>`
                                },
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '13px',
                                    color: '#475569',
                                    lineHeight: '1.5',
                                    fontStyle: 'italic'
                                }
                            })
                        ]
                    }),

                    // Score input section
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            flexWrap: 'wrap'
                        },
                        child: [
                            // Percentage badge
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: '#eff6ff',
                                    padding: '4px 12px',
                                    borderRadius: '20px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-percent' },
                                        style: {
                                            color: '#3b82f6',
                                            fontSize: '12px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: `Max: ${percentage}%`,
                                        style: {
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '12px',
                                            color: '#2563eb',
                                            fontWeight: '600'
                                        }
                                    })
                                ]
                            }),

                            // Score input with label
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    flex: '1',
                                    justifyContent: 'flex-end'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: 'Score:',
                                        style: {
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '13px',
                                            color: '#64748b',
                                            fontWeight: '500'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'number',
                                            min: 0,
                                            max: percentage,
                                            maxValue: percentage,
                                            placeholder: '0',
                                            maxLength: '3',
                                            id: crit_id + '',
                                            readOnly: AbstainState
                                        },
                                        event: {
                                            type: 'input',
                                            method: function () {
                                                if (this.value > percentage) {
                                                    this.value = percentage;
                                                }
                                                if (this.value < 0) {
                                                    this.value = 0;
                                                }
                                                InputEvent({ id: this.id, value: this.value });
                                            }
                                        },
                                        style: {
                                            width: '70px',
                                            height: '36px',
                                            border: `2px solid ${AbstainState ? '#e2e8f0' : '#3b82f6'}`,
                                            outline: 'none',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: AbstainState ? '#f8fafc' : '#ffffff',
                                            color: AbstainState ? '#94a3b8' : '#0f172a',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease',
                                            opacity: AbstainState ? 0.6 : 1,
                                            cursor: AbstainState ? 'not-allowed' : 'text'
                                        },
                                        elementHandler: (el) => {
                                            setTimeout(() => {
                                                el.value = 0;
                                                const req = new Request('/scoreboard');
                                                req.Post([
                                                    { name: 'scoreReq', value: '1' },
                                                    { name: 'docId', value: resId },
                                                    { name: 'criteria_id', value: crit_id }
                                                ]);
                                                req.Json();
                                                req.Send().then(data => {
                                                    data.forEach((val) => {
                                                        for (let x = 0; x < dataArray.length; x++) {
                                                            if (val.criteria_id === dataArray[x].criteriaId) {
                                                                dataArray[x].score = val.score;
                                                            }
                                                        }
                                                        setTimeout(() => {
                                                            el.value = val.score * 1;
                                                        }, 100);
                                                    });
                                                }).catch(err => {
                                                    console.log(err);
                                                });
                                            }, 100);
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
        };

        return $({
            tag: 'div',
            style: {
                height: 'calc(100% - 120px)',
                width: '95%',
                margin: '0 auto',
                overflowY: 'auto',
                padding: '6px 4px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
            },
            elementHandler: async (el) => {
                const style = document.createElement('style');
                style.textContent = `
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 10px;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 10px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                `;
                document.head.appendChild(style);

                const form = new FormData();
                form.append('scoreboard_req', '1');
                form.append('docId', resId);

                try {
                    const res = await fetch('/scoreboard', {
                        method: 'post',
                        body: form
                    });
                    const data = await res.json();

                    data.forEach(val => {
                        dataArray.push({
                            criteriaId: val.criteria_id,
                            name: val.name,
                            description: val.description,
                            score: 0
                        });

                        el.appendChild(PerCritScore({
                            name: val.name,
                            description: val.description,
                            percentage: val.percentage,
                            crit_id: val.criteria_id,
                        }));
                    });
                } catch (error) {
                    console.error('Error loading score criteria:', error);
                    el.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center; font-family: system-ui;">Error loading criteria. Please refresh.</div>';
                }
            }
        });
    };

    return $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        child: [
            // Header
            $({
                tag: 'div',
                style: {
                    padding: '14px 20px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #8b5cf6',
                    textAlign: 'center',
                    flexShrink: 0,
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-star' },
                        style: {
                            fontSize: '16px',
                            color: '#8b5cf6',
                            marginRight: '10px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Score Board',
                        style: {
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#0f172a',
                            letterSpacing: '0.5px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    })
                ]
            }),

            // Score criteria panel
            scoreBoardCriPanel(),

            // Footer with buttons
            $({
                tag: 'div',
                style: {
                    padding: '14px 20px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e8ecf1',
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    flexShrink: 0,
                    flexWrap: 'wrap',
                },
                child: [
                    // Save Score button
                    $({
                        tag: 'button',
                        style: {
                            padding: '8px 20px',
                            backgroundColor: '#22c55e',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(34,197,94,0.3)'
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-save' } }),
                            $({ tag: 'span', text: 'Save Scores' })
                        ],
                        event: {
                            type: 'click',
                            method: Submit
                        },
                        elementHandler: (el) => {
                            el.addEventListener('mouseenter', () => {
                                el.style.backgroundColor = '#16a34a';
                                el.style.transform = 'translateY(-1px)';
                                el.style.boxShadow = '0 4px 12px rgba(34,197,94,0.4)';
                            });
                            el.addEventListener('mouseleave', () => {
                                el.style.backgroundColor = '#22c55e';
                                el.style.transform = 'translateY(0)';
                                el.style.boxShadow = '0 2px 4px rgba(34,197,94,0.3)';
                            });
                        }
                    }),

                    // Abstain button
                    $({
                        tag: 'button',
                        style: {
                            padding: '8px 20px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-ban' } }),
                            $({ tag: 'span', text: 'Abstain' })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                let prompt;
                                if (AbstainState) {
                                    prompt = confirm("You will be removed from being abstain for this document. Do you want to proceed?");
                                } else {
                                    prompt = confirm("Your score for this document will not be included for computation. Do you want to proceed?");
                                }

                                if (prompt) {
                                    const loading = Waiting();
                                    document.body.appendChild(loading);
                                    loading.offsetHeight;

                                    const req = new Request('/abstain');
                                    if (AbstainState) {
                                        req.Post([
                                            { name: 'removeAbstain', value: '1' },
                                            { name: 'docId', value: resId }
                                        ]);
                                    } else {
                                        req.Post([
                                            { name: 'UpdateAbstain', value: '1' },
                                            { name: 'docId', value: resId },
                                            { name: 'reason', value: '' }
                                        ]);
                                    }

                                    req.Json();
                                    req.Send().then(data => {
                                        loading.remove();
                                        if (data.status) {
                                            window.location.reload();
                                        } else {
                                            alert(data.message || 'Error updating abstain status');
                                        }
                                    }).catch(err => {
                                        loading.remove();
                                        console.error('Error submitting abstain:', err);
                                        alert('Error submitting abstain. Please try again.');
                                    });
                                }
                            }
                        },
                        elementHandler: (el) => {
                            const req = new Request('/abstain');
                            req.Post([
                                { name: 'checkAbstain', value: '1' },
                                { name: 'docId', value: resId }
                            ]);
                            req.Json();
                            req.Send().then(data => {
                                AbstainState = (data.status !== 0);
                                if (AbstainState) {
                                    el.style.backgroundColor = '#fef2f2';
                                    el.style.borderColor = '#fca5a5';
                                    el.style.color = '#dc2626';
                                    el.innerHTML = '<span class="fa-solid fa-ban"></span><span>Abstained</span>';
                                } else {
                                    el.style.backgroundColor = '#f1f5f9';
                                    el.style.borderColor = '#e2e8f0';
                                    el.style.color = '#64748b';
                                    el.innerHTML = '<span class="fa-solid fa-ban"></span><span>Abstain</span>';
                                }
                            }).catch(err => {
                                console.error('Error checking abstain status:', err);
                            });

                            el.addEventListener('mouseenter', () => {
                                if (!AbstainState) {
                                    el.style.backgroundColor = '#e2e8f0';
                                }
                            });
                            el.addEventListener('mouseleave', () => {
                                if (!AbstainState) {
                                    el.style.backgroundColor = '#f1f5f9';
                                }
                            });
                        }
                    })
                ]
            })
        ]
    });
};
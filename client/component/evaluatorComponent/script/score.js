import {$, Request, Waiting} from '../../../lib/lib.js'

export const ScoreBoard = ({resId, eventId, center}) => {
    let AbstainState = false;
    const dataArray = [];
    
    const Submit = async () => {
        // Check if all scores are zero
        const allScoresZero = dataArray.every(item => item.score === 0 || item.score === '0');
        
        if (allScoresZero) {
            const confirmZero = confirm("All scores are zero. Are you sure you want to save zero scores for all criteria?");
            if (!confirmZero) {
                return;
            }
        }
        
        // Show loading indicator
        const loading = Waiting();
        document.body.appendChild(loading);
        loading.offsetHeight; // Force reflow
        
        const form = new FormData();
        form.append('center', center);
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
            
            // Remove loading before showing alert
            if (loading && loading.parentNode) {
                loading.remove();
            }
            
            alert(data.message);
            
            if (data.status) {
                // Optionally refresh or update UI
                // window.location.reload();
            }
        } catch (error) {
            // Remove loading on error
            if (loading && loading.parentNode) {
                loading.remove();
            }
            
            console.error('Error saving scores:', error);
            alert('Error saving scores. Please try again.');
        }
    };
    
    const InputEvent = ({id, value}) => {
        for (let x = 0; x < dataArray.length; x++) {
            if (dataArray[x].criteriaId == id) {
                dataArray[x].score = value;
            }
        }
    };
    
    const scoreBoardCriPanel = () => {
        const PerCritScore = ({name, description, percentage, crit_id}) => {
            return $({
                tag: 'div',
                style: {
                    width: '95%',
                    margin: '12px auto',
                    borderRadius: '12px',
                    fontSize: '0.95vw',
                    background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)',
                    border: '1px solid #3a3a3a',
                    padding: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                },
                child: [
                    // Criteria Name
                    $({
                        tag: 'div',
                        text: name,
                        style: {
                            color: '#FFD700',
                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontSize: '1.1vw',
                            fontWeight: '600',
                            marginBottom: '8px',
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
                            marginBottom: '15px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            borderLeft: '3px solid #FFD700'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {className: 'fa-solid fa-info-circle'},
                                style: {
                                    color: '#FFD700',
                                    fontSize: '0.9vw',
                                    marginTop: '2px'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    innerHTML: `<i>"${description}"</i>`
                                },
                                style: {
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    fontSize: '0.9vw',
                                    color: '#bbb',
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
                            gap: '20px',
                            flexWrap: 'wrap'
                        },
                        child: [
                            // Percentage badge
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '20px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {className: 'fa-solid fa-percent'},
                                        style: {
                                            color: '#FFD700',
                                            fontSize: '0.9vw'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: `Max: ${percentage}%`,
                                        style: {
                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                            fontSize: '0.9vw',
                                            color: '#FFD700',
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
                                    gap: '12px',
                                    flex: '1',
                                    justifyContent: 'flex-end'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: 'Score:',
                                        style: {
                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                            fontSize: '0.95vw',
                                            color: '#ddd',
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
                                            method: function() {
                                                // Ensure value doesn't exceed max
                                                if (this.value > percentage) {
                                                    this.value = percentage;
                                                }
                                                if (this.value < 0) {
                                                    this.value = 0;
                                                }
                                                InputEvent({id: this.id, value: this.value});
                                            }
                                        },
                                        style: {
                                            width: '80px',
                                            height: '40px',
                                            border: `2px solid ${AbstainState ? '#666' : '#FFD700'}`,
                                            outline: 'none',
                                            textAlign: 'center',
                                            fontSize: '1vw',
                                            fontWeight: '600',
                                            backgroundColor: AbstainState ? '#333' : '#2a2a2a',
                                            color: AbstainState ? '#888' : '#FFD700',
                                            borderRadius: '8px',
                                            transition: 'all 0.3s ease',
                                            opacity: AbstainState ? 0.5 : 1,
                                            cursor: AbstainState ? 'not-allowed' : 'text'
                                        },
                                        elementHandler: (el) => {
                                            setTimeout(() => {
                                                el.value = 0;
                                                const req = new Request('/scoreboard');
                                                req.Post([
                                                    {name: 'scoreReq', value: '1'},
                                                    {name: 'docId', value: resId},
                                                    {name: 'criteria_id', value: crit_id}
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
                padding: '10px 5px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#FFD700 #333'
            },
            elementHandler: async (el) => {
                // Add custom scrollbar styles
                const style = document.createElement('style');
                style.textContent = `
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #333;
                        border-radius: 10px;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #FFD700;
                        border-radius: 10px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #e5c100;
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
                    el.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Error loading criteria. Please refresh.</div>';
                }
            }
        });
    };
    
    return $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        child: [
            // Header
            $({
                tag: 'div',
                style: {
                    padding: '16px 20px',
                    backgroundColor: '#2a2a2a',
                    borderBottom: '2px solid #FFD700',
                    textAlign: 'center'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {className: 'fa-solid fa-star'},
                        style: {
                            fontSize: '1.2vw',
                            color: '#FFD700',
                            marginRight: '10px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'SCORE BOARD',
                        style: {
                            fontSize: '1.2vw',
                            fontWeight: '600',
                            color: '#fff',
                            letterSpacing: '1px',
                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'
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
                    padding: '16px 20px',
                    backgroundColor: '#2a2a2a',
                    borderTop: '1px solid #3a3a3a',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                },
                child: [
                    // Save Score button
                    $({
                        tag: 'button',
                        style: {
                            padding: '10px 24px',
                            backgroundColor: '#4CAF50',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95vw',
                            fontWeight: '600',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)'
                        },
                        child: [
                            $({tag: 'span', att: {className: 'fa-solid fa-save'}}),
                            $({tag: 'span', text: 'Save Scores'})
                        ],
                        event: {
                            type: 'click',
                            method: Submit
                        }
                    }),
                    
                    // Abstain button
                    $({
                        tag: 'button',
                        style: {
                            padding: '10px 24px',
                            backgroundColor: AbstainState ? '#f44336' : '#666',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95vw',
                            fontWeight: '600',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: AbstainState ? '0 2px 4px rgba(244, 67, 54, 0.3)' : 'none'
                        },
                        child: [
                            $({tag: 'span', att: {className: 'fa-solid fa-ban'}}),
                            $({tag: 'span', text: AbstainState ? 'Abstained' : 'Abstain'})
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
                                    // Show loading
                                    const loading = Waiting();
                                    document.body.appendChild(loading);
                                    loading.offsetHeight;
                                    
                                    const req = new Request('/abstain');
                                    if (AbstainState) {
                                        // Remove Abstain
                                        req.Post([
                                            {name: 'removeAbstain', value: '1'},
                                            {name: 'docId', value: resId}
                                        ]);
                                    } else {
                                        // Add Abstain
                                        req.Post([
                                            {name: 'UpdateAbstain', value: '1'},
                                            {name: 'docId', value: resId},
                                            {name: 'reason', value: ''}
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
                                {name: 'checkAbstain', value: '1'},
                                {name: 'docId', value: resId}
                            ]);
                            req.Json();
                            req.Send().then(data => {
                                AbstainState = (data.status !== 0);
                                if (AbstainState) {
                                    el.style.backgroundColor = '#f44336';
                                    el.innerHTML = '<span class="fa-solid fa-ban"></span><span>Abstained</span>';
                                } else {
                                    el.style.backgroundColor = '#666';
                                    el.innerHTML = '<span class="fa-solid fa-ban"></span><span>Abstain</span>';
                                }
                            }).catch(err => {
                                console.error('Error checking abstain status:', err);
                            });
                        }
                    })
                ]
            })
        ]
    });
};
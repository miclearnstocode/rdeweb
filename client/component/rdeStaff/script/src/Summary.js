import {$, Path, Request} from "../../../../lib/lib.js";
import {PrintWindow} from "../../../evaluatorComponent/script/PrintOut.js";


export const Summary=({scoreRank,rankAve,RankPerCrit})=>{
    let CategoryName
    let panel
    const RankList=rankAve.map(val=>{
        return $({
            tag:'div',
            style:{
                borderBottom:'solid thin rgba(0,0,0,0.2)',
                paddingTop:'1vh',
                paddingBottom:'1vh'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        borderRadius:'.5rem',
                       backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                        width:'fit-content',
                        padding: '.3rem 1rem'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Rank # :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.rank,
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        display:'flex',
                        textIndent:'3vw',
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Rank average : ",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.data.rankAverage,
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Author :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.author
                            },
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Campus :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.campus
                            },
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Title :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:`" <i>${val.data.title.title}</i> "`
                            },
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
            ]
        })
    })
    RankList.unshift($({
        tag:'div',
        style:{
            height:'5%',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Rank based on Ranking average',
                style:{
                    margin:'auto',
                    fontWeight:'bold'
                },
            })
        ]
    }))
    RankList.push($({
        tag:'div',
        style:{
            height:'5vh',
            width:'100%',
            backgroundColor: 'skyblue',
            marginTop:'5vh',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Click',
                style:{
                    margin:'auto',
                    cursor:'pointer'
                },
                event:{
                    type:'click',
                    method:()=>{
                        const Printable=rankAve.map(val=>{
                            return $({
                                tag:'div',
                                style:{
                                    borderBottom:'solid thin rgba(0,0,0,0.2)',
                                    paddingTop:'1vh',
                                    paddingBottom:'1vh'
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        style:{
                                            borderRadius:'.5rem',
                                            backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                                            width:'fit-content',
                                            padding: '.3rem 1rem'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Rank # :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.rank,
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            display:'flex',
                                            textIndent:'3vw',
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Rank average : ",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.data.rankAverage,
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Author :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.author
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Campus :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.campus
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                       style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Title :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:`" <i>${val.data.title.title}</i> "`
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                ]
                            })
                        })
                        Printable.unshift($({
                            tag:'div',
                            style:{
                                fontFamily:'Helvetica',
                                textAlign:'center',
                                fontWeight:'bold',
                                marginTop: '5vh'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        margin:'auto',
                                        fontSize:'1.6vw',
                                        fontFamily:'Helvetica',
                                        fontWeight:'bold'
                                    },
                                    elementHandler:(el)=>{
                                        const eventId = Path(4) || '';
                                        const categoryId = Path(6) || '';
                                        
                                        // Fetch event name
                                        const eventReq = new Request('/eventRequest');
                                        eventReq.Post([
                                            {
                                                name: 'getEventName',
                                                value: '1'
                                            },
                                            {
                                                name: 'eventId',
                                                value: eventId
                                            }
                                        ]);
                                        eventReq.Json();
                                        
                                        // Fetch category/center name based on event type
                                        const isNewSystem = parseInt(eventId) >= 13;
                                        const nameReq = new Request(isNewSystem ? '/requestCat' : '/score_rank');
                                        
                                        Promise.all([
                                            eventReq.Send(),
                                            nameReq.Send().then(data => {
                                                if (isNewSystem) {
                                                    // New system: find center name
                                                    const center = data.find(c => c.id == categoryId);
                                                    return center ? `${center.name} (${center.code})` : 'All Centers';
                                                } else {
                                                    // Old system: find category name
                                                    return data.items ? data.items.find(c => c.id == categoryId)?.name : 'All Categories';
                                                }
                                            }).catch(() => 'Unknown')
                                        ]).then(([eventData, categoryName]) => {
                                            const eventName = eventData[0]?.name || 'Unknown Event';
                                            CategoryName = categoryName;
                                            
                                            if (categoryId && categoryId !== '0') {
                                                el.innerText = `${eventName} - Ranking for ${categoryName}`;
                                            } else {
                                                el.innerText = `${eventName} - Overall Ranking`;
                                            }
                                        }).catch(err => {
                                            console.error('Error fetching names:', err);
                                            el.innerText = 'Ranking Result';
                                        });
                                    }
                                }),
                                $({
                                    tag:'div',
                                    text:`Entry summary for ${CategoryName || 'Selected Category/Center'}`
                                }),
                                $({
                                    tag:'div',
                                    text:'Ranking based on Score Ranking Average'
                                })
                            ]
                        }))
                        PrintWindow(Printable)
                    }
                }
            })
        ]
    }))
    const RankScore=scoreRank.map(val=>{
        return $({
            tag:'div',
            style:{
                paddingTop:'1vh',
                paddingBottom:'1vh',
                borderBottom:'solid thin rgba(0,0,0,0.2)',
            },
            child:[
              $({
                    tag:'div',
                    style:{
                        borderRadius:'.5rem',
                        backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                        width:'fit-content',
                        padding: '.3rem 1rem'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Rank # :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.rank,
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                 tag:'div',
                    style:{
                        display:'flex',
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Score average : ",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.data.averageScore,
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Author :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.author
                            },
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Campus :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.campus
                            },
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Title :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:`" <i>${val.data.title.title}</i> "`
                            },
                            style:{
                                marginLeft:'1vw'
                            }
                        }),
                    ]
                }),
            ]
        })
    })
    RankScore.unshift($({
        tag:'div',
        style:{
            height:'5%',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Rank based on Score Average',
                style:{
                    margin:'auto',
                    fontWeight:'bold'
                },            
            })
        ]
    }))
    RankScore.push($({
        tag:'div',
        style:{
            height:'5vh',
            width:'100%',
            backgroundColor: 'skyblue',
            marginTop:'5vh',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Click',
                style:{
                    margin:'auto',
                    cursor:'pointer'
                },
                event:{
                    type:'click',
                    method:()=>{
                        const Printable=scoreRank.map(val=>{
                            return $({
                                tag:'div',
                                style:{
                                    borderBottom:'solid thin rgba(0,0,0,0.2)',
                                    paddingTop:'1vh',
                                    paddingBottom:'1vh'
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        style:{
                                            borderRadius:'.5rem',
                                            backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                                            width:'fit-content',
                                            padding: '.3rem 1rem'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Rank # :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.rank,
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            display:'flex',
                                            textIndent:'3vw',
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Total score average : ",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.data.averageScore,
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Author :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.author
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Campus :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.campus
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                   }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Title :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                          $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:`" <i>${val.data.title.title}</i> "`
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }
                                            }),
                                        ]
                                    }),
                                ]
                            })
                        })
                        Printable.unshift($({
                            tag:'div',
                            style:{
                                fontFamily:'Helvetica',
                                textAlign:'center',
                                fontWeight:'bold',
                                marginTop: '5vh'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    elementHandler:(el)=>{
                                        const req= new Request('/eventRequest')
                                        req.Post([
                                            {
                                                name:'getEventName',
                                                value:'1'
                                            },
                                            {
                                                name:'eventId',
                                                value:Path(4)
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            data.forEach(val=>{
                                                el.innerText=val.name
                                            })
                                        })
                                    }
                                }),
                                $({
                                    tag:'div',
                                    text:`Entry summary for ${CategoryName || 'Selected Category/Center'}`
                                }),
                                $({
                                    tag:'div',
                                    text:'Ranking based on Score Ranking Average'
                                })
                            ]
                        }))
                        PrintWindow(Printable)
                    }
                }
            })
        ]
    }))

    // Try to extract evaluator info from the first document in each array
    const PerCriteria = RankPerCrit.map((evaluatorDocs, index) => {
        if (!evaluatorDocs || evaluatorDocs.length === 0) {
            console.log(`Evaluator ${index} has no docs`);
            return null;
        }
        
        // Try to get evaluator name from first document
        const firstDoc = evaluatorDocs[0];
        console.log(`First doc for evaluator ${index}:`, firstDoc);
        
        // The structure might be: {data: {...}, rank: X, evalName: "NAME"}
        let evalName = 'Unknown Evaluator';
        
        if (firstDoc && firstDoc.evalName) {
            evalName = firstDoc.evalName;
        } else if (firstDoc && firstDoc.data && firstDoc.data.evalName) {
            evalName = firstDoc.data.evalName;
        } else {
            // Try to get from the raw data structure
            evalName = `Evaluator ${index + 1}`;
        }
        
        console.log(`Extracted evaluator name: ${evalName}`);
        
        // Map documents
        const mappedDocs = evaluatorDocs.map(doc => {
            // Check the structure of each doc
            console.log('Doc structure:', doc);
            
            let fileData = {};
            let totalScore = 0;
            
            if (doc.data) {
                // Format 1
                fileData = doc.data.file || {};
                totalScore = parseFloat(doc.data.TotalScore) || 0;
            } else {
                // Format 2
                fileData = doc.file || {};
                totalScore = parseFloat(doc.TotalScore) || 0;
            }
            
            return {
                totalScore: totalScore,
                title: fileData.title || 'Untitled',
                author: fileData.author || 'Unknown',
                campus: fileData.campus || 'Unknown Campus',
                category: fileData.category || '',
                center: fileData.center || '',
                display_name: fileData.display_name || ''
            };
        });
        
        // Sort by total score descending
        const sortedDocs = mappedDocs.sort((a, b) => b.totalScore - a.totalScore);
        
        // Apply tie ranks
        const rankedDocs = applyTieRanks(sortedDocs);
        
        return {
            evalName: evalName,
            docs: rankedDocs
        };
    }).filter(item => item !== null);
    
    console.log('Processed PerCriteria:', PerCriteria);
    
    // Function to apply tie ranks (same as before)
    function applyTieRanks(docs) {
        if (docs.length === 0) return [];
        
        const rankedDocs = [];
        let currentIndex = 0;
        
        while (currentIndex < docs.length) {
            let tieGroup = [docs[currentIndex]];
            let tieSum = currentIndex + 1;
            
            for (let j = currentIndex + 1; j < docs.length; j++) {
                if (docs[j].totalScore === docs[currentIndex].totalScore) {
                    tieGroup.push(docs[j]);
                    tieSum += (j + 1);
                } else {
                    break;
                }
            }
            
            const averageRank = tieSum / tieGroup.length;
            
            tieGroup.forEach(doc => {
                rankedDocs.push({
                    ...doc,
                    rank: averageRank
                });
            });
            
            currentIndex += tieGroup.length;
        }
        
        return rankedDocs;
    }
    
    const botSum = PerCriteria.map((evaluatorData) => {
        const { evalName, docs } = evaluatorData;
        
        if (!docs || docs.length === 0) {
            console.log(`No docs for evaluator ${evalName}`);
            return null;
        }
        
        console.log(`Creating display for evaluator ${evalName} with ${docs.length} documents`);
        
        // Create header
        const header = $({
            tag:'div',
            style:{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
                fontWeight: 'bold',
                fontSize: '1.1vw',
                textAlign: 'center'
            },
            text: `Evaluator : ${evalName}`
        });
        
        // Create list of documents for this evaluator with proper ranks
        const documentItems = docs.map((doc, idx) => {
            // Use the calculated rank or fallback to position
            const rankValue = doc.rank !== undefined ? doc.rank : (idx + 1);
            
            return $({
                tag:'div',
                style:{
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    border: 'solid 1px #dee2e6',
                    borderRadius: '5px',
                    fontFamily: 'Helvetica',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            display: 'flex',
                            marginBottom: '5px',
                            alignItems: 'center'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '3px',
                                    marginRight: '10px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9vw'
                                },
                                text: `Rank #: ${rankValue}`
                            }),
                            $({
                                tag:'div',
                                style:{
                                    color: '#2c3e50',
                                    fontWeight: 'bold',
                                    fontSize: '1vw'
                                },
                                text: `Total Score : ${doc.totalScore}`
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '5px',
                            marginTop: '8px'
                        },
                        child:[
                            $({
                                tag:'div',
                                child:[
                                    $({
                                        tag:'span',
                                        text:'Author : ',
                                        style:{
                                            fontWeight: 'bold',
                                            color: '#555'
                                        }
                                    }),
                                    $({
                                        tag:'span',
                                        text: doc.author || 'N/A'
                                    })
                                ]
                            }),
                            $({
                                tag:'div',
                                child:[
                                    $({
                                        tag:'span',
                                        text:'Campus : ',
                                        style:{
                                            fontWeight: 'bold',
                                            color: '#555'
                                        }
                                    }),
                                    $({
                                        tag:'span',
                                        text: doc.campus || 'N/A'
                                    })
                                ]
                            }),
                            $({
                                tag:'div',
                                style:{
                                    gridColumn: '1 / span 2'
                                },
                                child:[
                                    $({
                                        tag:'span',
                                        text:'Title : ',
                                        style:{
                                            fontWeight: 'bold',
                                            color: '#555'
                                        }
                                    }),
                                    $({
                                        tag:'span',
                                        att:{
                                            innerHTML: `" <i>${doc.title}</i> "`
                                        },
                                        style:{
                                            color: '#333',
                                            fontStyle: 'italic'
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
        });
        
        return $({
            tag:'div',
            style:{
                border: 'solid thin #888',
                margin: '2vh auto',
                width: '80%',
                padding: '1rem',
                fontFamily: 'Helvetica',
                fontSize: '1vw',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: 'white'
            },
            child: [header, ...documentItems]
        });
    }).filter(item => item !== null);
    
    console.log(`Created ${botSum.length} evaluator sections`);
    
    //section header
    if (botSum.length > 0) {
        const sectionHeader = $({
            tag:'div',
            style:{
                textAlign:'center',
                margin:'5vh auto 2vh',
                fontSize:'1.3vw',
                fontFamily:'Helvetica',
                fontWeight:'bold',
                color: '#2c3e50',
                borderBottom: 'solid 2px #3498db',
                paddingBottom: '10px',
                width: '80%'
            },
            elementHandler: (el) => {
                // Initial text
                el.innerText = `Summary of Scores for ${CategoryName || 'Loading...'}`;
                
                // Watch for CategoryName updates
                const updateText = () => {
                    if (CategoryName) {
                        el.innerText = `Summary of Scores for ${CategoryName}`;
                    }
                };
                
                // Update every 100ms until CategoryName is set
                const interval = setInterval(updateText, 100);
                
                // Clean up when element is removed
                el._cleanup = () => clearInterval(interval);
            }
        });
        
        // Insert header before all evaluator sections
        botSum.unshift(sectionHeader);
    } else {
        // Add message if no evaluator data
        botSum.push($({
            tag:'div',
            style:{
                textAlign:'center',
                margin:'5vh auto',
                fontSize:'1.1vw',
                fontFamily:'Helvetica',
                color: '#999',
                fontStyle: 'italic'
            },
            elementHandler: (el) => {
                // Initial text
                el.innerText = `No evaluator scores available for ${CategoryName || 'this category/center'}`;
                
                // Watch for CategoryName updates
                const updateText = () => {
                    if (CategoryName) {
                        el.innerText = `No evaluator scores available for ${CategoryName}`;
                    }
                };
                
                // Update every 100ms until CategoryName is set
                const interval = setInterval(updateText, 100);
                
                // Clean up when element is removed
                el._cleanup = () => clearInterval(interval);
            }
        }));
    }
    
    // Debug logging
    console.log('RankPerCrit data structure:', RankPerCrit);
    console.log('Processed PerCriteria:', PerCriteria);
    console.log('Number of evaluator sections:', botSum.length);
    
    return ($({
        tag:'div',
        style:{
            position:'absolute',
            zIndex:9999,
            width:'100%',
            height:'100%',
            backgroundColor:'white',
            userSelect:'text'
        },
        elementHandler:(el)=>{
            panel=el
        },
        child:[
            $({
                tag:'div',
                style:{
                    height: '5%',
                    width: '100%',
                    display:'flex',
                    borderBottom:'solid thin black',
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width: 'fit-content',
                            margin:'auto',
                            marginLeft:'2vw',
                            marginRight:'0',
                            padding:'.2rem',
                            fontSize:'1.3vw',
                            fontFamily:'Helvetica',
                            fontWeight:'bold',
                            backgroundColor:'#555',
                            color:'deepskyblue',
                            borderRadius:'.5rem',
                            cursor:'pointer'
                        },
                        text:'Back',
                        event:{
                            type:'click',
                            method:()=>{
                                panel.remove()
                            }
                        }
                    }),
                    $({
                        tag:'div',
                        style:{
                            margin:'auto',
                            fontSize:'1.6vw',
                            fontFamily:'Helvetica',
                            fontWeight:'bold'
                        },
                        elementHandler:(el)=>{
                            const eventId = Path(4) || '';
                            const categoryId = Path(6) || 0;
                            const isNewSystem = parseInt(eventId) >= 13;
                            
                            // Get event name
                            const eventReq = new Request('/eventRequest');
                            eventReq.Post([
                                {
                                    name: 'getEventName',
                                    value: '1'
                                },
                                {
                                    name: 'eventId',
                                    value: eventId
                                }
                            ]);
                            eventReq.Json();
                            
                            eventReq.Send().then(eventData => {
                                const eventName = eventData[0]?.name || 'Unknown Event';
                                
                                // If specific category/center is selected
                                if (categoryId && categoryId !== '0') {
                                    const nameReq = new Request('/score_rank');
                                    nameReq.Post([
                                        {
                                            name: 'getCatIdName',
                                            value: categoryId
                                        },
                                        {
                                            name: 'eventId',
                                            value: eventId
                                        }
                                    ]);
                                    nameReq.Json();
                                    
                                    nameReq.Send().then(nameData => {
                                        console.log('Category/Center name response:', nameData);
                                        
                                        // Extract name from response
                                        let categoryCenterName = '';
                                        if (nameData && nameData.length > 0) {
                                            categoryCenterName = nameData[0].name || '';
                                        }
                                        
                                        // Fallback if name is empty
                                        if (!categoryCenterName) {
                                            categoryCenterName = isNewSystem ? 'Unknown Center' : 'Unknown Category';
                                        }
                                        
                                        // Store the category/center name globally
                                        CategoryName = categoryCenterName;
                                        // Also store whether this is a center or category
                                        window.isCenterSystem = isNewSystem;
                                        
                                        const systemType = isNewSystem ? 'Center' : 'Category';
                                        el.innerText = `Ranking Result for ${categoryCenterName}`;
                                    }).catch(error => {
                                        console.error('Error fetching category/center name:', error);
                                        CategoryName = isNewSystem ? 'Unknown Center' : 'Unknown Category';
                                        window.isCenterSystem = isNewSystem;
                                        el.innerText = `${eventName} - Ranking Result`;
                                    });
                                } else {
                                    // All categories/centers
                                    const systemType = isNewSystem ? 'Centers' : 'Categories';
                                    CategoryName = isNewSystem ? 'All Centers' : 'All Categories';
                                    window.isCenterSystem = isNewSystem;
                                    el.innerText = `${eventName} - Overall Ranking (All ${systemType})`;
                                }
                            }).catch(err => {
                                console.error('Error fetching event:', err);
                                CategoryName = isNewSystem ? 'All Centers' : 'All Categories';
                                window.isCenterSystem = isNewSystem;
                                el.innerText = 'Ranking Result';
                            });
                        }
                    })
                ]
            }),
            $({
                tag:'div',
                style:{
                    width: '100%',
                    height: '95%',
                    overflowY:'auto'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'100%',
                            display:'flex',
                            fontFamily: 'Helvetica',
                            fontSize: '1vw'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'48%',
                                    height: '100%',
                                    overflowY:'auto',
                                    margin:'auto',
                                    borderRight:'solid thin black',
                                    paddingRight:'.5vw'
                                },
                                child:RankList
                            }),
                            $({
                                tag:'div',
                                style:{
                                    width:'48%',
                                    height: '100%',
                                    overflowY:'auto',
                                    margin:'auto',
                                    borderLeft:'solid thin black',
                                    paddingLeft:'.5vw'
                                },
                                child:RankScore
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'fit-content'
                        },
                        child:botSum
                    })
                ]
            })
        ]
    }))
}
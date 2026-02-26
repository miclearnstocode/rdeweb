import {$} from '../../lib/lib.js'

//researchfile.id,

// researchfile.senderid,

// researchfile.file,

// researchfile.status,

// endorsement.event,

// comments.intro,

// comments.abstract,

// comments.objective,

// comments.methodology,

// comments.results,

// comments.recommendation,

// comments.literature,

// comments.other

export const Main=({title,category,campus,date,evalName,author,coAuthor,intro,abstract,objective,methodology,results,recommendation,literature,other,getBody})=>{



    const Header=()=>{



        return($({

            tag:'div',

            att:{

                className: 'reviewHeader'

            },

            child:[

                $({

                    tag:'img',

                    att:{

                        src:"/client/images/header.png",

                        className:'imgHeader'

                    }

                })

            ]

        }))

    }



    const Body=()=>{

        const info=()=>{



            const PerInfo=({label,data})=>{

                return($({

                    tag:'tr',

                    child:[

                        $({

                            tag:'td',

                            text:label,

                            att:{

                                className:'lebInfo'

                            }

                        }),

                        $({

                            tag:'td',

                            text:data,

                            att:{

                                className:'dataInfo'

                            }

                        })

                    ]

                }))

            }

            return($({

                tag:'table',

                att:{

                    className:'infoTable'

                },

                child:[

                    PerInfo({

                        label:'Date: ',

                        data:date

                    }),

                    PerInfo({

                        label:'Author: ',

                        data:author

                    }),

                    PerInfo({

                        label:'Category: ',

                        data:category

                    }),

                    PerInfo({

                        label:'Campus: ',

                        data:campus

                    }),

                    PerInfo({

                        label:'Title: ',

                        data:title

                    }),

                    PerInfo({

                        label:'Date',

                        data:date

                    }),

                ]



            }))

        }

        const perComment=({name,intro,abstract,objectives,methodology,results,recommend,literature,other})=>{

            const RowName=({Fullname})=>{

                return($({

                    tag:'tr',

                    child:[

                        $({

                            tag:'td',

                            att:{

                                className:'nameRow'

                            },

                            text:Fullname

                        })

                    ]

                }))

            }

            const RowLabel=({label})=>{

                return($({

                    tag:'tr',

                    child:[

                        $({

                            tag:'td',

                            att:{

                                className:'comLebRow'

                            },

                            text:label

                        })

                    ]

                }))

            }

            const RowComment=({comments})=>{

                return($({

                    tag:'tr',

                    child:[

                        $({

                            tag:'td',

                            att:{

                                className:'comDetRow'

                            },

                            text:comments.replace(/<br>/g,'\n')

                        })

                    ]

                }))

            }



            const getTable=(table)=>{

                table.appendChild(RowName({Fullname:name}))

                if(intro){

                    table.appendChild(RowLabel({label:'Introduction : '}))

                    table.appendChild(RowComment({comments:intro}))

                }

                if(abstract){

                    table.appendChild(RowLabel({label:'Abstract : '}))

                    table.appendChild(RowComment({comments:abstract}))

                }

                if(objectives){

                    table.appendChild(RowLabel({label:'Objectives : '}))

                    table.appendChild(RowComment({comments:objectives}))

                }

                if(methodology){

                    table.appendChild(RowLabel({label:'Methodology : '}))

                    table.appendChild(RowComment({comments:methodology}))

                }

                if(results){

                    table.appendChild(RowLabel({label:'Results and Discussion : '}))

                    table.appendChild(RowComment({comments:results}))

                }

                if(recommend){

                    table.appendChild(RowLabel({label:'Conclusion and Recommendation : '}))

                    table.appendChild(RowComment({comments:recommend}))

                }

                if(literature){

                    table.appendChild(RowLabel({label:'Literature : '}))

                    table.appendChild(RowComment({comments:literature}))

                }

                if(other){

                    table.appendChild(RowLabel({label:'Other : '}))

                    table.appendChild(RowComment({comments:other}))

                }

            }

            return($({

                tag:'table',

                att:{

                    className:'perCom'

                },

                elementHandler:getTable

            }))



        }

        const getBody=(body)=>{

            body.appendChild(info())

            const obj={}

            if(intro!==''||intro!==null){

                obj.intro=intro

            }

            if(abstract!==''||abstract!==null){

                obj.abstract=abstract

            }

            if(objective!==''||objective!==null){

                obj.objective=objective

            }

            if(methodology!==''||methodology!==null){

                obj.methodology=methodology

            }

            if(results!==''||results!==null){

                obj.results=results

            }

            if(recommendation!==''||recommendation!==null){

                obj.recommendation=recommendation

            }

            if(literature!==''||literature!==null){

                obj.literature=literature

            }

            if(other!==''||other!==null){

                obj.other=other

            }

            body.appendChild(perComment({

                name:evalName,

                intro:intro,

                abstract:abstract,

                objectives:objective,

                methodology:methodology,

                results:methodology,

                recommend:recommendation,

                literature:literature,

                other:other

            }))

        }



        return($({

            tag:'div',

            att:{

                className:'bodyRev'

            },

            elementHandler:getBody

        }))

    }



    document.head.appendChild($({

        tag:'link',

        att:{

            media:'print',

         //   href:'/client/component/otherComponent/style/review.css',

            rel:'stylesheet'



        }

    }))



    return($({

        tag:'div',

        att:{

            className:'reviewDiv',

            id:'commentPDF'

        },

        elementHandler:getBody,

        child:[

            Header(),

            Body()

        ]

    }))

}

export const PrintSummary = (data) => {
    console.log('Print summary data:', data)
    
    // Define the center-category mapping
    const centerCategoryMapping = {
        "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
        "Social Science Research & Development Center (SSRDC)": ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
        "Coconut Research and Development Center (Coco RDC)": ["Natural / Biological"],
        "Extension (Extension)": ["Extension"]
    }
    
    // Get all unique categories from the mapping
    const allCategories = [];
    Object.values(centerCategoryMapping).forEach(cats => {
        cats.forEach(cat => {
            if (!allCategories.includes(cat)) {
                allCategories.push(cat);
            }
        });
    });
    
    // Sort categories alphabetically
    allCategories.sort();
    
    // Get all centers from the mapping
    const allCenters = Object.keys(centerCategoryMapping);

    return ($({
        tag: 'div',
        att: {
            className: 'print-summary'
        },
        style: {
            width: '100%',
            minHeight: '21cm', // Landscape height (A4 landscape)
            position: 'relative',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: 'white'
        },
        child: [
            // Background Image (Header)
            $({
                tag: 'div',
                att: {
                    className: 'print-header-bg'
                },
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none'
                },
                child: [
                    $({
                        tag: 'img',
                        att: {
                            src: '/client/images/header.png',
                            className: 'imgHeader'
                        },
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }
                    })
                ]
            }),
            
            // Content Container
            $({
                tag: 'div',
                att: {
                    className: 'print-content'
                },
                style: {
                    position: 'relative',
                    zIndex: 1,
                    padding: '4cm 1.5cm 1.5cm 1.5cm',
                    width: '100%',
                    minHeight: '21cm',
                    boxSizing: 'border-box'
                },
                child: [
                    // Title Section
                    $({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            marginBottom: '15px',
                            marginTop: '5px'
                        },
                        child: [
                            $({ 
                                tag: 'h2', 
                                text: 'SUMMARY OF ACCEPTED RESEARCH DOCUMENTS',
                                style: {
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    margin: '3px 0',
                                    color: '#000'
                                }
                            }),
                            $({ 
                                tag: 'h3', 
                                text: data && data[0]?.campuses[0]?.event ? data[0].campuses[0].event : 'Research Documents Summary',
                                style: {
                                    fontSize: '11pt',
                                    fontWeight: 'normal',
                                    margin: '3px 0',
                                    color: '#333'
                                }
                            })
                        ]
                    }),
                    
                    // Main Table
                    $({
                        tag: 'table',
                        att: {
                            className: 'summary-table'
                        },
                        style: {
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                            fontSize: '9pt',
                            backgroundColor: 'white',
                            marginBottom: '15px'
                        },
                        elementHandler: (el) => {
                            // Create header row
                            const headerRow = $({ tag: 'tr' });
                            
                            // First column for Center
                            headerRow.appendChild($({
                                tag: 'th',
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '7px', 
                                    backgroundColor: '#e6e6e6',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: '10pt'
                                },
                                text: 'RESEARCH CENTER'
                            }));
                            
                            // Category columns
                            allCategories.forEach(category => {
                                headerRow.appendChild($({
                                    tag: 'th',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '7px', 
                                        backgroundColor: '#e6e6e6',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        fontSize: '10pt'
                                    },
                                    text: category
                                }));
                            });
                            
                            // Total column
                            headerRow.appendChild($({
                                tag: 'th',
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '8px', 
                                    backgroundColor: '#e6e6e6',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: '10pt'
                                },
                                text: 'TOTAL'
                            }));
                            
                            el.appendChild(headerRow);
                            
                            // Data rows for each center from the mapping
                            allCenters.forEach((centerName, centerIndex) => {
                                // Find center data if it exists in the provided data
                                const centerData = data && data.length > 0 
                                    ? data.find(c => c.center === centerName) 
                                    : null;
                                
                                const dataRow = $({ tag: 'tr' });
                                
                                // Center name with alternating background
                                dataRow.appendChild($({
                                    tag: 'td',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        fontWeight: 'bold',
                                        backgroundColor: centerIndex % 2 === 0 ? '#fafafa' : 'white'
                                    },
                                    text: centerName
                                }));
                                
                                let centerTotal = 0;
                                
                                // Get categories assigned to this center from mapping
                                const assignedCategories = centerCategoryMapping[centerName] || [];
                                
                                // Data for each category (all categories, but only assigned ones can have values)
                                allCategories.forEach(category => {
                                    let categoryTotal = 0;
                                    
                                    // Check if this category is assigned to this center
                                    if (assignedCategories.includes(category)) {
                                        // Sum up all campuses for this center and category if data exists
                                        if (centerData) {
                                            centerData.campuses.forEach(campus => {
                                                const catData = campus.categories.find(c => c.name === category);
                                                if (catData) {
                                                    categoryTotal += catData.total;
                                                }
                                            });
                                        }
                                    }
                                    
                                    centerTotal += categoryTotal;
                                    
                                    dataRow.appendChild($({
                                        tag: 'td',
                                        style: { 
                                            border: '1px solid #000', 
                                            padding: '6px', 
                                            textAlign: 'center',
                                            backgroundColor: centerIndex % 2 === 0 ? '#fafafa' : 'white',
                                            fontWeight: categoryTotal > 0 ? 'bold' : 'normal',
                                            color: assignedCategories.includes(category) ? (categoryTotal > 0 ? '#000' : '#666') : '#999'
                                        },
                                        text: assignedCategories.includes(category) ? categoryTotal : '—'
                                    }));
                                });
                                
                                // Center total
                                dataRow.appendChild($({
                                    tag: 'td',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        textAlign: 'center', 
                                        fontWeight: 'bold',
                                        backgroundColor: centerIndex % 2 === 0 ? '#fafafa' : 'white'
                                    },
                                    text: centerTotal
                                }));
                                
                                el.appendChild(dataRow);
                            });
                            
                            // Grand Total Row
                            const grandTotalRow = $({ 
                                tag: 'tr', 
                                style: { 
                                    backgroundColor: '#b6d7a8', 
                                    fontWeight: 'bold',
                                    borderTop: '2px solid #000'
                                } 
                            });
                            
                            grandTotalRow.appendChild($({
                                tag: 'td',
                                style: { border: '1px solid #000', padding: '7px', fontWeight: 'bold' },
                                text: 'GRAND TOTAL'
                            }));
                            
                            let finalGrandTotal = 0;
                            
                            // Calculate grand totals per category
                            allCategories.forEach(category => {
                                let categoryGrandTotal = 0;
                                
                                if (data && data.length > 0) {
                                    data.forEach(center => {
                                        // Only sum if this center has this category assigned
                                        const assignedCategories = centerCategoryMapping[center.center] || [];
                                        if (assignedCategories.includes(category)) {
                                            center.campuses.forEach(campus => {
                                                const catData = campus.categories.find(c => c.name === category);
                                                if (catData) {
                                                    categoryGrandTotal += catData.total;
                                                }
                                            });
                                        }
                                    });
                                }
                                
                                finalGrandTotal += categoryGrandTotal;
                                
                                grandTotalRow.appendChild($({
                                    tag: 'td',
                                    style: { border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' },
                                    text: categoryGrandTotal
                                }));
                            });
                            
                            grandTotalRow.appendChild($({
                                tag: 'td',
                                style: { border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' },
                                text: finalGrandTotal
                            }));
                            
                            el.appendChild(grandTotalRow);
                        }
                    }),
                    
                    // Notes Section - Below the table
                    $({
                        tag: 'div',
                        style: {
                            marginTop: '8px',
                            fontSize: '8pt',
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#666',
                            fontStyle: 'italic'
                        },
                        child: [
                            // Note about dashes
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            display: 'inline-block',
                                            width: '16px',
                                            textAlign: 'center',
                                            color: '#999',
                                            fontWeight: 'bold',
                                            fontStyle: 'normal' // Keep dash non-italic
                                        },
                                        text: '—'
                                    }),
                                    $({
                                        tag: 'span',
                                        style: {
                                            fontStyle: 'italic'
                                        },
                                        text: 'Indicates categories not assigned to this research center'
                                    })
                                ]
                            }),
                            
                            // Note about no data (only show if no data)
                            ...(!data || data.length === 0 ? [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            style: {
                                                color: '#666',
                                                fontStyle: 'normal' // Keep icon non-italic
                                            },
                                            text: 'ⓘ'
                                        }),
                                        $({
                                            tag: 'span',
                                            style: {
                                                fontStyle: 'italic'
                                            },
                                            text: 'No data available. Showing format with zeros and dashes.'
                                        })
                                    ]
                                })
                            ] : [])
                        ]
                    }),
                    // Summary information
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '15px',
                            fontSize: '9pt',
                            color: '#333',
                            paddingTop: '5px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: `Total Research Centers: ${allCenters.length}`
                            }),
                            $({
                                tag: 'div',
                                text: `Total Categories: ${allCategories.length}`
                            }),
                            $({
                                tag: 'div',
                                style: { textAlign: 'right' },
                                text: `Printed on: ${new Date().toLocaleDateString()}`
                            })
                        ]
                    })
                ]
            })
        ]
    }))
}
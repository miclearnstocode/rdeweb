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
    console.log(data)
    
    const row = (...td) => {
        return ($({
            tag: 'tr',
            elementHandler: (el) => {
                td.forEach(val => {
                    el.appendChild(val);
                })
            }
        }))
    }

    const col = ({text, style, att}) => {
        return ($({
            tag: 'td',
            style: style,
            text: text,
            att: att
        }))
    }

    // Get all unique categories from the data
    const allCategories = [];
    if (data && data.length > 0) {
        data.forEach(center => {
            center.campuses.forEach(campus => {
                campus.categories.forEach(cat => {
                    if (!allCategories.includes(cat.name)) {
                        allCategories.push(cat.name);
                    }
                });
            });
        });
    }
    
    // Sort categories alphabetically
    allCategories.sort();

    return ($({
        tag: 'div',
        att: {
            className: 'print-summary'
        },
        style: {
            width: '100%',
            minHeight: '29.7cm',
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
                    padding: '4cm 1.5cm 2.5cm 1.5cm',
                    width: '100%',
                    minHeight: '29.7cm',
                    boxSizing: 'border-box'
                },
                child: [
                    // Title Section
                    $({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            marginBottom: '20px',
                            marginTop: '10px'
                        },
                        child: [
                            $({ 
                                tag: 'h2', 
                                text: 'SUMMARY OF ACCEPTED RESEARCH DOCUMENTS',
                                style: {
                                    fontSize: '16pt',
                                    fontWeight: 'bold',
                                    margin: '5px 0',
                                    color: '#000'
                                }
                            }),
                            $({ 
                                tag: 'h3', 
                                text: data[0]?.campuses[0]?.event || 'Research Documents',
                                style: {
                                    fontSize: '14pt',
                                    fontWeight: 'normal',
                                    margin: '5px 0',
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
                            fontSize: '10pt',
                            backgroundColor: 'white',
                            marginBottom: '20px'
                        },
                        elementHandler: (el) => {
                            // Create header row with centers
                            const headerRow1 = $({ tag: 'tr' });
                            
                            // First column for Campus
                            headerRow1.appendChild($({
                                tag: 'th',
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '8px', 
                                    backgroundColor: '#e6e6e6',
                                    fontWeight: 'bold'
                                },
                                text: 'CAMPUS',
                                att: { rowspan: 2 }
                            }));
                            
                            // Center columns
                            data.forEach(center => {
                                headerRow1.appendChild($({
                                    tag: 'th',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '8px', 
                                        backgroundColor: '#e6e6e6',
                                        fontWeight: 'bold'
                                    },
                                    text: center.center,
                                    att: { colspan: allCategories.length }
                                }));
                            });
                            
                            // Total column
                            headerRow1.appendChild($({
                                tag: 'th',
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '8px', 
                                    backgroundColor: '#e6e6e6',
                                    fontWeight: 'bold'
                                },
                                text: 'TOTAL',
                                att: { rowspan: 2 }
                            }));
                            
                            el.appendChild(headerRow1);
                            
                            // Second header row - categories under each center
                            const headerRow2 = $({ tag: 'tr' });
                            
                            data.forEach(center => {
                                allCategories.forEach(category => {
                                    headerRow2.appendChild($({
                                        tag: 'th',
                                        style: { 
                                            border: '1px solid #000', 
                                            padding: '4px', 
                                            fontSize: '9pt',
                                            backgroundColor: '#f0f0f0',
                                            fontWeight: 'bold'
                                        },
                                        text: category
                                    }))
                                })
                            })
                            
                            el.appendChild(headerRow2);
                            
                            // Get all unique campuses
                            const allCampuses = new Set();
                            data.forEach(center => {
                                center.campuses.forEach(campus => {
                                    allCampuses.add(campus.campus);
                                })
                            })
                            
                            // Sort campuses
                            const campusesList = Array.from(allCampuses).sort();
                            
                            // Data rows for each campus
                            campusesList.forEach((campusName, index) => {
                                const dataRow = $({ tag: 'tr' })
                                
                                // Campus name with alternating background
                                dataRow.appendChild($({
                                    tag: 'td',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        fontWeight: 'bold',
                                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                                    },
                                    text: campusName
                                }))
                                
                                let campusTotal = 0
                                
                                // Data for each center
                                data.forEach(center => {
                                    // Find this campus in this center
                                    const campusData = center.campuses.find(c => c.campus === campusName);
                                    
                                    allCategories.forEach(category => {
                                        let count = 0;
                                        if (campusData) {
                                            const catData = campusData.categories.find(c => c.name === category);
                                            count = catData ? catData.total : 0;
                                        }
                                        
                                        campusTotal += count;
                                        
                                        dataRow.appendChild($({
                                            tag: 'td',
                                            style: { 
                                                border: '1px solid #000', 
                                                padding: '6px', 
                                                textAlign: 'center',
                                                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                                            },
                                            text: count > 0 ? count : '-'
                                        }))
                                    })
                                })
                                
                                // Campus total
                                dataRow.appendChild($({
                                    tag: 'td',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        textAlign: 'center', 
                                        fontWeight: 'bold',
                                        backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                                    },
                                    text: campusTotal
                                }))
                                
                                el.appendChild(dataRow);
                            })
                            
                            // Grand Total Row
                            const totalRow = $({ 
                                tag: 'tr', 
                                style: { 
                                    backgroundColor: '#e0e0e0', 
                                    fontWeight: 'bold' 
                                } 
                            })
                            
                            totalRow.appendChild($({
                                tag: 'td',
                                style: { border: '1px solid #000', padding: '8px' },
                                text: 'GRAND TOTAL'
                            }))
                            
                            let grandTotal = 0
                            
                            data.forEach(center => {
                                allCategories.forEach(category => {
                                    let categoryTotal = 0;
                                    
                                    center.campuses.forEach(campus => {
                                        const catData = campus.categories.find(c => c.name === category);
                                        if (catData) {
                                            categoryTotal += catData.total;
                                        }
                                    })
                                    
                                    grandTotal += categoryTotal;
                                    
                                    totalRow.appendChild($({
                                        tag: 'td',
                                        style: { border: '1px solid #000', padding: '6px', textAlign: 'center' },
                                        text: categoryTotal
                                    }))
                                })
                            })
                            
                            totalRow.appendChild($({
                                tag: 'td',
                                style: { border: '1px solid #000', padding: '6px', textAlign: 'center' },
                                text: grandTotal
                            }))
                            
                            el.appendChild(totalRow);
                        }
                    })
                ]
            })
        ]
    }))
}

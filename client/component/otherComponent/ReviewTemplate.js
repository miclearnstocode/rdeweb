import {$} from '../../lib/lib.js'

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

export const PrintSummary = (data, eventName) => {
    console.log('Print summary data:', data)
    console.log('Event name:', eventName)
    
    // Check if this is a symposium event
    const isSymposiumEvent = eventName && eventName.toLowerCase().includes('symposium');
    
    // Define the center-category mapping
    const centerCategoryMapping = {
        "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
        "Social Science Research & Development Center (SSRDC)": ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Development"],
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
    allCategories.sort();
    
    // Get all centers from the mapping
    const allCenters = Object.keys(centerCategoryMapping);
    
    // For symposium events, we need to group by category instead of center
    if (isSymposiumEvent) {
        // Build response grouped by category
        const categoryData = {};
        
        // Initialize all categories
        allCategories.forEach(cat => {
            categoryData[cat] = {
                category: cat,
                campuses: {}
            };
        });
        
        // Get all campuses
        const allCampuses = ['Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma', 'Central Office'];
        
        // Initialize all campuses with 0 for each category
        allCategories.forEach(cat => {
            allCampuses.forEach(campus => {
                categoryData[cat].campuses[campus] = 0;
            });
        });
        
        // Process data to group by category
        if (data && data.length > 0) {
            data.forEach(center => {
                if (center.campuses) {
                    center.campuses.forEach(campus => {
                        if (campus.categories) {
                            campus.categories.forEach(cat => {
                                const categoryName = cat.name;
                                if (categoryData[categoryName]) {
                                    if (categoryData[categoryName].campuses[campus.campus] !== undefined) {
                                        categoryData[categoryName].campuses[campus.campus] += cat.total || 0;
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
        
        // Return the symposium view
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
                // Background Image
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
                                marginTop: '5px'
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
                                    text: eventName || 'Research Documents Summary',
                                    style: {
                                        fontSize: '14pt',
                                        fontWeight: 'normal',
                                        margin: '5px 0',
                                        color: '#333'
                                    }
                                })
                            ]
                        }),
                        
                        // Symposium Table - Grouped by Category
                        $({
                            tag: 'table',
                            att: {
                                className: 'summary-table'
                            },
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                border: '1px solid #000',
                                fontSize: '8pt',
                                backgroundColor: 'white',
                                marginBottom: '15px',
                                tableLayout: 'fixed'
                            },
                            elementHandler: (el) => {
                                const allCampuses = ['Roxas City Main', 'Dayao', 'Pontevedra', 'Pilar', 'Dumarao', 'Burias', 'Mambusao', 'Tapaz', 'Sigma', 'Central Office'];
                                
                                // Create header row
                                const headerRow = $({ tag: 'tr' });
                                
                                // First column for Category
                                headerRow.appendChild($({
                                    tag: 'th',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '8px',
                                        backgroundColor: '#e6e6e6',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        fontSize: '9pt',
                                        width: '20%',
                                        verticalAlign: 'middle',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.3'
                                    },
                                    text: 'CATEGORY'
                                }));
                                
                                // Campus columns
                                allCampuses.forEach(campus => {
                                    headerRow.appendChild($({
                                        tag: 'th',
                                        style: { 
                                            border: '1px solid #000', 
                                            padding: '8px',
                                            backgroundColor: '#e6e6e6',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            fontSize: '7.5pt',
                                            width: '7%',
                                            verticalAlign: 'middle',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            lineHeight: '1.2'
                                        },
                                        text: campus
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
                                        fontSize: '9pt',
                                        width: '8%',
                                        verticalAlign: 'middle'
                                    },
                                    text: 'TOTAL'
                                }));
                                
                                el.appendChild(headerRow);
                                
                                // Data rows for each category
                                let grandTotal = 0;
                                const categoryKeys = Object.keys(categoryData).sort();
                                
                                categoryKeys.forEach((categoryName, index) => {
                                    const categoryInfo = categoryData[categoryName];
                                    const dataRow = $({ tag: 'tr' });
                                    let rowTotal = 0;
                                    
                                    // Category name
                                    dataRow.appendChild($({
                                        tag: 'td',
                                        style: { 
                                            border: '1px solid #000', 
                                            padding: '6px', 
                                            fontWeight: 'bold',
                                            backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                                            fontSize: '7.5pt',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            lineHeight: '1.2',
                                            verticalAlign: 'middle'
                                        },
                                        text: categoryName
                                    }));
                                    
                                    // Campus totals
                                    allCampuses.forEach(campus => {
                                        const campusTotal = categoryInfo.campuses[campus] || 0;
                                        rowTotal += campusTotal;
                                        
                                        dataRow.appendChild($({
                                            tag: 'td',
                                            style: { 
                                                border: '1px solid #000', 
                                                padding: '6px', 
                                                textAlign: 'center',
                                                backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                                                fontWeight: campusTotal > 0 ? 'bold' : 'normal',
                                                fontSize: '8pt',
                                                verticalAlign: 'middle'
                                            },
                                            text: campusTotal
                                        }));
                                    });
                                    
                                    // Row total
                                    grandTotal += rowTotal;
                                    dataRow.appendChild($({
                                        tag: 'td',
                                        style: { 
                                            border: '1px solid #000', 
                                            padding: '6px', 
                                            textAlign: 'center', 
                                            fontWeight: 'bold',
                                            backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                                            fontSize: '8pt',
                                            verticalAlign: 'middle'
                                        },
                                        text: rowTotal
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
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '8px', 
                                        fontWeight: 'bold', 
                                        fontSize: '8pt',
                                        textAlign: 'center'
                                    },
                                    text: 'GRAND TOTAL'
                                }));
                                
                                allCampuses.forEach(campus => {
                                    let campusGrandTotal = 0;
                                    categoryKeys.forEach(category => {
                                        campusGrandTotal += categoryData[category].campuses[campus] || 0;
                                    });
                                    
                                    grandTotalRow.appendChild($({
                                        tag: 'td',
                                        style: { 
                                            border: '1px solid #000', 
                                            padding: '6px', 
                                            textAlign: 'center', 
                                            fontWeight: 'bold', 
                                            fontSize: '8pt',
                                            verticalAlign: 'middle'
                                        },
                                        text: campusGrandTotal
                                    }));
                                });
                                
                                grandTotalRow.appendChild($({
                                    tag: 'td',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        textAlign: 'center', 
                                        fontWeight: 'bold', 
                                        fontSize: '8pt',
                                        verticalAlign: 'middle'
                                    },
                                    text: grandTotal
                                }));
                                
                                el.appendChild(grandTotalRow);
                            }
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
                                    text: `Total Categories: ${Object.keys(categoryData).length}`
                                }),
                                $({
                                    tag: 'div',
                                    text: `Total Campuses: 10`
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
        }));
    }
    
    // ===== IN-HOUSE EVENT VIEW (Grouped by Center) =====
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
                            marginTop: '5px'
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
                                text: eventName || 'Research Documents Summary',
                                style: {
                                    fontSize: '14pt',
                                    fontWeight: 'normal',
                                    margin: '5px 0',
                                    color: '#333'
                                }
                            })
                        ]
                    }),
                    
                    // Main Table - Grouped by Center
                    $({
                        tag: 'table',
                        att: {
                            className: 'summary-table'
                        },
                        style: {
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #000',
                            fontSize: '8pt',
                            backgroundColor: 'white',
                            marginBottom: '15px',
                            tableLayout: 'fixed'
                        },
                        elementHandler: (el) => {
                            // Create header row
                            const headerRow = $({ tag: 'tr' });
                            
                            // First column for Center
                            headerRow.appendChild($({
                                tag: 'th',
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '8px',
                                    backgroundColor: '#e6e6e6',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: '9pt',
                                    width: '20%',
                                    verticalAlign: 'middle',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'normal',
                                    lineHeight: '1.3'
                                },
                                text: 'RESEARCH CENTER'
                            }));
                            
                            // Category columns
                            allCategories.forEach(category => {
                                headerRow.appendChild($({
                                    tag: 'th',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '8px',
                                        backgroundColor: '#e6e6e6',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        fontSize: '8pt',
                                        width: '7%',
                                        verticalAlign: 'middle',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.2',
                                        height: 'auto',
                                        minHeight: '40px'
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
                                    fontSize: '9pt',
                                    width: '8%',
                                    verticalAlign: 'middle'
                                },
                                text: 'TOTAL'
                            }));
                            
                            el.appendChild(headerRow);
                            
                            // Data rows for each center
                            allCenters.forEach((centerName, centerIndex) => {
                                const centerData = data && data.length > 0 
                                    ? data.find(c => c.center === centerName) 
                                    : null;
                                
                                const dataRow = $({ tag: 'tr' });
                                let centerTotal = 0;
                                
                                // Center name with alternating background
                                dataRow.appendChild($({
                                    tag: 'td',
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        fontWeight: 'bold',
                                        backgroundColor: centerIndex % 2 === 0 ? '#fafafa' : 'white',
                                        fontSize: '7.5pt',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.2',
                                        verticalAlign: 'middle'
                                    },
                                    text: centerName
                                }));
                                
                                // Get categories assigned to this center
                                const assignedCategories = centerCategoryMapping[centerName] || [];
                                
                                // Data for each category
                                allCategories.forEach(category => {
                                    let categoryTotal = 0;
                                    
                                    if (assignedCategories.includes(category) && centerData) {
                                        centerData.campuses.forEach(campus => {
                                            const catData = campus.categories.find(c => c.name === category);
                                            if (catData) {
                                                categoryTotal += catData.total;
                                            }
                                        });
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
                                            color: assignedCategories.includes(category) ? (categoryTotal > 0 ? '#000' : '#666') : '#999',
                                            fontSize: '8pt',
                                            verticalAlign: 'middle'
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
                                        backgroundColor: centerIndex % 2 === 0 ? '#fafafa' : 'white',
                                        fontSize: '8pt',
                                        verticalAlign: 'middle'
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
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '8px', 
                                    fontWeight: 'bold', 
                                    fontSize: '8pt',
                                    textAlign: 'center'
                                },
                                text: 'GRAND TOTAL'
                            }));
                            
                            let finalGrandTotal = 0;
                            
                            allCategories.forEach(category => {
                                let categoryGrandTotal = 0;
                                
                                if (data && data.length > 0) {
                                    data.forEach(center => {
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
                                    style: { 
                                        border: '1px solid #000', 
                                        padding: '6px', 
                                        textAlign: 'center', 
                                        fontWeight: 'bold', 
                                        fontSize: '8pt',
                                        verticalAlign: 'middle'
                                    },
                                    text: categoryGrandTotal
                                }));
                            });
                            
                            grandTotalRow.appendChild($({
                                tag: 'td',
                                style: { 
                                    border: '1px solid #000', 
                                    padding: '6px', 
                                    textAlign: 'center', 
                                    fontWeight: 'bold', 
                                    fontSize: '8pt',
                                    verticalAlign: 'middle'
                                },
                                text: finalGrandTotal
                            }));
                            
                            el.appendChild(grandTotalRow);
                        }
                    }),
                    
                    // Notes Section
                    $({
                        tag: 'div',
                        style: {
                            marginTop: '10px',
                            fontSize: '7pt',
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#666',
                            fontStyle: 'italic'
                        },
                        child: [
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
                                            fontStyle: 'normal'
                                        },
                                        text: '—'
                                    }),
                                    $({
                                        tag: 'span',
                                        style: {
                                            fontStyle: 'italic'
                                        },
                                        text: 'Indicates categories not assigned to the research center'
                                    })
                                ]
                            }),
                            
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
                                                fontStyle: 'normal'
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
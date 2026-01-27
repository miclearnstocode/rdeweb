import {$} from "../../../../lib/lib.js";

export const RankDocs = ({evalName, docList}) => {
    const DocumentList = ({title, criteria, Total, category, center_code, display_name}) => {
        const CriteriaList = criteria.map(data => {
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    border: 'solid thin #666',
                    color: 'black'
                },
                child: [
                    $({
                        tag: 'div',
                        text: data.name,
                        style: {
                            width: '60%',
                            border: 'solid thin #666',
                            padding: '.3rem'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: data.percentage + '%',
                        style: {
                            width: '20%',
                            border: 'solid thin #666',
                            padding: '.3rem',
                            textAlign: 'center'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: data.score,
                        style: {
                            width: '20%',
                            border: 'solid thin #666',
                            padding: '.3rem',
                            textAlign: 'center'
                        }
                    })
                ]
            })
        });

        const TotalScore = () => {
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '20%',
                    marginRight: '0',
                    marginLeft: 'auto',
                    fontStyle: '1vw',
                    fontWeight: 'bold',
                    color: 'black',
                    borderBottom: 'solid thin deepskyblue',
                    marginTop: '1vh'
                },
                child: [
                    $({
                        tag: 'div',
                        text: 'Total Score',
                        style: {
                            padding: '.4rem',
                            width: '40%'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: Total,
                        style: {
                            padding: '.4rem',
                            width: '10%',
                        }
                    }),
                ]
            }))
        }

        CriteriaList.push(TotalScore());

        // Add center/category info if available
        const centerInfo = display_name || category;
        
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                margin: '1vh auto auto'
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
                        backgroundColor: '#f0f0f0'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: 'Center: ',
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
                        fontSize: '1vw'
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
                            text: `" ${title} "`,
                            style: {
                                color: 'black'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    child: CriteriaList
                })
            ]
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
        },
        child: [
            $({
                tag: 'div',
                style: {
                    fontSize: '1vw',
                    color: 'black',
                    fontWeight: 'bold',
                    borderBottom: 'solid thin black',
                    width: 'fit-content'
                },
                text: 'Evaluator: ' + evalName
            }),
            $({
                tag: 'div',
                child: docList.map((v) => {
                    return DocumentList({
                        title: v.file.title,
                        criteria: v.criteria,
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
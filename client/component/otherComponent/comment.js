import { $ } from '../../lib/lib.js'

export const headerFooter = ({ content }) => {
    const TableHeader = () => {
        return ($({
            tag: 'table',
            style: {
                width: '100%'
            },
            att: {
                className: 'printContainer'
            },
            child: [
                $({
                    tag: 'thead',
                    child: [
                        $({
                            tag: 'tr',
                            child: [
                                $({
                                    tag: 'td',
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'empty-header'
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'tbody',
                    child: [
                        $({
                            tag: 'tr',
                            child: [
                                $({
                                    tag: 'td',
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'contentPrinter'
                                            },
                                            child: content
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'tfoot',
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'empty-footer'
                            }
                        })
                    ]
                })
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '210mm', // A4 width
            height: '297mm', // A4 height
            position: 'relative'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'header-image-container'
                },
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    zIndex: '0',
                    pointerEvents: 'none'
                },
                child: [
                    $({
                        tag: 'img',
                        att: {
                            src: "/client/images/header.png",
                            className: 'header-footer-image'
                        },
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }
                    })
                ]
            }),
            $({
                tag: 'div',
                att: {
                    className: 'content-overlay'
                },
                style: {
                    position: 'relative',
                    zIndex: '1',
                    width: '100%',
                    height: '100%',
                    padding: '10mm 15mm 15mm 15mm', // Adjust padding for content area
                    boxSizing: 'border-box'
                },
                child: [
                    TableHeader()
                ]
            })
        ]
    }))
}

export const Print = ({ title, review, category, campus, center,date, author, coauthor, presenter,paper_trail_no,all, getHandler }) => {
    const details = () => {
        const tdData = ({ data, width }) => {
            const getme = (el) => {
                if (data) {
                    el.innerHTML = data
                }
                if (width) {
                    el.style.width = width
                }
            }
            return ($({
                tag: 'td',
                elementHandler: getme
            }))
        }

        const row = ({ leb1, leb2 }) => {
            return ($({
                tag: 'tr',
                child: [ // This should be an array
                    leb1,
                    leb2
                ]
            }))
        }

        return ($({
            tag: 'table',
            style: {
                width: '100%',
                marginTop: '10mm',
                marginBottom: '10mm'
            },
            child: [
                row({
                    leb1: tdData({
                        data: '<b>Campus</b>',
                        width: '15%'
                    }),
                    leb2: tdData({
                        data: ': ' + campus,
                        width: '85%'
                    }),
                }),
                row({
                    leb1: tdData({
                        data: '<b>Title </b>',
                        width: '15%',
                    }),
                    leb2: tdData({
                        data: ': ' + title,
                        width: '85%'
                    }),
                }),
                row({
                    leb1: tdData({
                        data: '<b>Category</b>',
                        width: '15%'
                    }),
                    leb2: tdData({
                        data: ': ' + category,
                        width: '85%'
                    }),
                }),
                row({
                    leb1: tdData({
                        data: '<b>Author</b>',
                        width: '15%'
                    }),
                    leb2: tdData({
                        data: ': ' + author,
                        width: '85%'
                    }),
                }),
            ]
        }))
    }

    const getCont = (el) => {
        getHandler(el)

        // Main container with header image background
        el.style.cssText = `
            width: 210mm;
            min-height: 297mm;
            background-image: url("/client/images/header.png");
            background-size: 100% 100%;
            background-position: center;
            background-repeat: no-repeat;
            font-size: 11pt;
            padding: 30mm 20mm 30mm 20mm; /* Adjusted padding to fit within header/footer */
            box-sizing: border-box;
            position: relative;
            border: 1px solid #ccc;
            font-family: 'Arial', sans-serif;
        `;

        // Content wrapper to ensure text stays within safe area
        const contentWrapper = $({
            tag: 'div',
            style: {
                width: '100%',
                minHeight: 'calc(297mm - 70mm)', // Full height minus top/bottom padding
                position: 'relative'
            }
        });

        contentWrapper.appendChild(details());
        contentWrapper.appendChild($({
            tag: 'hr',
            style: {
                border: '1px solid #ccc',
                margin: '10mm 0'
            }
        }));

        if (review && Array.isArray(review)) {
            review.forEach((val, index) => {
                if (!val || typeof val !== 'object') {
                    console.warn('Invalid review item:', val);
                    return;
                }

                let state = true;
                if (all) {
                    if (val.evalName && val.evalName.toUpperCase().includes("TECHNICAL")) {
                        state = false
                    }
                }

                if (state) {
                    const perComment = () => {
                        const pageBreakStyle = index > 0 ? {
                            pageBreakBefore: 'always',
                            paddingTop: '10mm'
                        } : {};

                        const commentContainer = $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                marginBottom: '15mm',
                                ...pageBreakStyle
                            }
                        });

                        if (val.evalName) {
                            const evaluatorDiv = $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    fontSize: '12pt',
                                    fontWeight: 'bold',
                                    color: '#2c3e50',
                                    marginBottom: '5mm',
                                    borderBottom: '2px solid #3498db',
                                    paddingBottom: '2mm'
                                },
                                child: [ // Make sure this is an array
                                    $({
                                        tag: 'table',
                                        style: {
                                            width: '100%',
                                        },
                                        child: [ // Make sure this is an array
                                            $({
                                                tag: 'tr',
                                                att: {
                                                    innerHTML: `<td style="font-size: 12pt; font-weight: bold;">EVALUATOR: ${val.evalName}</td>`
                                                }
                                            })
                                        ]
                                    })
                                ]
                            });
                            commentContainer.appendChild(evaluatorDiv);
                        }

                        // Function to add comment sections
                        const addCommentSection = (label, data) => {
                            if (data && data.trim() !== '') {
                                const section = $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '5mm'
                                    },
                                    child: [ // Make sure this is an array
                                        $({
                                            tag: 'div',
                                            style: {
                                                fontWeight: 'bold',
                                                fontSize: '11pt',
                                                color: '#34495e',
                                                marginBottom: '2mm'
                                            },
                                            text: label + ':'
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                fontSize: '10pt',
                                                lineHeight: '1',
                                                color: '#2c3e50',
                                                padding: '2mm',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '3px',
                                                borderLeft: '3px solid #3498db',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-wrap'
                                            },
                                            att: {
                                                innerHTML: data.replace(/\n/g, '<br>')
                                            }
                                        })
                                    ]
                                });

                                commentContainer.appendChild(section);
                            }
                        };

                        // Add all comment sections - check if each property exists
                        if (val.intro) addCommentSection("Introduction", val.intro);
                        if (val.abstract) addCommentSection("Abstract", val.abstract);
                        if (val.objective) addCommentSection("Objectives", val.objective);
                        if (val.methodology) addCommentSection("Methodology", val.methodology);
                        if (val.results) addCommentSection("Results and Discussion", val.results);
                        if (val.recommendation) addCommentSection("Conclusion and Recommendation", val.recommendation);
                        if (val.literature) addCommentSection("Literature Cited", val.literature);
                        if (val.other) addCommentSection("Other comments", val.other);

                        return commentContainer;
                    }

                    contentWrapper.appendChild(perComment());
                }
            })
        }

        el.appendChild(contentWrapper);
    }

    return ($({
        tag: 'div',
        style: {
            backgroundColor: 'white'
        },
        att: {
            id: 'commentPDF'
        },
        externalStyle: '/client/component/otherComponent/style/comment.css',
        elementHandler: getCont
    }))
}
import { $ } from "../../lib/lib.js";

export const PrintResearch = ({ eventName, data, formData }) => {
    const CM = 37.8; 

    const PAGE_HEIGHT_PX = 29.7 * CM; // ~1122px
    const TOP_PADDING_PX = 4 * CM; // 4cm top padding (matches CSS)
    const BOTTOM_PADDING_PX = 4 * CM; // 4cm bottom padding (matches CSS)
    const CONTENT_AREA_PX = PAGE_HEIGHT_PX - 140 // 21.7cm ≈ 820px
    const USABLE_HEIGHT = CONTENT_AREA_PX * 0.99; // 1% safety margin

    const centersWithDocs = data?.length > 0
        ? data[0].centers : [];

    const estimateHeight = (element) => {
        if (!element) return 0

        const cls = element.att?.className || ''

        if (cls.includes('summary-header')) {
            // h1 (18pt≈24px) + h2 (14pt≈19px) + margins
            return 24 + 5 + 19 + 15 + 40 + 20; // ~123px
        }
        if (cls.includes('center-header')) {
            // h2 14pt ≈ 19px + padding + border + margins
            return 19 + 10 + 15 + 10; // ~54px
        }
        if (cls.includes('category-section')) {
            // Just the ol wrapper itself (children counted separately)
            return 5 + 10; // ~15px (margins only, docs counted below)
        }
        if (cls.includes('document-item')) {
            // Title line: 11pt≈15px * ~2 lines + presenter line: 10pt≈13px + margins
            return (15 * 2 * 1.5) + 13 + 12; // ~70px average
        }
        if (cls.includes('documents-list')) {
            return 5 + 10; // list margins only
        }
        if (cls.includes('center-section')) {
            return 30; // section wrapper margin only
        }

        return 0; // unknown elements contribute 0 (children are counted separately)
    }

    const calculateContentHeight = (content) => {
        if (!content) return 0;

        if (Array.isArray(content)) {
            return content.reduce((sum, item) => sum + calculateContentHeight(item), 0);
        }

        if (typeof content === 'object') {
            let h = estimateHeight(content);
            if (content.child) {
                h += calculateContentHeight(content.child);
            }
            return h
        }

        return 0
    }

    const renderDocument = (doc, categoryName, docNumber) => {
        const authorsText = doc.authors?.length > 0
            ? doc.authors.join(', ')
            : 'No author specified'

        return $({
            tag: 'li',
            att: { className: 'document-item', value: String(docNumber) },
            style: {
                marginBottom: '12px',
                fontSize: '11pt',
                lineHeight: '1.5',
                listStyleType: 'decimal',
                textAlign: 'justify'
            },
            child: [
                $({
                    tag: 'div',
                    att: { className: 'doc-title-line' },
                    style: { fontWeight: 'normal', marginBottom: '2px' },
                    child: [
                        $({ tag: 'span', text: `${doc.title} by `, style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: authorsText, style: { fontWeight: 'normal', fontStyle: 'italic' } }),
                        $({ tag: 'span', text: ` - ${categoryName}`, style: { fontWeight: 'normal' } }),
                    ]
                }),
                $({
                    tag: 'div',
                    att: { className: 'doc-presenter-line' },
                    style: {
                        marginLeft: '20px',
                        fontSize: '10pt',
                        color: '#555',
                        fontStyle: 'italic'
                    },
                    text: `Presenter: ${doc.presenter}`
                })
            ]
        })
    }

    const renderCategory = (category) => {
        if (!category.docs?.length) return null;

        return $({
            tag: 'div',
            att: { className: 'category-section' },
            style: {
                marginLeft: '15px',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 2
            },
            child: [$({
                tag: 'ol',
                att: { className: 'documents-list', start: '1' },
                style: { margin: '5px 0 10px 20px', paddingLeft: '20px' },
                child: category.docs.map(doc => renderDocument(doc, category.category))
            })]
        })
    }

    const renderCategoryGroup = (category, allDocs) => {
        // Filter docs for this category
        const docs = allDocs.filter(doc => doc.category === category);
        if (!docs.length) return null;

        return $({
            tag: 'div',
            att: { className: 'category-section' },
            style: {
                marginBottom: '30px',
                position: 'relative',
                zIndex: 2
            },
            child: [
                $({
                    tag: 'h2',
                    att: { className: 'category-header' },
                    style: {
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        margin: '15px 0 10px 0',
                        padding: '5px 0',
                        borderBottom: '2px solid #000',
                        color: '#000',
                        textTransform: 'uppercase'
                    },
                    text: category
                }),
                $({
                    tag: 'ol',
                    att: { className: 'documents-list', start: '1' },
                    style: { margin: '5px 0 10px 20px', paddingLeft: '20px' },
                    child: docs.map((doc, index) => renderDocument(doc, category, index + 1))
                })
            ]
        })
    }

    const buildFlatItems = () => {
        const items = []

        // Get all unique categories from all centers
        const allDocs = [];
        centersWithDocs.forEach(center => {
            center.categories.forEach(cat => {
                cat.docs.forEach(doc => {
                    allDocs.push({
                        ...doc,
                        category: cat.category,
                        centerName: center.displayName || center.name
                    });
                });
            });
        });

        // Group by category
        const categoryGroups = {};
        allDocs.forEach(doc => {
            if (!categoryGroups[doc.category]) {
                categoryGroups[doc.category] = [];
            }
            categoryGroups[doc.category].push(doc);
        });

        // Sort categories alphabetically
        const sortedCategories = Object.keys(categoryGroups).sort();

        // Create the combined header+footer (Page 1)
        const combinedHeaderFooter = $({
            tag: 'div',
            att: { className: 'combined-header-footer' },
            style: {
                marginBottom: '30px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
            },
            child: [
                // Office header
                $({
                    tag: 'h1',
                    text: 'OFFICE OF THE UNIVERSITY PRESIDENT',
                    style: {
                        fontSize: '18pt',
                        fontWeight: 'normal',
                        margin: '0 0 5px 0',
                        color: '#43A5BE',
                        textAlign: 'center',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    },
                    att: {
                        style: 'color: #43A5BE !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;'
                    }
                }),
                // Spacing
                $({ tag: 'div', style: { height: '20px' } }),

                // Date
                $({
                    tag: 'h2',
                    text: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' }
                }),
                $({ tag: 'div', style: { height: '20px' } }),

                // Recipients
                $({
                    tag: 'h2', text: 'CAMPUS ADMINISTRATORS',
                    style: { fontSize: '12pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }
                }),
                $({
                    tag: 'h2', text: 'SATELLITE COLLEGE DIRECTORS',
                    style: { fontSize: '12pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }
                }),
                $({
                    tag: 'h2', text: 'RESEARCH CENTER DIRECTORS',
                    style: { fontSize: '12pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }
                }),
                $({
                    tag: 'h2', text: 'This University',
                    style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' }
                }),
                $({ tag: 'div', style: { height: '20px' } }),

                // Attention line
                $({
                    tag: 'div',
                    style: { fontSize: '12pt', margin: '0 0 5px 0', color: '#000', display: 'flex' },
                    child: [
                        $({ tag: 'span', text: '           ', style: { width: '95px' } }),
                        $({ tag: 'span', text: 'Attention: ', style: { fontWeight: 'normal', width: '70px' } }),
                        $({ tag: 'span', text: 'Research Chairs', style: { fontWeight: 'bold' } })
                    ]
                }),
                $({
                    tag: 'div',
                    style: { fontSize: '12pt', margin: '0 0 5px 0', color: '#000', display: 'flex' },
                    child: [
                        $({ tag: 'span', text: '           ', style: { width: '70px' } }),
                        $({ tag: 'span', text: '           ', style: { width: '95px' } }),
                        $({ tag: 'span', text: 'Extension Chairs', style: { fontWeight: 'bold' } })
                    ]
                }),
                $({ tag: 'div', style: { height: '20px' } }),

                // Dear line
                $({
                    tag: 'div',
                    style: { fontSize: '12pt', margin: '0 0 5px 0', color: '#000' },
                    child: [
                        $({ tag: 'span', text: 'Dear ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: 'Sir/Ma\'am:', style: { fontWeight: 'bold' } })
                    ]
                }),
                $({ tag: 'div', style: { height: '20px' } }),

                // Greeting
                $({
                    tag: 'h4',
                    text: 'Greetings!',
                    style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' }
                }),
                $({ tag: 'div', style: { height: '20px' } }),

                // Event description
                $({
                    tag: 'p',
                    style: {
                        fontSize: '12pt',
                        fontWeight: 'normal',
                        margin: '0 0 15px 0',
                        color: '#333',
                        lineHeight: '1.5',
                        textAlign: 'justify'
                    },
                    child: [
                        $({ tag: 'span', text: 'We are pleased to inform you that the following research and extension proposals were accepted for presentation in the ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: eventName, style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: ' which will be held on ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: formData?.dateToBeHeld, style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: ' at ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: formData?.venue, style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: '.', style: { fontWeight: 'normal' } })
                    ]
                }),

                $({ tag: 'div', style: { height: '15px' } }),

                // FOOTER CONTENT
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    },
                    child: [
                        $({
                            tag: 'p',
                            style: { fontSize: '12pt', lineHeight: '1.5', marginBottom: '20px' },
                            child: [
                                $({ tag: 'span', text: `Kindly advise the proposal presenters to submit their PowerPoint presentation on or before ${formData?.pptDeadline} via the Google Drive link ` }),
                                $({
                                    tag: 'a',
                                    text: formData?.driveLink,
                                    att: {
                                        href: formData?.driveLink,
                                        target: '_blank',
                                        style: 'color: #87CEEB !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;'
                                    },
                                    style: {
                                        color: '#87CEEB',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    }
                                }),
                                $({ tag: 'span', text: ' and bring four copies of their manuscript during the event.' })
                            ]
                        }),
                        $({ tag: 'p', style: { fontSize: '12pt', lineHeight: '1.5', marginBottom: '20px' }, text: 'Thank you.' }),
                        $({ tag: 'p', style: { fontSize: '12pt', lineHeight: '1.5', marginBottom: '30px' }, text: 'Very truly yours,' }),

                        // Signatures row
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '30px',
                                width: '100%',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        textAlign: 'left',
                                        width: '45%',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    },
                                    child: [
                                        $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'STEPHANIE S. PIMENTEL, PhD' }),
                                        $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'University Research Director' })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '45%',
                                        marginLeft: '5px',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    },
                                    child: [
                                        $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'FRENCH A. DAMPOG, MBA' }),
                                        $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'University IPMO Director' })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        items.push({
            type: 'combined-header-footer',
            height: 1100,
            element: combinedHeaderFooter
        });

        // Add page break
        items.push({
            type: 'page-break',
            height: 0,
            element: $({
                tag: 'div',
                style: {
                    pageBreakBefore: 'always',
                    height: '0',
                    margin: '0',
                    padding: '0'
                }
            })
        });

        // Add Noted section (Page 2)
        items.push({
            type: 'noted-section',
            height: 450,
            element: $({
                tag: 'div',
                att: { className: 'noted-section' },
                style: {
                    marginTop: '30px',
                    width: '100%',
                    pageBreakBefore: 'always',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            textAlign: 'left',
                            marginBottom: '25px',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'JOCELYN S. LEGASPI, MFT' }),
                            $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'University Extension Director' })
                        ]
                    }),
                    $({ tag: 'p', style: { fontSize: '12pt', marginBottom: '30px', marginTop: '20px' }, text: 'Noted:' }),
                    $({
                        tag: 'div',
                        style: {
                            marginBottom: '30px',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'LEO ANDREW B. BICLAR, PhD' }),
                            $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'VP for RDE' })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            marginBottom: '20px',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'EFREN L. LINAN, PhD' }),
                            $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'SUC President III' })
                        ]
                    }),
                    $({ tag: 'p', style: { fontSize: '11pt', fontStyle: 'italic', marginTop: '20px' }, text: 'Cc: RDE' })
                ]
            })
        });

        // Add page break before categories
        items.push({
            type: 'page-break',
            height: 0,
            element: $({
                tag: 'div',
                style: {
                    pageBreakBefore: 'always',
                    height: '0',
                    margin: '0',
                    padding: '0'
                }
            })
        });

        // Now add categories with their documents (Page 3+)
        let docCounter = 1;
        sortedCategories.forEach(category => {
            const docs = categoryGroups[category];
            if (!docs.length) return;

            // Category header
            items.push({
                type: 'category-header',
                categoryName: category,
                height: 54,
                element: $({
                    tag: 'h2',
                    att: { className: 'category-header' },
                    style: {
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        margin: '15px 0 10px 0',
                        padding: '5px 0',
                        borderBottom: '2px solid #000',
                        color: '#000',
                        textTransform: 'uppercase',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    },
                    text: category
                })
            });

            // Documents for this category
            docs.forEach((doc) => {
                const authorsText = doc.authors?.length > 0
                    ? doc.authors.join(', ')
                    : 'No author specified';

                // Height calculation
                const CHARS_PER_LINE = 95;
                const BASE_LINE_HEIGHT = 22;
                const PRESENTER_LINE_PX = 18;
                const MARGIN_PX = 10;

                const titleLineText = `${doc.title} by ${authorsText} - ${doc.category}`;
                const words = titleLineText.split(' ');
                let lineCount = 1;
                let currentLineLength = 0;

                for (const word of words) {
                    const wordLength = word.length;
                    if (currentLineLength + wordLength + 1 > CHARS_PER_LINE) {
                        lineCount++;
                        currentLineLength = wordLength;
                    } else {
                        currentLineLength += wordLength + 1;
                    }
                    if (wordLength > CHARS_PER_LINE * 0.8) {
                        const extraLines = Math.floor(wordLength / CHARS_PER_LINE);
                        lineCount += extraLines;
                    }
                }

                const hasScientificName = /[A-Z][a-z]+\s+[a-z]+|\([A-Z][a-z]+\.\)|[a-z]+\.?\s+[a-z]+/i.test(doc.title);
                let specialBuffer = 0;
                if (hasScientificName) specialBuffer += 8;
                if (doc.authors?.length > 5) specialBuffer += 5;

                lineCount = Math.max(2, Math.min(5, lineCount));
                const docHeight = (lineCount * BASE_LINE_HEIGHT) + PRESENTER_LINE_PX + MARGIN_PX + specialBuffer;
                const finalHeight = Math.min(Math.max(docHeight, 90), 180);

                items.push({
                    type: 'document',
                    categoryName: doc.category,
                    docNumber: docCounter,
                    height: finalHeight,
                    element: $({
                        tag: 'li',
                        att: {
                            className: 'document-item',
                            value: String(docCounter)
                        },
                        style: {
                            marginBottom: '8px',
                            fontSize: '11pt',
                            lineHeight: '1.35',
                            listStyleType: 'decimal',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            $({
                                tag: 'div',
                                att: { className: 'doc-title-line' },
                                style: {
                                    fontWeight: 'normal',
                                    marginBottom: '1px',
                                    WebkitPrintColorAdjust: 'exact',
                                    printColorAdjust: 'exact'
                                },
                                child: [
                                    $({ tag: 'span', html: `${doc.title} by `, style: { fontWeight: 'normal' } }),
                                    $({ tag: 'span', text: authorsText, style: { fontWeight: 'normal', fontStyle: 'italic' } }),
                                    $({ tag: 'span', text: ` - ${doc.category}`, style: { fontWeight: 'normal' } }),
                                ]
                            }),
                            $({
                                tag: 'div',
                                att: { className: 'doc-presenter-line' },
                                style: {
                                    marginLeft: '20px',
                                    fontSize: '10pt',
                                    color: '#555',
                                    fontStyle: 'italic',
                                    marginTop: '0px',
                                    WebkitPrintColorAdjust: 'exact',
                                    printColorAdjust: 'exact'
                                },
                                text: `Presenter: ${doc.presenter}`
                            })
                        ]
                    })
                });
                docCounter++;
            });
        });

        return items;
    }

    // ─── Pagination ───────────────────────────────────────────────────────────
    const paginateItems = (flatItems) => {
        const pages = []
        let current = []
        let usedHeight = 0
        const flush = () => {
            if (current.length) {
                pages.push([...current])
                current = []
                usedHeight = 0
            }
        }
        for (let i = 0; i < flatItems.length; i++) {
            const item = flatItems[i]
            const pairedHeight = (item.type === 'center-header' && i + 1 < flatItems.length)
                ? item.height + flatItems[i + 1].height
                : item.height
            if (usedHeight + pairedHeight > USABLE_HEIGHT && current.length > 0) {
                flush()
            }
            current.push(item)
            usedHeight += item.height
        }
        flush()
        return pages
    }

    const buildPageChildren = (flatItems) => {
        const children = []
        let i = 0
        while (i < flatItems.length) {
            const item = flatItems[i]

            if (item.type === 'page-break') {
                i++
                continue
            }

            if (item.type === 'combined-header-footer' || 
                item.type === 'noted-section' || 
                item.type === 'title' || 
                item.type === 'footer' || 
                item.type === 'spacer') {
                children.push(item.element)
                i++
                continue
            }

            if (item.type === 'category-header') {
                const headerEl = item.element
                const docElements = []
                let firstDocNumber = 1
                let j = i + 1
                while (j < flatItems.length && flatItems[j].type === 'document') {
                    if (docElements.length === 0) {
                        firstDocNumber = flatItems[j].docNumber
                    }
                    docElements.push(flatItems[j].element)
                    j++
                }
                if (docElements.length > 0) {
                    children.push($({
                        tag: 'div',
                        att: { className: 'category-section' },
                        style: {
                            marginBottom: '30px',
                            position: 'relative',
                            zIndex: 2,
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            headerEl,
                            $({
                                tag: 'ol',
                                att: {
                                    className: 'documents-list',
                                    start: String(firstDocNumber)
                                },
                                style: {
                                    margin: '5px 0 10px 20px',
                                    paddingLeft: '20px',
                                    WebkitPrintColorAdjust: 'exact',
                                    printColorAdjust: 'exact'
                                },
                                child: docElements
                            })
                        ]
                    }))
                    i = j
                } else {
                    children.push(headerEl)
                    i++
                }
                continue
            }

            // Continuation docs (fallback)
            const docElements = []
            let firstDocNumber = 1
            while (i < flatItems.length && flatItems[i].type === 'document') {
                if (docElements.length === 0) {
                    firstDocNumber = flatItems[i].docNumber
                }
                docElements.push(flatItems[i].element)
                i++
            }

            if (docElements.length > 0) {
                children.push($({
                    tag: 'div',
                    att: { className: 'category-section' },
                    style: {
                        marginLeft: '15px',
                        marginBottom: '20px',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    },
                    child: [$({
                        tag: 'ol',
                        att: {
                            className: 'documents-list',
                            start: String(firstDocNumber)
                        },
                        style: {
                            margin: '5px 0 10px 20px',
                            paddingLeft: '20px',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: docElements
                    })]
                }))
            }
        }
        return children
    }

    // ─── Page container ───────────────────────────────────────────────────
    const createPageContainer = (flatItems, pageNumber, totalPages) => {
        const pageChildren = buildPageChildren(flatItems)

        return $({
            tag: 'div',
            att: { className: 'print-page' },
            style: {
                position: 'relative',
                width: '21cm',
                height: '29.7cm',
                margin: '0 auto',
                backgroundColor: 'transparent',
                pageBreakAfter: pageNumber < totalPages ? 'always' : 'avoid',
                overflow: 'visible',
                boxSizing: 'border-box'
            },
            child: [

                $({
                    tag: 'div',
                    att: { className: 'page-background' },
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        margin: 0,
                        padding: 0
                    },
                    child: [$({
                        tag: 'img',
                        att: {
                            src: '/client/images/header.png',
                            className: 'background-img',
                            alt: 'Page background'
                        },
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center center',
                            display: 'block',
                            margin: 0,
                            padding: 0
                        }
                    })]
                }),
                $({
                    tag: 'div',
                    att: { className: 'page-content' },
                    style: {
                        position: 'relative',
                        zIndex: 2,
                        padding: '4cm 1.5cm 4cm 1.5cm',
                        width: '100%',
                        minHeight: '29.7cm',
                        boxSizing: 'border-box',
                        backgroundColor: 'transparent',
                        textAlign: 'justify'
                    },
                    child: [
                        ...pageChildren,

                        // Page number at the bottom
                        $({
                            tag: 'div',
                            att: { className: 'page-number' },
                            style: {
                                position: 'absolute',
                                bottom: '4cm',
                                right: '1.5cm',
                                fontSize: '10pt',
                                color: '#666',
                                zIndex: 3,
                                fontWeight: 'normal'
                            },
                            text: `Page ${pageNumber} of ${totalPages}`
                        })
                    ]
                })
            ]
        })
    }

    // ─── Main 
    const flatItems = buildFlatItems();
    const pages = paginateItems(flatItems);
    const totalPages = pages.length;

    return $({
        tag: 'div',
        att: { className: 'print-research-summary' },
        style: { width: '100%', fontFamily: 'Arial, sans-serif' },
        child: pages.map((pageItems, idx) =>
            createPageContainer(pageItems, idx + 1, totalPages)
        )
    })
}
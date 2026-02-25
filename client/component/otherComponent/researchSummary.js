import {$} from "../../lib/lib.js";

export const PrintResearch = ({eventName, data, formData}) => {

    // A4 at 96dpi: 29.7cm ≈ 1122px, 21cm ≈ 793px
    // Content area = 29.7cm - 4cm top - 4cm bottom = 21.7cm ≈ 820px
    // We use points-like units at 96dpi (1cm ≈ 37.8px)
    const CM = 37.8 // px per cm at 96dpi

    const PAGE_HEIGHT_PX   = 29.7 * CM  // ~1122px
    const TOP_PADDING_PX   = 4    * CM //  ~151px
    const BOTTOM_PADDING_PX = 2   * CM  //  ~151px
    const CONTENT_AREA_PX  = PAGE_HEIGHT_PX - TOP_PADDING_PX - BOTTOM_PADDING_PX; // ~820px
    const PAGE_NUMBER_RESERVED = 0.3 * CM // ~30px for page number at bottom

    const USABLE_HEIGHT = CONTENT_AREA_PX - PAGE_NUMBER_RESERVED // ~790px

    // Realistic height estimates based on actual font sizes + margins (at 96dpi)
    // 1pt ≈ 1.33px
    const estimateHeight = (element) => {
        if (!element) return 0

        const cls = element.att?.className || ''

        if (cls.includes('summary-header')) {
            // h1 (18pt≈24px) + h2 (14pt≈19px) + margins
            return 24 + 5 + 19 + 15 + 40 + 20 // ~123px
        }
        if (cls.includes('center-header')) {
            // h2 14pt ≈ 19px + padding + border + margins
            return 19 + 10 + 15 + 10 // ~54px
        }
        if (cls.includes('category-section')) {
            // Just the ol wrapper itself (children counted separately)
            return 5 + 10 // ~15px (margins only, docs counted below)
        }
        if (cls.includes('document-item')) {
            // Title line: 11pt≈15px * ~2 lines + presenter line: 10pt≈13px + margins
            return (15 * 2 * 1.5) + 13 + 12 // ~70px average
        }
        if (cls.includes('documents-list')) {
            return 5 + 10 // list margins only
        }
        if (cls.includes('center-section')) {
            return 30 // section wrapper margin only
        }

        return 0 // unknown elements contribute 0 (children are counted separately)
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

    // ─── Render helpers ────────────────────────────────────────────

    const renderDocument = (doc, categoryName) => {
        const authorsText = doc.authors?.length > 0
            ? doc.authors.join(', ')
            : 'No author specified'

        return $({
            tag: 'li',
            att: { className: 'document-item' },
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

    const renderCenter = (center) => {
        const categoriesWithDocs = center.categories.filter(cat => cat.docs?.length > 0);
        if (!categoriesWithDocs.length) return null;

        return $({
            tag: 'div',
            att: { className: 'center-section' },
            style: { marginBottom: '30px', position: 'relative', zIndex: 2 },
            child: [
                $({
                    tag: 'h2',
                    att: { className: 'center-header' },
                    style: {
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        margin: '15px 0 10px 0',
                        padding: '5px 0',
                        borderBottom: '2px solid #000',
                        color: '#000',
                        textTransform: 'uppercase'
                    },
                    text: center.name
                }),
                ...categoriesWithDocs.map(cat => renderCategory(cat))
            ]
        })
    }

    // ─── Footer Component ────────────────────────────────────────────────────
    const renderFooter = () => {
        return $({
            tag: 'div',
            att: { className: 'letter-footer' },
            style: {
                marginTop: '60px',
                width: '100%'
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
                            att: { href: formData?.driveLink, target: '_blank' },
                            style: { color: '#87CEEB' } // Sky blue
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
                        width: '100%' 
                    },
                    child: [
                        // Left signature
                        $({
                            tag: 'div',
                            style: { textAlign: 'left', width: '45%' },
                            child: [
                                $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'STEPHANIE S. PIMENTEL, PhD' }),
                                $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'University Research Director' })
                            ]
                        }),
                        
                        // Right signature - FRENCH A. DAMPOG, MBA
                        $({
                            tag: 'div',
                            style: { 
                                width: '45%',
                                marginLeft: '5px'  // ← 20px away from PhD
                            },
                            child: [
                                $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'FRENCH A. DAMPOG, MBA' }),
                                $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'University IPMO Director' })
                            ]
                        })
                    ]
                }),

                // Third signature
                $({
                    tag: 'div',
                    style: { textAlign: 'left', marginBottom: '25px' },
                    child: [
                        $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'JOCELYN S. LEGASPI, MFT' }),
                        $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'University Extension Director' })
                    ]
                }),

                $({ tag: 'p', style: { fontSize: '12pt', marginBottom: '30px' }, text: 'Noted:' }),

                // VP Signature
                $({
                    tag: 'div',
                    style: { marginBottom: '30px' },
                    child: [
                        $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'LEO ANDREW B. BICLAR, PhD' }),
                        $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'VP for RDE' })
                    ]
                }),

                // President Signature
                $({
                    tag: 'div',
                    style: { marginBottom: '20px' },
                    child: [
                        $({ tag: 'p', style: { fontSize: '12pt', fontWeight: 'bold', marginBottom: '5px' }, text: 'EFREN L. LINAN, PhD' }),
                        $({ tag: 'p', style: { fontSize: '11pt', marginTop: '0' }, text: 'SUC President III' })
                    ]
                }),

                $({ tag: 'p', style: { fontSize: '11pt', fontStyle: 'italic', marginTop: '20px' }, text: 'Cc: RDE' })
            ]
        })
    }

    // ─── Flat content list ────────────────────────────────────────────────────
    const buildFlatItems = () => {
        const items = []

        // Title block with all requirements
        items.push({
            type: 'title',
            height: 500, // Increased height for all the new content
            element: $({
                tag: 'div',
                att: { className: 'summary-header' },
                style: { 
                    textAlign: 'left', 
                    marginBottom: '30px', 
                    marginTop: '10px',
                    lineHeight: '1.0'
                },
                child: [
                    // Header lines
                    $({ tag: 'h1', text: 'OFFICE OF THE UNIVERSITY PRESIDENT',
                        style: { fontSize: '18pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#43A5BE', textAlign: 'center' } }),
                    // Spacing
                    $({ tag: 'div', style: { height: '20px' } }),
                    // Date
                    $({ 
                        tag: 'h2', 
                        text: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' } 
                    }),

                    // Spacing
                    $({ tag: 'div', style: { height: '20px' } }),

                    // Recipients
                    $({ tag: 'h2', text: 'CAMPUS ADMINISTRATORS',
                        style: { fontSize: '12pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' } }),
                    $({ tag: 'h2', text: 'SATELLITE COLLEGE DIRECTORS',
                        style: { fontSize: '12pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' } }),
                    $({ tag: 'h2', text: 'RESEARCH CENTER DIRECTORS',
                        style: { fontSize: '12pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' } }),
                    $({ tag: 'h2', text: 'This University',
                        style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' } }),

                    // Spacing
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

                    // Spacing
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

                    // Spacing
                    $({ tag: 'div', style: { height: '20px' } }),

                    // Greeting
                    $({ 
                        tag: 'h4', 
                        text: 'Greetings!',
                        style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' } 
                    }),

                    // Spacing
                    $({ tag: 'div', style: { height: '20px' } }),

                    // Event description with bold date and location
                    $({
                        tag: 'p',
                        style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 15px 0', color: '#333', lineHeight: '1.5', textAlign: 'justify' },
                        child: [
                            $({ tag: 'span', text: 'We are pleased to inform you that the following research and extension proposals were accepted for presentation in the ', style: { fontWeight: 'normal' } }),
                            $({ tag: 'span', text: eventName, style: { fontWeight: 'bold' } }),
                            $({ tag: 'span', text: ' which will be held on ', style: { fontWeight: 'normal' } }),
                            $({ tag: 'span', text: formData?.dateToBeHeld, style: { fontWeight: 'bold' } }),
                            $({ tag: 'span', text: ' at ', style: { fontWeight: 'normal' } }),
                            $({ tag: 'span', text: formData?.venue, style: { fontWeight: 'bold' } }),
                            $({ tag: 'span', text: '.', style: { fontWeight: 'normal' } })
                        ]
                    })
                ]
            })
        })

        // Add all centers
        centersWithDocs.forEach(center => {
            const categoriesWithDocs = center.categories.filter(cat => cat.docs?.length > 0)
            if (!categoriesWithDocs.length) return

            let centerDocCounter = 1

            items.push({
                type: 'center-header',
                centerName: center.name,
                height: 54,
                element: $({
                    tag: 'h2',
                    att: { className: 'center-header' },
                    style: {
                        fontSize: '14pt', fontWeight: 'bold',
                        margin: '15px 0 10px 0', padding: '5px 0',
                        borderBottom: '2px solid #000', color: '#000',
                        textTransform: 'uppercase'
                    },
                    text: center.name
                })
            })

            categoriesWithDocs.forEach(cat => {
                cat.docs.forEach((doc, idx) => {
                    const authorsText = doc.authors?.length > 0
                        ? doc.authors.join(', ')
                        : 'No author specified'

                    const titleText = `${doc.title} by ${authorsText} - ${cat.category}`
                    const charsPerLine = 65
                    const titleLines = Math.ceil(titleText.length / charsPerLine)
                    const titlePx = titleLines * 22
                    const presenterPx = 13 * 1.5
                    const marginPx = 12
                    const docHeight = titlePx + presenterPx + marginPx

                    items.push({
                        type: 'document',
                        centerName: center.name,
                        isFirstInCategory: idx === 0,
                        categoryName: cat.category,
                        docNumber: centerDocCounter,
                        height: docHeight,
                        element: $({
                            tag: 'li',
                            att: {
                                className: 'document-item',
                                value: String(centerDocCounter)
                            },
                            style: {
                                marginBottom: '12px', fontSize: '11pt',
                                lineHeight: '1.5', listStyleType: 'decimal'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: { className: 'doc-title-line' },
                                    style: { fontWeight: 'normal', marginBottom: '2px' },
                                    child: [
                                        $({ tag: 'span', text: `${doc.title} by `, style: { fontWeight: 'normal' } }),
                                        $({ tag: 'span', text: authorsText, style: { fontWeight: 'normal', fontStyle: 'italic' } }),
                                        $({ tag: 'span', text: ` - ${cat.category}`, style: { fontWeight: 'normal' } }),
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    att: { className: 'doc-presenter-line' },
                                    style: {
                                        marginLeft: '20px', fontSize: '10pt',
                                        color: '#555', fontStyle: 'italic'
                                    },
                                    text: `Presenter: ${doc.presenter}`
                                })
                            ]
                        })
                    })
                    centerDocCounter++
                })
            })
        })
        // Add footer as the last item
        items.push({
            type: 'footer',
            height: 800, // Approximate height for all footer content
            element: renderFooter()
        })
        return items
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

    // ─── Assemble a page DOM from flat items ──────────────────────────────────
    const buildPageChildren = (flatItems) => {
        const children = []
        let i = 0

        while (i < flatItems.length) {
            const item = flatItems[i]

            if (item.type === 'title' || item.type === 'footer') {
                children.push(item.element)
                i++
                continue
            }

            if (item.type === 'center-header') {
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
                        att: { className: 'center-section' },
                        style: { marginBottom: '30px', position: 'relative', zIndex: 2 },
                        child: [
                            headerEl,
                            $({
                                tag: 'div',
                                att: { className: 'category-section' },
                                style: { marginLeft: '15px', marginBottom: '20px' },
                                child: [$({
                                    tag: 'ol',
                                    att: {
                                        className: 'documents-list',
                                        start: String(firstDocNumber)
                                    },
                                    style: { margin: '5px 0 10px 20px', paddingLeft: '20px' },
                                    child: docElements
                                })]
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

            // Continuation docs
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
                    style: { marginLeft: '15px', marginBottom: '20px' },
                    child: [$({
                        tag: 'ol',
                        att: {
                            className: 'documents-list',
                            start: String(firstDocNumber)
                        },
                        style: { margin: '5px 0 10px 20px', paddingLeft: '20px' },
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
                minHeight: '29.7cm',
                margin: '0 auto',
                backgroundColor: 'transparent',
                pageBreakAfter: pageNumber < totalPages ? 'always' : 'avoid',
                overflow: 'visible',
                boxSizing: 'border-box'
            },
            child: [
                // Background Image - Fixed to cover entire page with no white spaces
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
                            objectFit: 'cover',  // This ensures image covers entire area
                            objectPosition: 'center center', // Center the image
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
                                bottom: '3.5cm',
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
    const centersWithDocs = data?.length > 0
        ? data[0].centers.filter(center =>
            center.categories.some(cat => cat.docs?.length > 0)
          )
        : []

    const flatItems   = buildFlatItems();
    const pages       = paginateItems(flatItems);
    const totalPages  = pages.length;

    return $({
        tag: 'div',
        att: { className: 'print-research-summary' },
        style: { width: '100%', fontFamily: 'Arial, sans-serif' },
        child: pages.map((pageItems, idx) =>
            createPageContainer(pageItems, idx + 1, totalPages)
        )
    })
}
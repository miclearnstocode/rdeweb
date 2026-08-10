import { $ } from "../../lib/lib.js";

export const PrintResearchZoom = ({ eventName, data, formData }) => {
    const CM = 37.8;

    const PAGE_HEIGHT_PX = 29.7 * CM;
    const TOP_PADDING_PX = 4 * CM;
    const BOTTOM_PADDING_PX = 4 * CM;
    const CONTENT_AREA_PX = PAGE_HEIGHT_PX - TOP_PADDING_PX - BOTTOM_PADDING_PX;

    const categoriesData = data?.length > 0 ? data[0].categories : [];

    // ─── Text measurement utilities ───────────────────────────────────────────
    const measureTextHeight = (text, fontSize = 11, lineHeight = 1.5, maxWidth = 450) => {
        if (!text) return 0;
        
        // Approximate characters per line based on font size and width
        // At 11pt with Arial, roughly 7-8 characters per cm
        const charsPerLine = Math.floor(maxWidth / (fontSize * 0.35));
        const words = text.split(' ');
        let lines = 1;
        let currentLineLength = 0;
        
        for (const word of words) {
            const wordLength = word.length;
            if (currentLineLength + wordLength + 1 > charsPerLine) {
                lines++;
                currentLineLength = wordLength;
            } else {
                currentLineLength += wordLength + 1;
            }
            // Handle long words (scientific names)
            if (wordLength > charsPerLine * 0.7) {
                const extraLines = Math.floor(wordLength / charsPerLine);
                lines += extraLines;
            }
        }
        
        // Minimum 1 line
        lines = Math.max(1, lines);
        
        // Height in pixels: lines * font size * line height
        return lines * fontSize * lineHeight;
    };

    const measureElementHeight = (element) => {
        if (!element) return 0;
        
        let totalHeight = 0;
        const style = element.style || {};
        
        // Add margins/padding
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        const paddingTop = parseFloat(style.paddingTop) || 0;
        const paddingBottom = parseFloat(style.paddingBottom) || 0;
        
        totalHeight += marginTop + marginBottom + paddingTop + paddingBottom;
        
        // If it's a text node or has text content
        if (element.text) {
            const fontSize = parseFloat(style.fontSize) || 11;
            const lineHeight = parseFloat(style.lineHeight) || 1.5;
            const maxWidth = parseFloat(style.maxWidth) || 450;
            totalHeight += measureTextHeight(element.text, fontSize, lineHeight, maxWidth);
        }
        
        // Recursively measure children
        if (element.child && Array.isArray(element.child)) {
            for (const child of element.child) {
                if (child) {
                    totalHeight += measureElementHeight(child);
                }
            }
        }
        
        return totalHeight;
    };

    // ─── Build content with accurate height tracking ────────────────────────
    const buildContentItems = () => {
        const items = [];
        const allDocs = [];

        // Flatten all documents
        categoriesData.forEach(category => {
            category.docs.forEach(doc => {
                allDocs.push({
                    ...doc,
                    category: category.category
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

        const sortedCategories = Object.keys(categoryGroups).sort();

        // ─── Page 1: Header + Letter Body ──────────────────────────────────
        const currentDate = new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const pptDeadline = formData?.pptDeadline || 'the day before the event';

        // Build header content with accurate height calculation
        const headerItems = [
            { type: 'title', text: 'OFFICE OF THE UNIVERSITY PRESIDENT', fontSize: 18, marginBottom: 5 },
            { type: 'spacer', height: 20 },
            { type: 'date', text: currentDate, fontSize: 12, marginBottom: 5 },
            { type: 'spacer', height: 20 },
            { type: 'subtitle', text: 'CAMPUS ADMINISTRATORS', fontSize: 12, bold: true, marginBottom: 5 },
            { type: 'subtitle', text: 'SATELLITE COLLEGE DIRECTORS', fontSize: 12, bold: true, marginBottom: 5 },
            { type: 'subtitle', text: 'RESEARCH CENTER DIRECTORS', fontSize: 12, bold: true, marginBottom: 5 },
            { type: 'subtitle', text: 'This University', fontSize: 12, marginBottom: 5 },
            { type: 'spacer', height: 20 },
            { type: 'attention', text: 'Attention: Research Chairs', fontSize: 12, marginBottom: 5 },
            { type: 'attention', text: 'Extension Chairs', fontSize: 12, marginBottom: 5 },
            { type: 'spacer', height: 20 },
            { type: 'greeting', text: 'Dear Sir/Ma\'am:', fontSize: 12, bold: true, marginBottom: 5 },
            { type: 'spacer', height: 20 },
            { type: 'greeting', text: 'Greetings!', fontSize: 12, marginBottom: 5 },
            { type: 'spacer', height: 20 },
        ];

        // Main letter body - this is the long text that needs careful handling
        const letterBody = `We are pleased to inform you that the following research and extension papers were accepted for presentation in the ${eventName} which will be held on ${formData?.dateToBeHeld || 'the scheduled date'} via Zoom teleconference.`;

        const letterBody2 = `For your reference, below are the Zoom meeting details for the ${eventName}:`;

        headerItems.push({
            type: 'text',
            text: letterBody,
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 15
        });

        headerItems.push({ type: 'spacer', height: 10 });

        headerItems.push({
            type: 'text',
            text: letterBody2,
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 10
        });

        headerItems.push({ type: 'spacer', height: 10 });

        // Zoom details
        headerItems.push({
            type: 'zoom-details',
            link: formData?.zoomLink || 'https://zoom.us/j/92157257818',
            meetingId: formData?.meetingId || '921 5725 7818',
            passcode: formData?.passcode || 'capsurde',
            fontSize: 11,
            marginBottom: 10
        });

        headerItems.push({ type: 'spacer', height: 10 });

        // PPT deadline
        const pptText = `Kindly advise the research and extension presenters to submit their PowerPoint presentation on or before ${pptDeadline} via the Google Drive link ${formData?.driveLink || 'https://bit.ly/44thSymposiumPPTs'}.`;

        headerItems.push({
            type: 'text',
            text: pptText,
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 20
        });

        headerItems.push({
            type: 'text',
            text: 'Thank you.',
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 30
        });

        headerItems.push({
            type: 'text',
            text: 'Very truly yours,',
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 30
        });

        // Signatures
        headerItems.push({
            type: 'signature',
            name: 'STEPHANIE S. PIMENTEL, PhD',
            title: 'University Research Director',
            fontSize: 12,
            marginBottom: 30
        });

        headerItems.push({
            type: 'signature',
            name: 'FRENCH A. DAMPOG, MBA',
            title: 'University IPMO Director',
            fontSize: 12,
            marginBottom: 10
        });

        // Add all header items to the main items list
        items.push({
            type: 'page-content',
            pageNumber: 1,
            content: headerItems
        });

        // ─── Page 2: Noted Section ──────────────────────────────────────────
        const notedItems = [
            { type: 'spacer', height: 40 },
            {
                type: 'signature',
                name: 'JOCELYN S. LEGASPI, MFT',
                title: 'University Extension Director',
                fontSize: 12,
                marginBottom: 30
            },
            { type: 'text', text: 'Noted:', fontSize: 12, marginBottom: 30 },
            {
                type: 'signature',
                name: 'LEO ANDREW B. BICLAR, PhD',
                title: 'VP for RDE',
                fontSize: 12,
                marginBottom: 30
            },
            {
                type: 'signature',
                name: 'EFREN L. LINAN, PhD',
                title: 'SUC President III',
                fontSize: 12,
                marginBottom: 20
            },
            { type: 'text', text: 'Cc: RDE', fontSize: 11, italic: true, marginBottom: 10 }
        ];

        items.push({
            type: 'page-content',
            pageNumber: 2,
            content: notedItems
        });

        // ─── Pages 3+: Categories and Documents ────────────────────────────
        // Collect all documents with their categories
        const allDocItems = [];
        let docCounter = 1;

        sortedCategories.forEach(category => {
            const docs = categoryGroups[category] || [];
            if (docs.length === 0) return;

            // Category header
            allDocItems.push({
                type: 'category-header',
                text: category,
                fontSize: 14,
                bold: true,
                marginTop: 10,
                marginBottom: 8,
                borderBottom: true
            });

            // Documents in this category
            docs.forEach(doc => {
                const authorsText = doc.authors?.length > 0
                    ? doc.authors.join(', ')
                    : 'No author specified';

                const hasPresenter = doc.presenter &&
                    doc.presenter.trim() !== '' &&
                    doc.presenter !== 'Not specified' &&
                    doc.presenter !== 'Not Specified' &&
                    doc.presenter.toLowerCase() !== 'not specified';

                const docText = `${doc.title} by ${authorsText} - ${doc.category}`;
                const presenterText = hasPresenter ? `Presenter: ${doc.presenter}` : null;

                allDocItems.push({
                    type: 'document',
                    number: docCounter,
                    text: docText,
                    presenter: presenterText,
                    fontSize: 11,
                    lineHeight: 1.5,
                    marginBottom: 12,
                    indent: 20
                });

                docCounter++;
            });

            // Spacer after category
            allDocItems.push({
                type: 'spacer',
                height: 5
            });
        });

        // Now paginate the document items
        const documentPages = paginateDocumentItems(allDocItems);

        // Add each document page to items
        documentPages.forEach((pageItems, index) => {
            items.push({
                type: 'page-content',
                pageNumber: 3 + index,
                content: pageItems,
                isDocumentPage: true
            });
        });

        return items;
    };

    // ─── Paginate document items (categories and documents) ────────────────
    const paginateDocumentItems = (allItems) => {
        const pages = [];
        let currentPage = [];
        let usedHeight = 0;

        // Maximum usable height (accounting for padding)
        const MAX_HEIGHT = CONTENT_AREA_PX * 0.92;

        // Function to calculate item height
        const calculateItemHeight = (item) => {
            switch (item.type) {
                case 'category-header':
                    return 30; // Fixed height for category header
                case 'document': {
                    // Calculate text height
                    const fontSize = item.fontSize || 11;
                    const lineHeight = item.lineHeight || 1.5;
                    const maxWidth = 450; // Available width in pixels

                    // Measure the main text
                    const textHeight = measureTextHeight(item.text, fontSize, lineHeight, maxWidth);
                    let totalHeight = textHeight + (item.marginBottom || 12);

                    // Add presenter line if exists
                    if (item.presenter) {
                        const presenterHeight = measureTextHeight(item.presenter, fontSize * 0.9, lineHeight, maxWidth - 30);
                        totalHeight += presenterHeight + 4;
                    }

                    return Math.max(totalHeight, 30); // Minimum height
                }
                case 'spacer':
                    return item.height || 5;
                default:
                    return 20;
            }
        };

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            const itemHeight = calculateItemHeight(item);

            // Check if we need to start a new page
            const wouldExceed = usedHeight + itemHeight > MAX_HEIGHT;

            if (wouldExceed && currentPage.length > 0) {
                // Don't put a category header alone on a page without documents
                if (item.type === 'category-header') {
                    // Check if there are documents after this header
                    let hasDocsAfter = false;
                    let j = i + 1;
                    while (j < allItems.length) {
                        if (allItems[j].type === 'document') {
                            hasDocsAfter = true;
                            break;
                        }
                        if (allItems[j].type === 'category-header') {
                            break;
                        }
                        j++;
                    }

                    // If no documents after, put it on current page even if it exceeds
                    if (!hasDocsAfter) {
                        currentPage.push(item);
                        usedHeight += itemHeight;
                        continue;
                    }
                }

                // Save current page and start new one
                pages.push([...currentPage]);
                currentPage = [];
                usedHeight = 0;
            }

            // Add item to current page
            currentPage.push(item);
            usedHeight += itemHeight;

            // If this is a category header, check if it's followed by documents
            // If the category header is the last item and there are no documents after it,
            // we can skip it or keep it on the current page
        }

        // Add remaining items
        if (currentPage.length > 0) {
            pages.push([...currentPage]);
        }

        return pages;
    };

    // ─── Render items to DOM elements ──────────────────────────────────────
    const renderContentItems = (items) => {
        const elements = [];

        for (const item of items) {
            switch (item.type) {
                case 'title':
                    elements.push($({
                        tag: 'h1',
                        text: item.text,
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            fontWeight: 'normal',
                            margin: `0 0 ${item.marginBottom || 5}px 0`,
                            color: '#43A5BE',
                            textAlign: 'center',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        }
                    }));
                    break;

                case 'date':
                case 'subtitle':
                    elements.push($({
                        tag: item.type === 'subtitle' ? 'h2' : 'div',
                        text: item.text,
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            fontWeight: item.bold ? 'bold' : 'normal',
                            margin: `0 0 ${item.marginBottom || 5}px 0`,
                            color: '#000'
                        }
                    }));
                    break;

                case 'attention':
                    elements.push($({
                        tag: 'div',
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            margin: `0 0 ${item.marginBottom || 5}px 0`,
                            color: '#000',
                            display: 'flex'
                        },
                        child: [
                            $({ tag: 'span', text: '           ', style: { width: '95px' } }),
                            $({ tag: 'span', text: item.text, style: { fontWeight: 'bold' } })
                        ]
                    }));
                    break;

                case 'greeting':
                    elements.push($({
                        tag: 'div',
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            margin: `0 0 ${item.marginBottom || 5}px 0`,
                            color: '#000'
                        },
                        child: [
                            $({ tag: 'span', text: item.bold ? '' : 'Dear ', style: { fontWeight: 'normal' } }),
                            $({ tag: 'span', text: item.text, style: { fontWeight: item.bold ? 'bold' : 'normal' } })
                        ]
                    }));
                    break;

                case 'text':
                    elements.push($({
                        tag: 'p',
                        text: item.text,
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            fontWeight: item.bold ? 'bold' : 'normal',
                            fontStyle: item.italic ? 'italic' : 'normal',
                            margin: `0 0 ${item.marginBottom || 10}px 0`,
                            lineHeight: item.lineHeight || 1.5,
                            color: '#333',
                            textAlign: 'justify'
                        }
                    }));
                    break;

                case 'zoom-details':
                    elements.push($({
                        tag: 'div',
                        style: {
                            marginLeft: '20px',
                            marginBottom: `${item.marginBottom || 15}px`,
                            padding: '12px 16px',
                            backgroundColor: '#f5f7fa',
                            borderRadius: '4px',
                            border: '1px solid #e0e4e8',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            $({
                                tag: 'p',
                                style: { fontSize: `${item.fontSize}pt`, margin: '0 0 5px 0', fontWeight: 'bold' },
                                text: 'Join Zoom Meeting'
                            }),
                            $({
                                tag: 'p',
                                style: {
                                    fontSize: `${item.fontSize}pt`,
                                    margin: '5px 0',
                                    color: '#0066cc',
                                    wordBreak: 'break-all'
                                },
                                child: [
                                    $({
                                        tag: 'a',
                                        text: item.link,
                                        att: {
                                            href: item.link,
                                            target: '_blank'
                                        },
                                        style: {
                                            color: '#0066cc',
                                            textDecoration: 'underline',
                                            WebkitPrintColorAdjust: 'exact',
                                            printColorAdjust: 'exact'
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'p',
                                style: { fontSize: `${item.fontSize}pt`, margin: '3px 0' },
                                child: [
                                    $({ tag: 'span', text: 'Meeting ID: ', style: { fontWeight: 'bold' } }),
                                    $({ tag: 'span', text: item.meetingId })
                                ]
                            }),
                            $({
                                tag: 'p',
                                style: { fontSize: `${item.fontSize}pt`, margin: '3px 0' },
                                child: [
                                    $({ tag: 'span', text: 'Passcode: ', style: { fontWeight: 'bold' } }),
                                    $({ tag: 'span', text: item.passcode })
                                ]
                            })
                        ]
                    }));
                    break;

                case 'signature':
                    elements.push($({
                        tag: 'div',
                        style: {
                            marginBottom: `${item.marginBottom || 20}px`,
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        },
                        child: [
                            $({
                                tag: 'p',
                                style: {
                                    fontSize: `${item.fontSize}pt`,
                                    fontWeight: 'bold',
                                    marginBottom: '2px',
                                    marginTop: '0',
                                    textAlign: 'left'
                                },
                                text: item.name
                            }),
                            $({
                                tag: 'p',
                                style: {
                                    fontSize: `${item.fontSize - 1}pt`,
                                    marginTop: '0',
                                    marginBottom: '0',
                                    textAlign: 'left'
                                },
                                text: item.title
                            })
                        ]
                    }));
                    break;

                case 'category-header':
                    elements.push($({
                        tag: 'h2',
                        text: item.text,
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            fontWeight: 'bold',
                            margin: `${item.marginTop || 10}px 0 ${item.marginBottom || 8}px 0`,
                            padding: '3px 0',
                            borderBottom: item.borderBottom ? '2px solid #000' : 'none',
                            color: '#000',
                            textTransform: 'uppercase',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        }
                    }));
                    break;

                case 'document':
                    const docElements = [];

                    // Main document text with number
                    docElements.push($({
                        tag: 'div',
                        style: {
                            fontSize: `${item.fontSize}pt`,
                            lineHeight: item.lineHeight || 1.5,
                            marginLeft: `${item.indent || 0}px`,
                            marginBottom: '2px',
                            textAlign: 'justify'
                        },
                        child: [
                            $({ tag: 'span', text: `${item.number}. `, style: { fontWeight: 'bold' } }),
                            $({ tag: 'span', text: item.text })
                        ]
                    }));

                    // Presenter line if exists
                    if (item.presenter) {
                        docElements.push($({
                            tag: 'div',
                            style: {
                                fontSize: `${item.fontSize * 0.9}pt`,
                                marginLeft: `${(item.indent || 0) + 20}px`,
                                color: '#555',
                                fontStyle: 'italic',
                                marginBottom: '4px'
                            },
                            text: item.presenter
                        }));
                    }

                    elements.push($({
                        tag: 'div',
                        style: {
                            marginBottom: `${item.marginBottom || 12}px`
                        },
                        child: docElements
                    }));
                    break;

                case 'spacer':
                    elements.push($({
                        tag: 'div',
                        style: {
                            height: `${item.height || 5}px`
                        }
                    }));
                    break;

                default:
                    break;
            }
        }

        return elements;
    };

    // ─── Page Container ─────────────────────────────────────────────────────
    const createPage = (contentItems, pageNumber, totalPages) => {
        const children = renderContentItems(contentItems);

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
                overflow: 'hidden',
                boxSizing: 'border-box'
            },
            child: [
                // Background image
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
                // Page content
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
                        ...children,
                        // Page number
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
        });
    };

    // ─── Main ────────────────────────────────────────────────────────────────
    const contentItems = buildContentItems();

    // Group by page
    const pages = [];
    let currentPageItems = [];

    for (const item of contentItems) {
        if (item.type === 'page-content') {
            if (currentPageItems.length > 0) {
                pages.push(currentPageItems);
                currentPageItems = [];
            }
            pages.push(item.content);
        } else {
            currentPageItems.push(item);
        }
    }

    if (currentPageItems.length > 0) {
        pages.push(currentPageItems);
    }

    const totalPages = pages.length;

    return $({
        tag: 'div',
        att: { className: 'print-research-summary' },
        style: {
            width: '100%',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f0f0f0',
            padding: '20px'
        },
        child: pages.map((pageItems, idx) =>
            createPage(pageItems, idx + 1, totalPages)
        )
    });
};
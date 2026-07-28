// file: researchSummaryZoom.js
import { $ } from "../../lib/lib.js";

export const PrintResearchZoom = ({ eventName, data, formData }) => {
    const CM = 37.8; 

    const PAGE_HEIGHT_PX = 29.7 * CM;
    const TOP_PADDING_PX = 4 * CM;
    const BOTTOM_PADDING_PX = 4 * CM;
    const CONTENT_AREA_PX = PAGE_HEIGHT_PX - 140;
    // Increase usable height to use more space
    const USABLE_HEIGHT = CONTENT_AREA_PX * 0.92;

    const categoriesData = data?.length > 0 ? data[0].categories : [];

    const estimateHeight = (element) => {
        if (!element) return 0

        const cls = element.att?.className || ''

        if (cls.includes('summary-header')) {
            return 24 + 5 + 19 + 15 + 40 + 20;
        }
        if (cls.includes('center-header')) {
            return 19 + 10 + 15 + 10;
        }
        if (cls.includes('category-section')) {
            return 5 + 10;
        }
        if (cls.includes('document-item')) {
            return (15 * 2 * 1.5) + 13 + 12;
        }
        if (cls.includes('documents-list')) {
            return 5 + 10;
        }
        if (cls.includes('center-section')) {
            return 30;
        }

        return 0;
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

    const renderDocument = (doc, docNumber) => {
        const authorsText = doc.authors?.length > 0
            ? doc.authors.join(', ')
            : 'No author specified'

        const hasPresenter = doc.presenter && 
            doc.presenter.trim() !== '' && 
            doc.presenter !== 'Not specified' && 
            doc.presenter !== 'Not Specified' &&
            doc.presenter.toLowerCase() !== 'not specified';

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
                        $({ tag: 'span', text: ` - ${doc.category}`, style: { fontWeight: 'normal' } }),
                    ]
                }),
                hasPresenter ? $({
                    tag: 'div',
                    att: { className: 'doc-presenter-line' },
                    style: {
                        marginLeft: '20px',
                        fontSize: '10pt',
                        color: '#555',
                        fontStyle: 'italic'
                    },
                    text: `Presenter: ${doc.presenter}`
                }) : null
            ].filter(Boolean)
        })
    }

    const renderCategoryGroup = (category, allDocs) => {
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
                    child: docs.map((doc, index) => renderDocument(doc, index + 1))
                })
            ]
        })
    }

    // Calculate the day before the event date for PPT deadline
    const calculatePPTDeadline = (dateToBeHeld) => {
        if (!dateToBeHeld) return null;
        
        let dateStr = dateToBeHeld;
        const dateOnly = dateStr.split(' at ')[0].trim();
        
        if (dateOnly.includes('-')) {
            const parts = dateOnly.split('-');
            const firstPart = parts[0].trim();
            
            const monthMatch = firstPart.match(/([A-Za-z]+)/);
            const month = monthMatch ? monthMatch[0] : '';
            
            const dayMatch = firstPart.match(/(\d+)/);
            const day = dayMatch ? parseInt(dayMatch[0]) : 1;
            
            let year = 2026;
            const yearMatch = dateStr.match(/(\d{4})/);
            if (yearMatch) {
                year = parseInt(yearMatch[0]);
            }
            
            const eventDate = new Date(`${month} ${day}, ${year}`);
            if (!isNaN(eventDate)) {
                const deadlineDate = new Date(eventDate);
                deadlineDate.setDate(deadlineDate.getDate() - 1);
                const options = { month: 'long', day: 'numeric', year: 'numeric' };
                return deadlineDate.toLocaleDateString('en-US', options);
            }
        } else {
            const eventDate = new Date(dateOnly);
            if (!isNaN(eventDate)) {
                const deadlineDate = new Date(eventDate);
                deadlineDate.setDate(deadlineDate.getDate() - 1);
                const options = { month: 'long', day: 'numeric', year: 'numeric' };
                return deadlineDate.toLocaleDateString('en-US', options);
            }
        }
        
        return dateToBeHeld;
    };

    // Calculate actual document height based on content
    const calculateDocHeight = (doc) => {
        const authorsText = doc.authors?.length > 0 ? doc.authors.join(', ') : 'No author specified';
        const hasPresenter = doc.presenter && 
            doc.presenter.trim() !== '' && 
            doc.presenter !== 'Not specified' && 
            doc.presenter !== 'Not Specified' &&
            doc.presenter.toLowerCase() !== 'not specified';

        // Base height per line in pixels (for 11pt font)
        const LINE_HEIGHT = 18;
        const CHARS_PER_LINE = 90;
        
        // Calculate title line count
        const titleText = `${doc.title} by ${authorsText} - ${doc.category}`;
        const words = titleText.split(' ');
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
            // Handle long words (like scientific names)
            if (wordLength > CHARS_PER_LINE * 0.7) {
                const extraLines = Math.floor(wordLength / CHARS_PER_LINE);
                lineCount += extraLines;
            }
        }
        
        // Ensure minimum of 2 lines, maximum of 5
        lineCount = Math.max(2, Math.min(5, lineCount));
        
        // Calculate height: title lines + presenter line (if exists) + margins
        let height = (lineCount * LINE_HEIGHT) + 10; // 10px for margins
        
        if (hasPresenter) {
            height += 18; // Presenter line height
        }
        
        // Add buffer for scientific names or long author lists
        if (/[A-Z][a-z]+\s+[a-z]+|\([A-Z][a-z]+\.\)|[a-z]+\.?\s+[a-z]+/i.test(doc.title)) {
            height += 6;
        }
        if (doc.authors?.length > 5) {
            height += 4;
        }
        
        // Final height with reasonable bounds
        return Math.min(Math.max(height, 65), 140);
    };

    const buildFlatItems = () => {
        const items = []

        const allDocs = [];
        categoriesData.forEach(category => {
            category.docs.forEach(doc => {
                allDocs.push({
                    ...doc,
                    category: category.category
                });
            });
        });

        const categoryGroups = {};
        allDocs.forEach(doc => {
            if (!categoryGroups[doc.category]) {
                categoryGroups[doc.category] = [];
            }
            categoryGroups[doc.category].push(doc);
        });

        const sortedCategories = Object.keys(categoryGroups).sort();

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        const pptDeadline = calculatePPTDeadline(formData?.dateToBeHeld) || formData?.pptDeadline || 'the day before the event';

        // Add combined header+footer (Page 1)
        const combinedHeaderFooter = $({
            tag: 'div',
            att: { className: 'combined-header-footer' },
            style: {
                marginBottom: '30px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
            },
            child: [
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
                $({ tag: 'div', style: { height: '20px' } }),
                $({
                    tag: 'h2',
                    text: formattedDate,
                    style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' }
                }),
                $({ tag: 'div', style: { height: '20px' } }),
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
                $({
                    tag: 'div',
                    style: { fontSize: '12pt', margin: '0 0 5px 0', color: '#000' },
                    child: [
                        $({ tag: 'span', text: 'Dear ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: 'Sir/Ma\'am:', style: { fontWeight: 'bold' } })
                    ]
                }),
                $({ tag: 'div', style: { height: '20px' } }),
                $({
                    tag: 'h4',
                    text: 'Greetings!',
                    style: { fontSize: '12pt', fontWeight: 'normal', margin: '0 0 5px 0', color: '#000' }
                }),
                $({ tag: 'div', style: { height: '20px' } }),
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
                        $({ tag: 'span', text: 'We are pleased to inform you that the following research and extension papers were accepted for presentation in the ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: eventName, style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: ' which will be held on ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: formData?.dateToBeHeld || 'the scheduled date', style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: ' via ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: 'Zoom teleconference', style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: '.', style: { fontWeight: 'normal' } })
                    ]
                }),
                $({ tag: 'div', style: { height: '10px' } }),
                $({
                    tag: 'p',
                    style: {
                        fontSize: '12pt',
                        fontWeight: 'normal',
                        margin: '0 0 10px 0',
                        color: '#333',
                        lineHeight: '1.5'
                    },
                    child: [
                        $({ tag: 'span', text: 'For your reference, below are the Zoom meeting details for the ', style: { fontWeight: 'normal' } }),
                        $({ tag: 'span', text: eventName, style: { fontWeight: 'bold' } }),
                        $({ tag: 'span', text: ':', style: { fontWeight: 'normal' } })
                    ]
                }),
                $({ tag: 'div', style: { height: '10px' } }),
                $({
                    tag: 'div',
                    style: {
                        marginLeft: '20px',
                        marginBottom: '15px',
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
                            style: { fontSize: '12pt', margin: '0 0 5px 0', fontWeight: 'bold' },
                            child: [
                                $({ tag: 'span', text: 'Join Zoom Meeting', style: { fontWeight: 'bold' } })
                            ]
                        }),
                        $({
                            tag: 'p',
                            style: { fontSize: '11pt', margin: '5px 0', color: '#0066cc', wordBreak: 'break-all' },
                            child: [
                                $({
                                    tag: 'a',
                                    text: formData?.zoomLink || 'https://zoom.us/j/92157257818',
                                    att: {
                                        href: formData?.zoomLink || 'https://zoom.us/j/92157257818',
                                        target: '_blank',
                                        style: 'color: #0066cc !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;'
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
                            style: { fontSize: '11pt', margin: '3px 0' },
                            child: [
                                $({ tag: 'span', text: 'Meeting ID: ', style: { fontWeight: 'bold' } }),
                                $({ tag: 'span', text: formData?.meetingId || '921 5725 7818' })
                            ]
                        }),
                        $({
                            tag: 'p',
                            style: { fontSize: '11pt', margin: '3px 0' },
                            child: [
                                $({ tag: 'span', text: 'Passcode: ', style: { fontWeight: 'bold' } }),
                                $({ tag: 'span', text: formData?.passcode || 'capsurde' })
                            ]
                        })
                    ]
                }),
                $({ tag: 'div', style: { height: '10px' } }),
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
                                $({ tag: 'span', text: 'Kindly advise the research and extension presenters to submit their PowerPoint presentation ' }),
                                $({ tag: 'span', text: `on or before ${pptDeadline}`, style: { fontWeight: 'bold' } }),
                                $({ tag: 'span', text: ' via the Google Drive link ' }),
                                $({
                                    tag: 'a',
                                    text: formData?.driveLink || 'https://bit.ly/44thSymposiumPPTs',
                                    att: {
                                        href: formData?.driveLink || 'https://bit.ly/44thSymposiumPPTs',
                                        target: '_blank',
                                        style: 'color: #87CEEB !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;'
                                    },
                                    style: {
                                        color: '#87CEEB',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    }
                                }),
                                $({ tag: 'span', text: '.' })
                            ]
                        }),
                        $({ tag: 'p', style: { fontSize: '12pt', lineHeight: '1.5', marginBottom: '20px' }, text: 'Thank you.' }),
                        $({ tag: 'p', style: { fontSize: '12pt', lineHeight: '1.5', marginBottom: '30px' }, text: 'Very truly yours,' }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'block',
                                width: '100%',
                                marginBottom: '20px',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '30px',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    },
                                    child: [
                                        $({ 
                                            tag: 'p', 
                                            style: { 
                                                fontSize: '12pt', 
                                                fontWeight: 'bold', 
                                                marginBottom: '2px',
                                                marginTop: '0',
                                                textAlign: 'left'
                                            }, 
                                            text: 'STEPHANIE S. PIMENTEL, PhD' 
                                        }),
                                        $({ 
                                            tag: 'p', 
                                            style: { 
                                                fontSize: '11pt', 
                                                marginTop: '0',
                                                marginBottom: '0',
                                                textAlign: 'left'
                                            }, 
                                            text: 'University Research Director' 
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    },
                                    child: [
                                        $({ 
                                            tag: 'p', 
                                            style: { 
                                                fontSize: '12pt', 
                                                fontWeight: 'bold', 
                                                marginBottom: '2px',
                                                marginTop: '0',
                                                textAlign: 'left'
                                            }, 
                                            text: 'FRENCH A. DAMPOG, MBA' 
                                        }),
                                        $({ 
                                            tag: 'p', 
                                            style: { 
                                                fontSize: '11pt', 
                                                marginTop: '0',
                                                marginBottom: '0',
                                                textAlign: 'left'
                                            }, 
                                            text: 'University IPMO Director' 
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        // Use a more accurate height for the header
        items.push({
            type: 'combined-header-footer',
            height: 1150,
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
            height: 400,
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

            // Category header height
            items.push({
                type: 'category-header',
                categoryName: category,
                height: 45,
                element: $({
                    tag: 'h2',
                    att: { className: 'category-header' },
                    style: {
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        margin: '10px 0 8px 0',
                        padding: '3px 0',
                        borderBottom: '2px solid #000',
                        color: '#000',
                        textTransform: 'uppercase',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact'
                    },
                    text: category
                })
            });

            // Documents for this category with accurate height calculation
            docs.forEach((doc) => {
                const docHeight = calculateDocHeight(doc);
                
                items.push({
                    type: 'document',
                    categoryName: doc.category,
                    docNumber: docCounter,
                    height: docHeight,
                    element: renderDocument(doc, docCounter)
                });
                docCounter++;
            });
            
            // Add small spacer after category
            items.push({
                type: 'spacer',
                height: 10,
                element: $({ tag: 'div', style: { height: '10px' } })
            });
        });

        return items;
    }

    // ─── Pagination ───────────────────────────────────────────────────────────
    const paginateItems = (flatItems) => {
        const pages = []
        let current = []
        let usedHeight = 0
        
        // Reserve some space for padding
        const PADDING_BUFFER = 30;
        const maxHeight = USABLE_HEIGHT - PADDING_BUFFER;
        
        for (let i = 0; i < flatItems.length; i++) {
            const item = flatItems[i]
            
            // Handle page breaks
            if (item.type === 'page-break') {
                if (current.length > 0) {
                    pages.push([...current])
                    current = []
                    usedHeight = 0
                }
                continue
            }
            
            // Special handling for combined-header-footer (always on its own page)
            if (item.type === 'combined-header-footer') {
                if (current.length > 0) {
                    pages.push([...current])
                    current = []
                    usedHeight = 0
                }
                current.push(item)
                usedHeight += item.height
                pages.push([...current])
                current = []
                usedHeight = 0
                continue
            }
            
            // Special handling for noted-section (always on its own page)
            if (item.type === 'noted-section') {
                if (current.length > 0) {
                    pages.push([...current])
                    current = []
                    usedHeight = 0
                }
                current.push(item)
                usedHeight += item.height
                pages.push([...current])
                current = []
                usedHeight = 0
                continue
            }
            
            // Check if this item fits
            const wouldExceed = usedHeight + item.height > maxHeight
            
            if (wouldExceed && current.length > 0) {
                // Don't start a new page with just a spacer or category header without documents
                if (item.type === 'spacer') {
                    // Skip spacers at page boundaries
                    continue
                }
                if (item.type === 'category-header') {
                    // Check if there are documents after this header
                    let hasDocsAfter = false
                    let j = i + 1
                    while (j < flatItems.length && flatItems[j].type !== 'category-header') {
                        if (flatItems[j].type === 'document') {
                            hasDocsAfter = true
                            break
                        }
                        j++
                    }
                    if (!hasDocsAfter) {
                        // If no documents after, just push and continue
                        current.push(item)
                        usedHeight += item.height
                        continue
                    }
                }
                
                // Start new page
                pages.push([...current])
                current = []
                usedHeight = 0
                
                // If the item is a category header, we want to include it on the new page
                if (item.type === 'category-header') {
                    current.push(item)
                    usedHeight += item.height
                    continue
                }
            }
            
            // Add item to current page
            current.push(item)
            usedHeight += item.height
        }
        
        // Don't flush empty pages
        if (current.length > 0) {
            // Check if the last page only has a spacer or header without content
            const hasContent = current.some(item => 
                item.type === 'document' || 
                item.type === 'combined-header-footer' || 
                item.type === 'noted-section'
            )
            if (hasContent) {
                pages.push([...current])
            }
        }
        
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
                if (item.element) {
                    children.push(item.element)
                }
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
                            marginBottom: '20px',
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
                                    margin: '3px 0 5px 20px',
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
                        marginBottom: '15px',
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
                            margin: '3px 0 5px 20px',
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
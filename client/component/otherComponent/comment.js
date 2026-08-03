import { $ } from '../../lib/lib.js'

export const Print = ({ doc_title, review, category, campus, center, date, author, coauthor, presenter, paper_trail_no, total_word_count, all, getHandler, startPage = 1, globalTotalPages = null }) => {
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
            return $({
                tag: 'td',
                style: {
                    padding: '2mm 3mm',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                },
                elementHandler: getme
            })
        }

        const row = ({ leb1, leb2 }) => {
            return $({
                tag: 'tr',
                child: [
                    leb1,
                    leb2
                ]
            })
        }

        return $({
            tag: 'table',
            style: {
                width: '100%',
                marginTop: '3mm',
                marginBottom: '5mm',
                borderCollapse: 'collapse',
                fontSize: '10pt'
            },
            child: [
                row({
                    leb1: tdData({
                        data: '<b>Campus</b>',
                        width: '18%'
                    }),
                    leb2: tdData({
                        data: ': ' + (campus || 'N/A'),
                        width: '82%'
                    })
                }),
                row({
                    leb1: tdData({
                        data: '<b>Title</b>',
                        width: '18%'
                    }),
                    leb2: tdData({
                        data: ': ' + (doc_title || 'Untitled'),
                        width: '82%'
                    })
                }),
                row({
                    leb1: tdData({
                        data: '<b>Category</b>',
                        width: '18%'
                    }),
                    leb2: tdData({
                        data: ': ' + (category || 'Uncategorized'),
                        width: '82%'
                    })
                }),
                row({
                    leb1: tdData({
                        data: '<b>Author(s)</b>',
                        width: '18%'
                    }),
                    leb2: tdData({
                        data: ': ' + (author || 'Unknown'),
                        width: '82%'
                    })
                })
            ]
        })
    }

    const formatComment = (text) => {
        if (!text) return ''
        
        let cleanText = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
        
        return cleanText
    }

    const getCont = (el) => {
        getHandler(el)
        el.innerHTML = ''

        // Build content
        const detailsHTML = details().outerHTML || ''
        const detailsWithHr = detailsHTML + `
            <hr style="border: none; border-top: 1.5px solid #c0c0c0; margin: 4mm 0 6mm 0;">
        `

        let commentsHTML = ''

        if (review) {
            let hasComments = false

            const hasContent = (obj) => {
                if (!obj || typeof obj !== 'object') return false
                const fields = ['intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other']
                for (let field of fields) {
                    if (obj[field] && obj[field].toString().trim() !== '' && obj[field].toString().trim() !== 'N/A' && obj[field].toString().trim() !== 'n/a') {
                        return true
                    }
                }
                return false
            }

            const extractComments = (obj) => {
                const comments = []
                const fields = ['intro', 'abstract', 'objective', 'methodology', 'results', 'recommendation', 'literature', 'other']
                
                for (let field of fields) {
                    if (obj[field] && obj[field].toString().trim() !== '' && obj[field].toString().trim() !== 'N/A' && obj[field].toString().trim() !== 'n/a') {
                        const labelMap = {
                            'intro': 'Introduction',
                            'abstract': 'Abstract',
                            'objective': 'Objectives',
                            'methodology': 'Methodology',
                            'results': 'Results and Discussion',
                            'recommendation': 'Recommendation',
                            'literature': 'Literature',
                            'other': 'Other'
                        }
                        comments.push({
                            label: labelMap[field] || field.charAt(0).toUpperCase() + field.slice(1),
                            value: obj[field]
                        })
                    }
                }
                return comments
            }

            let allCommentsHTML = ''

            if (Array.isArray(review)) {
                review.forEach((val, index) => {
                    if (!val || typeof val !== 'object') return

                    let state = true
                    if (all) {
                        if (val.evalName && val.evalName.toUpperCase().includes("TECHNICAL")) {
                            state = false
                        }
                    }

                    if (state && hasContent(val)) {
                        hasComments = true
                        
                        const evaluatorName = val.evaluator_name || val.evalName || `Evaluator ${index + 1}`
                        
                        let commentHTML = `
                            <div class="evaluator-block" style="margin-bottom: 5mm; page-break-inside: avoid;">
                                <div class="evaluator-name" style="font-size: 12pt; font-weight: bold; color: #1a237e; margin-bottom: 2mm; border-bottom: 2px solid #1a237e; padding-bottom: 1mm;">
                                    ${evaluatorName}
                                </div>
                        `

                        const comments = extractComments(val)
                        if (comments.length > 0) {
                            comments.forEach(comment => {
                                const formattedValue = formatComment(comment.value)
                                const cleanValue = formattedValue.replace(/\n/g, '<br>')
                                
                                commentHTML += `
                                    <div class="comment-block" style="margin-bottom: 2mm;">
                                        <div class="comment-label" style="font-weight: bold; font-size: 10pt; color: #37474f; margin-bottom: 0.5mm;">${comment.label}:</div>
                                        <div class="comment-text" style="font-size: 10pt; line-height: 1.6; color: #263238; padding-left: 3mm; word-break: break-word; text-align: left;">
                                            ${cleanValue}
                                        </div>
                                    </div>
                                `
                            })
                        } else {
                            commentHTML += `
                                <div class="no-comments" style="padding: 2mm 3mm; color: #6c757d; font-style: italic; font-size: 10pt; text-align: center;">
                                    No comments provided.
                                </div>
                            `
                        }

                        commentHTML += `</div>`
                        allCommentsHTML += commentHTML
                    }
                })
            } else if (typeof review === 'object' && hasContent(review)) {
                hasComments = true
                const evaluatorName = review.evaluator_name || review.evalName || 'Evaluator'
                
                let commentHTML = `
                    <div class="evaluator-block" style="margin-bottom: 5mm; page-break-inside: avoid;">
                        <div class="evaluator-name" style="font-size: 12pt; font-weight: bold; color: #1a237e; margin-bottom: 2mm; border-bottom: 2px solid #1a237e; padding-bottom: 1mm;">
                            ${evaluatorName}
                        </div>
                `

                const comments = extractComments(review)
                if (comments.length > 0) {
                    comments.forEach(comment => {
                        const formattedValue = formatComment(comment.value)
                        const cleanValue = formattedValue.replace(/\n/g, '<br>')
                        
                        commentHTML += `
                            <div class="comment-block" style="margin-bottom: 2mm;">
                                <div class="comment-label" style="font-weight: bold; font-size: 10pt; color: #37474f; margin-bottom: 0.5mm;">${comment.label}:</div>
                                <div class="comment-text" style="font-size: 10pt; line-height: 1.6; color: #263238; padding-left: 3mm; word-break: break-word; text-align: left;">
                                    ${cleanValue}
                                </div>
                            </div>
                        `
                    })
                } else {
                    commentHTML += `
                        <div class="no-comments" style="padding: 2mm 3mm; color: #6c757d; font-style: italic; font-size: 10pt; text-align: center;">
                            No comments provided.
                        </div>
                    `
                }

                commentHTML += `</div>`
                allCommentsHTML = commentHTML
            }

            if (hasComments) {
                commentsHTML = allCommentsHTML
            } else {
                commentsHTML = `
                    <div style="text-align: center; padding: 20mm 10mm; color: #6c757d; font-size: 12pt;">
                        <div style="font-size: 48px; margin-bottom: 8mm;">📝</div>
                        <div style="font-weight: bold; font-size: 14pt; margin-bottom: 2mm;">No Comments Available</div>
                        <div style="font-size: 11pt; color: #868e96;">No evaluator comments have been recorded for this document.</div>
                    </div>
                `
            }
        } else {
            commentsHTML = `
                <div style="text-align: center; padding: 20mm 10mm; color: #6c757d; font-size: 12pt;">
                    <div style="font-size: 48px; margin-bottom: 8mm;">📄</div>
                    <div style="font-weight: bold; font-size: 14pt; margin-bottom: 2mm;">No Review Data</div>
                    <div style="font-size: 11pt; color: #868e96;">No review data available for this document.</div>
                </div>
            `
        }

        // Calculate available space for content
        const HEADER_HEIGHT_CM = 4;
        const FOOTER_HEIGHT_CM = 3.81; // 1.5 inches
        const PAGE_HEIGHT_CM = 29.7;
        const AVAILABLE_HEIGHT_CM = PAGE_HEIGHT_CM - HEADER_HEIGHT_CM - FOOTER_HEIGHT_CM;

        // More accurate height measurement
        const measureHeight = (html) => {
            const measureDiv = document.createElement('div')
            measureDiv.style.cssText = `
                position: absolute;
                visibility: hidden;
                width: 18cm;
                font-size: 10pt;
                font-family: 'Arial', 'Helvetica', sans-serif;
                line-height: 1.6;
                padding: 0;
                left: -9999px;
                top: 0;
                box-sizing: border-box;
                overflow: hidden;
            `
            measureDiv.innerHTML = `<div style="padding: 0;">${html}</div>`
            document.body.appendChild(measureDiv)
            const heightPx = measureDiv.offsetHeight || 0
            const heightCM = heightPx / 37.8
            document.body.removeChild(measureDiv)
            return heightCM
        }

        // Measure details section height (only for first page)
        const detailsHeightCM = measureHeight(detailsWithHr)
        const firstPageCommentsAvailable = AVAILABLE_HEIGHT_CM - detailsHeightCM
        const subsequentPageCommentsAvailable = AVAILABLE_HEIGHT_CM

        // Helper to split content by evaluator blocks
        const splitIntoEvaluatorBlocks = (html) => {
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = html
            const blocks = []
            const children = Array.from(tempDiv.childNodes)
            
            let currentBlock = ''
            for (let child of children) {
                const childHTML = child.outerHTML || child.textContent || ''
                currentBlock += childHTML
                // Check if this is a complete evaluator block
                if (childHTML.includes('evaluator-block') || 
                    (childHTML.includes('</div>') && childHTML.includes('evaluator-name'))) {
                    blocks.push(currentBlock)
                    currentBlock = ''
                }
            }
            if (currentBlock) {
                blocks.push(currentBlock)
            }
            return blocks
        }

        // Get evaluator blocks
        const evaluatorBlocks = splitIntoEvaluatorBlocks(commentsHTML)
        
        if (evaluatorBlocks.length === 0) {
            // Fallback: treat as single block
            evaluatorBlocks.push(commentsHTML)
        }

        // Paginate content
        const pages = []
        let currentPageContent = ''
        let currentHeightCM = 0
        let isFirstPage = true

        const getBlockHeight = (html) => {
            const testDiv = document.createElement('div')
            testDiv.style.cssText = `
                position: absolute;
                visibility: hidden;
                width: 18cm;
                font-size: 10pt;
                font-family: 'Arial', 'Helvetica', sans-serif;
                line-height: 1.6;
                padding: 0;
                left: -9999px;
                top: 0;
                box-sizing: border-box;
            `
            testDiv.innerHTML = html
            document.body.appendChild(testDiv)
            const height = testDiv.offsetHeight / 37.8
            document.body.removeChild(testDiv)
            return height
        }

        for (let block of evaluatorBlocks) {
            const blockHeight = getBlockHeight(block) || 0.5
            const maxAvailable = isFirstPage ? firstPageCommentsAvailable : subsequentPageCommentsAvailable

            // If this block alone is larger than the page, split it
            if (blockHeight > maxAvailable) {
                // Check if current page has content
                if (currentPageContent) {
                    pages.push(currentPageContent)
                    currentPageContent = ''
                    currentHeightCM = 0
                    isFirstPage = false
                }

                // Split the block into smaller pieces
                const tempBlockDiv = document.createElement('div')
                tempBlockDiv.innerHTML = block
                
                // Get individual comment blocks within the evaluator block
                const commentBlocks = []
                const blockChildren = Array.from(tempBlockDiv.childNodes)
                
                for (let child of blockChildren) {
                    const childHTML = child.outerHTML || child.textContent || ''
                    if (childHTML.trim()) {
                        commentBlocks.push(childHTML)
                    }
                }

                // Distribute comment blocks across pages
                let tempPageContent = ''
                let tempHeight = 0
                const tempMaxHeight = isFirstPage ? firstPageCommentsAvailable : subsequentPageCommentsAvailable

                for (let commentBlock of commentBlocks) {
                    const commentHeight = getBlockHeight(commentBlock) || 0.3
                    
                    // Check if adding this comment exceeds the page
                    if (tempHeight + commentHeight > tempMaxHeight && tempPageContent) {
                        // Finalize current page
                        pages.push(tempPageContent)
                        tempPageContent = commentBlock
                        tempHeight = commentHeight
                        isFirstPage = false
                    } else {
                        tempPageContent += commentBlock
                        tempHeight += commentHeight
                    }
                }

                // Add remaining content
                if (tempPageContent) {
                    if (tempHeight < tempMaxHeight * 0.3 && pages.length > 0) {
                        // Merge with previous page if too small
                        const lastIndex = pages.length - 1
                        pages[lastIndex] = pages[lastIndex] + tempPageContent
                    } else {
                        pages.push(tempPageContent)
                    }
                }
                
                currentPageContent = ''
                currentHeightCM = 0
                isFirstPage = false
            } else {
                // Regular block fits in current page or needs new page
                const maxHeight = isFirstPage ? firstPageCommentsAvailable : subsequentPageCommentsAvailable
                
                if (currentHeightCM + blockHeight > maxHeight && currentPageContent) {
                    // Save current page and start new one
                    pages.push(currentPageContent)
                    currentPageContent = block
                    currentHeightCM = blockHeight
                    isFirstPage = false
                } else {
                    currentPageContent += block
                    currentHeightCM += blockHeight
                }
            }
        }

        // Add remaining content
        if (currentPageContent) {
            const maxHeight = isFirstPage ? firstPageCommentsAvailable : subsequentPageCommentsAvailable
            if (currentHeightCM < maxHeight * 0.3 && pages.length > 0) {
                const lastIndex = pages.length - 1
                pages[lastIndex] = pages[lastIndex] + currentPageContent
            } else {
                pages.push(currentPageContent)
            }
        }

        // If no pages were created, use the original content
        if (pages.length === 0) {
            pages.push(commentsHTML)
        }

        // Use global total pages if provided
        const totalPages = globalTotalPages !== null ? globalTotalPages : pages.length;
        
        pages.forEach((pageContent, index) => {
            // ONLY include details on the FIRST page
            let fullContent;
            if (index === 0) {
                // First page: details + comments
                fullContent = detailsWithHr + pageContent;
            } else {
                // Subsequent pages: ONLY comments (no details)
                fullContent = pageContent;
            }
            
            const contentWithWrapper = `
                <div style="padding: 0; margin: 0; width: 100%;">
                    ${fullContent}
                </div>
            `;
            
            const globalPageNumber = startPage + index;
            
            // Create background image element
            const bgImg = $({
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
            });

            const bgDiv = $({
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
                child: [bgImg]
            });

            let pageNumEl = null;
            if (totalPages > 1) {
                pageNumEl = $({
                    tag: 'div',
                    att: { className: 'page-number' },
                    style: {
                        position: 'absolute',
                        bottom: '3.81cm',
                        right: '1.5cm',
                        fontSize: '10pt',
                        color: '#666',
                        zIndex: 3,
                        fontWeight: 'normal'
                    },
                    text: `Page ${globalPageNumber} of ${totalPages}`
                });
            }

            const contentInner = $({
                tag: 'div',
                att: { className: 'content-inner' },
                style: {
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                },
                html: contentWithWrapper
            });

            const contentDiv = $({
                tag: 'div',
                att: { className: 'page-content' },
                style: {
                    position: 'relative',
                    zIndex: 2,
                    padding: '4cm 1.5cm 3.81cm 1.5cm',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'transparent',
                    textAlign: 'justify',
                    overflow: 'hidden'
                },
                child: [contentInner, pageNumEl].filter(Boolean)
            });

            const pageElement = $({
                tag: 'div',
                att: { className: 'comment-page print-page' },
                style: {
                    position: 'relative',
                    width: '21cm',
                    height: '29.7cm',
                    margin: '0 auto',
                    backgroundColor: 'transparent',
                    pageBreakAfter: index < pages.length - 1 ? 'always' : 'avoid',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                },
                child: [bgDiv, contentDiv]
            });

            el.appendChild(pageElement);
        });
    }

    return $({
        tag: 'div',
        style: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        },
        att: {
            id: 'commentPDF'
        },
        elementHandler: getCont
    })
}
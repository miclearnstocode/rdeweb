import { $ } from '../../lib/lib.js'

export const Print = ({ doc_title, review, category, campus, center, date, author, coauthor, presenter, paper_trail_no, all, getHandler }) => {
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

    const createFullPage = (contentHTML, pageNumber, totalPages) => {
        const pageWrapper = document.createElement('div')
        pageWrapper.style.cssText = `
            position: relative;
            width: 210mm;
            height: 297mm;
            min-height: 297mm;
            max-height: 297mm;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0 auto;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border-radius: 3px;
            flex-shrink: 0;
        `

        const headerDiv = document.createElement('div')
        headerDiv.style.cssText = `
            width: 100%;
            height: 144px;
            flex-shrink: 0;
            background-color: #ffffff;
            position: relative;
            z-index: 1;
            overflow: hidden;
        `
        const headerImg = document.createElement('img')
        headerImg.src = '/client/images/header1.png'
        headerImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            display: block;
        `
        headerImg.onerror = function() {
            this.style.display = 'none'
            headerDiv.style.backgroundColor = '#f8f9fa'
            headerDiv.style.borderBottom = '2px solid #1a237e'
        }
        headerDiv.appendChild(headerImg)
        pageWrapper.appendChild(headerDiv)

        const contentDiv = document.createElement('div')
        contentDiv.style.cssText = `
            flex: 1;
            padding: 6mm 12mm 6mm 12mm;
            box-sizing: border-box;
            background-color: #ffffff;
            position: static;
            z-index: 1;
            overflow: visible;
        `
        contentDiv.innerHTML = contentHTML
        pageWrapper.appendChild(contentDiv)

        const footerDiv = document.createElement('div')
        footerDiv.style.cssText = `
            width: 100%;
            height: 144px;
            flex-shrink: 0;
            background-color: #ffffff;
            position: relative;
            z-index: 1;
            overflow: hidden;
        `
        const footerImg = document.createElement('img')
        footerImg.src = '/client/images/Footer.png'
        footerImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            display: block;
        `
        footerImg.onerror = function() {
            this.style.display = 'none'
            footerDiv.style.backgroundColor = '#f8f9fa'
            footerDiv.style.borderTop = '2px solid #1a237e'
        }
        footerDiv.appendChild(footerImg)
        pageWrapper.appendChild(footerDiv)

        if (totalPages > 1) {
            const pageNumDiv = document.createElement('div')
            pageNumDiv.style.cssText = `
                position: absolute;
                bottom: 8mm;
                right: 12mm;
                font-size: 9pt;
                color: #6c757d;
                z-index: 3;
                font-family: Arial, sans-serif;
                background: rgba(255,255,255,0.8);
                padding: 1mm 4mm;
                border-radius: 3px;
            `
            pageNumDiv.textContent = `Page ${pageNumber} of ${totalPages}`
            pageWrapper.appendChild(pageNumDiv)
        }

        return pageWrapper
    }

    // Helper function to count words in HTML content
    const countWords = (html) => {
        const temp = document.createElement('div')
        temp.innerHTML = html
        const text = temp.textContent || temp.innerText || ''
        return text.trim().split(/\s+/).length
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
                            <div style="margin-bottom: 5mm; page-break-inside: avoid;">
                                <div style="font-size: 12pt; font-weight: bold; color: #1a237e; margin-bottom: 2mm; border-bottom: 2px solid #1a237e; padding-bottom: 1mm;">
                                    ${evaluatorName}
                                </div>
                        `

                        const comments = extractComments(val)
                        if (comments.length > 0) {
                            comments.forEach(comment => {
                                const cleanValue = comment.value.toString().replace(/\n/g, '<br>')
                                commentHTML += `
                                    <div style="margin-bottom: 2mm;">
                                        <div style="font-weight: bold; font-size: 10pt; color: #37474f; margin-bottom: 0.5mm;">${comment.label}:</div>
                                        <div style="font-size: 10pt; line-height: 1.5; color: #263238; padding: 1mm 3mm; word-break: break-word; white-space: pre-wrap;">
                                            ${cleanValue}
                                        </div>
                                    </div>
                                `
                            })
                        } else {
                            commentHTML += `
                                <div style="padding: 2mm 3mm; color: #6c757d; font-style: italic; font-size: 10pt; text-align: center;">
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
                    <div style="margin-bottom: 5mm; page-break-inside: avoid;">
                        <div style="font-size: 12pt; font-weight: bold; color: #1a237e; margin-bottom: 2mm; border-bottom: 2px solid #1a237e; padding-bottom: 1mm;">
                            ${evaluatorName}
                        </div>
                `

                const comments = extractComments(review)
                if (comments.length > 0) {
                    comments.forEach(comment => {
                        const cleanValue = comment.value.toString().replace(/\n/g, '<br>')
                        commentHTML += `
                            <div style="margin-bottom: 2mm;">
                                <div style="font-weight: bold; font-size: 10pt; color: #37474f; margin-bottom: 0.5mm;">${comment.label}:</div>
                                <div style="font-size: 10pt; line-height: 1.5; color: #263238; padding: 1mm 3mm; word-break: break-word; white-space: pre-wrap;">
                                    ${cleanValue}
                                </div>
                            </div>
                        `
                    })
                } else {
                    commentHTML += `
                        <div style="padding: 2mm 3mm; color: #6c757d; font-style: italic; font-size: 10pt; text-align: center;">
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

        // Combine: Details only ONCE, then comments
        const fullContent = detailsWithHr + commentsHTML

        // Page break logic with footer protection
        const tempDiv = document.createElement('div')
        tempDiv.style.cssText = `
            position: absolute;
            visibility: hidden;
            width: 180mm;
            font-size: 11pt;
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.5;
            padding: 0;
            left: -9999px;
            top: 0;
        `
        tempDiv.innerHTML = fullContent
        document.body.appendChild(tempDiv)

        const children = Array.from(tempDiv.childNodes)
        
        // ===== FIXED: Footer protection =====
        // A4 = 297mm = ~1122px at 96dpi
        // Header = 144px, Footer = 144px
        // Footer protection zone = 144px (reserve space for footer)
        // Available content height = 1122 - 144 (header) - 144 (footer) - 60 (padding) = 774px
        // But we want to break BEFORE content hits the footer zone
        const maxHeightPx = 850  // Reduced to ensure content doesn't hit footer
        const minPageHeightPx = 400
        const pages = []
        let currentPageContent = ''
        let currentHeightPx = 0
        let currentWordCount = 0

        for (let child of children) {
            const clone = child.cloneNode(true)
            
            const measureDiv = document.createElement('div')
            measureDiv.style.cssText = `
                position: absolute;
                visibility: hidden;
                width: 180mm;
                font-size: 11pt;
                font-family: 'Arial', 'Helvetica', sans-serif;
                line-height: 1.5;
                padding: 0;
                left: -9999px;
                top: 0;
            `
            measureDiv.appendChild(clone)
            document.body.appendChild(measureDiv)
            
            const elementHeightPx = measureDiv.offsetHeight || 50
            const elementHTML = child.outerHTML || child.textContent || ''
            const wordCount = countWords(elementHTML)
            document.body.removeChild(measureDiv)
            
            // Check if adding this element would exceed max height OR exceed word limit (500 words per page)
            const wouldExceed = currentHeightPx + elementHeightPx > maxHeightPx
            const wouldExceedWords = currentWordCount + wordCount > 500
            
            // If element is too tall or exceeds word limit
            if ((elementHeightPx > maxHeightPx || wordCount > 500) && currentPageContent) {
                pages.push(currentPageContent)
                currentPageContent = child.outerHTML || child.textContent || ''
                currentHeightPx = elementHeightPx
                currentWordCount = wordCount
            } 
            else if ((wouldExceed || wouldExceedWords) && currentPageContent) {
                // Check if current content is substantial enough for its own page
                if (currentHeightPx >= minPageHeightPx && currentWordCount >= 100) {
                    // Current page has enough content - push it
                    pages.push(currentPageContent)
                    currentPageContent = child.outerHTML || child.textContent || ''
                    currentHeightPx = elementHeightPx
                    currentWordCount = wordCount
                } else {
                    // Current page doesn't have enough content - keep adding to it
                    currentPageContent += child.outerHTML || child.textContent || ''
                    currentHeightPx += elementHeightPx
                    currentWordCount += wordCount
                }
            } else {
                currentPageContent += child.outerHTML || child.textContent || ''
                currentHeightPx += elementHeightPx
                currentWordCount += wordCount
            }
        }

        if (currentPageContent) {
            // Check if the last page has very little content or words
            if ((currentHeightPx < minPageHeightPx || currentWordCount < 100) && pages.length > 0) {
                const lastPageIndex = pages.length - 1;
                pages[lastPageIndex] = pages[lastPageIndex] + currentPageContent;
            } else {
                pages.push(currentPageContent);
            }
        }

        document.body.removeChild(tempDiv)

        if (pages.length === 0) {
            pages.push(fullContent)
        }

        // Render each page as a separate A4 card
        pages.forEach((pageContent, index) => {
            const pageElement = createFullPage(pageContent, index + 1, pages.length)
            el.appendChild(pageElement)
        })
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
        externalStyle: '/client/component/otherComponent/style/comment.css',
        elementHandler: getCont
    })
}
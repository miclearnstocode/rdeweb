import { $, ConfirmationAlert, Waiting, DeleteConfirmModal } from '../../../lib/lib.js'
import { Error as ErrorComponent } from "../../../error.js";
import { Print } from "../../otherComponent/comment.js";
import { handleResubmit } from './resubmit.js';

// Helper function for Google Drive URL detection
const isGoogleDriveUrl = (url) => {
    if (!url) return false
    return url.includes('drive.google.com') ||
        url.includes('drive.google.com/file/d/')
}
// View Researches Modal
const openViewResearchesModal = () => {
    const modal = $({
        tag: 'div',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002,
            backdropFilter: 'blur(5px)'
        },
        elementHandler: (el) => { }
    })

    const modalContent = $({
        tag: 'div',
        style: {
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }
    })

    // Header
    const header = $({
        tag: 'div',
        style: {
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
        },
        child: [
            $({
                tag: 'h3',
                text: 'Research Documents',
                style: { color: '#fff', margin: 0, fontSize: '20px' }
            }),
            $({
                tag: 'i',
                att: { className: 'fas fa-times' },
                style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                event: {
                    type: 'click',
                    method: () => modal.remove()
                }
            })
        ]
    })

    // Search Bar
    const searchContainer = $({
        tag: 'div',
        style: {
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0
        }
    })

    const searchWrapper = $({
        tag: 'div',
        style: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '8px 16px',
            gap: '12px'
        }
    })

    const searchIcon = $({
        tag: 'i',
        att: { className: 'fas fa-search' },
        style: { color: '#666', fontSize: '16px' }
    })

    const searchInput = $({
        tag: 'input',
        att: {
            type: 'text',
            placeholder: 'Search by event name, campus/center, or file name...'
        },
        style: {
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '14px'
        },
        event: {
            type: 'input',
            method: (e) => {
                const searchTerm = e.target.value.toLowerCase()
                const rows = tableBody.querySelectorAll('tr')
                let hasVisible = false

                rows.forEach(row => {
                    const text = row.textContent.toLowerCase()
                    if (text.includes(searchTerm)) {
                        row.style.display = ''
                        hasVisible = true
                    } else {
                        row.style.display = 'none'
                    }
                })

                // Show/hide no results message
                const noResults = tableBody.querySelector('.no-results-row')
                if (!hasVisible && rows.length > 0) {
                    if (!noResults) {
                        const noResultsRow = $({
                            tag: 'tr',
                            att: { className: 'no-results-row' },
                            child: [
                                $({
                                    tag: 'td',
                                    att: { colSpan: 3 },
                                    style: { padding: '40px', textAlign: 'center', color: '#666' },
                                    child: [
                                        $({ tag: 'i', att: { className: 'fas fa-search' }, style: { fontSize: '32px', display: 'block', marginBottom: '12px' } }),
                                        $({ tag: 'div', text: 'No matching results found', style: { fontSize: '14px' } })
                                    ]
                                })
                            ]
                        })
                        tableBody.appendChild(noResultsRow)
                    }
                } else if (noResults) {
                    noResults.remove()
                }
            }
        }
    })

    searchWrapper.appendChild(searchIcon)
    searchWrapper.appendChild(searchInput)
    searchContainer.appendChild(searchWrapper)

    // Table Container
    const tableContainer = $({
        tag: 'div',
        style: {
            flex: 1,
            overflow: 'auto',
            padding: '0 24px 24px 24px'
        }
    })

    const table = $({
        tag: 'table',
        style: {
            width: '100%',
            borderCollapse: 'collapse'
        }
    })

    // Table Header
    const thead = $({ tag: 'thead', style: { position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 1 } })
    const headerRow = $({ tag: 'tr', style: { borderBottom: '2px solid #333' } })

    const columns = ['Event Name', 'Campus/Center', 'Files']
    columns.forEach(col => {
        headerRow.appendChild($({
            tag: 'th',
            text: col,
            style: {
                padding: '16px 12px',
                textAlign: 'left',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#1a1a1a'
            }
        }))
    })

    thead.appendChild(headerRow)
    table.appendChild(thead)

    // Table Body
    const tableBody = $({ tag: 'tbody' })
    table.appendChild(tableBody)

    // Empty state
    const emptyRow = $({ tag: 'tr' })
    const emptyCell = $({
        tag: 'td',
        att: { colSpan: 3 },
        style: { padding: '60px', textAlign: 'center', color: '#666' }
    })
    emptyCell.appendChild($({ tag: 'i', att: { className: 'fas fa-folder-open' }, style: { fontSize: '48px', display: 'block', marginBottom: '16px' } }))
    emptyCell.appendChild($({ tag: 'div', text: 'No research documents available', style: { fontSize: '16px', marginBottom: '8px' } }))
    emptyCell.appendChild($({ tag: 'div', text: 'Upload documents to view them here', style: { fontSize: '14px' } }))
    emptyRow.appendChild(emptyCell)
    tableBody.appendChild(emptyRow)

    tableContainer.appendChild(table)

    // Footer with close button
    const footer = $({
        tag: 'div',
        style: {
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0
        },
        child: [
            $({
                tag: 'button',
                text: 'Close',
                style: {
                    padding: '8px 24px',
                    backgroundColor: '#444',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                },
                event: {
                    type: 'click',
                    method: () => modal.remove()
                }
            })
        ]
    })

    modalContent.appendChild(header)
    modalContent.appendChild(searchContainer)
    modalContent.appendChild(tableContainer)
    modalContent.appendChild(footer)
    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // Function to add data to table (call this when you have data)
    window.addResearchToViewModal = (eventName, campus, files) => {
        // Remove empty state if exists
        const emptyState = tableBody.querySelector('.empty-state-row')
        if (emptyState) emptyState.remove()

        // Check if event group already exists
        let existingGroup = null
        const rows = tableBody.querySelectorAll('tr')
        for (let row of rows) {
            if (row.getAttribute('data-event') === eventName && row.getAttribute('data-campus') === campus) {
                existingGroup = row
                break
            }
        }

        if (existingGroup) {
            // Add file to existing group
            const filesCell = existingGroup.querySelector('.files-cell')
            if (filesCell) {
                const fileTag = createFileTag(files)
                filesCell.appendChild(fileTag)
            }
        } else {
            // Create new row
            const row = $({
                tag: 'tr',
                att: {
                    'data-event': eventName,
                    'data-campus': campus
                },
                style: { borderBottom: '1px solid rgba(255,255,255,0.05)' }
            })

            // Event Name cell
            const eventCell = $({
                tag: 'td',
                text: eventName,
                style: {
                    padding: '16px 12px',
                    color: '#e0e0e0',
                    fontSize: '14px',
                    verticalAlign: 'top'
                }
            })

            // Campus/Center cell
            const campusCell = $({
                tag: 'td',
                text: campus,
                style: {
                    padding: '16px 12px',
                    color: '#e0e0e0',
                    fontSize: '14px',
                    verticalAlign: 'top'
                }
            })

            // Files cell
            const filesCell = $({
                tag: 'td',
                att: { className: 'files-cell' },
                style: {
                    padding: '16px 12px',
                    verticalAlign: 'top'
                }
            })

            const fileTag = createFileTag(files)
            filesCell.appendChild(fileTag)

            row.appendChild(eventCell)
            row.appendChild(campusCell)
            row.appendChild(filesCell)
            tableBody.appendChild(row)
        }
    }

    // Helper function to create file tag
    const createFileTag = (fileInfo) => {
        const fileName = typeof fileInfo === 'string' ? fileInfo : fileInfo.name
        const isGoogleDrive = fileName.includes('drive.google.com')

        const tag = $({
            tag: 'div',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2a2a2a',
                padding: '6px 12px',
                borderRadius: '6px',
                margin: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            event: {
                type: 'click',
                method: () => {
                    if (isGoogleDrive) {
                        window.open(fileName, '_blank')
                    } else {
                        alert(`View file: ${fileName}`)
                        // Add your file viewing logic here
                    }
                }
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: isGoogleDrive ? 'fab fa-google-drive' : 'fas fa-file-pdf' },
                    style: { color: isGoogleDrive ? '#0F9D58' : '#f44336', fontSize: '14px' }
                }),
                $({
                    tag: 'span',
                    text: typeof fileInfo === 'string' ? fileInfo.split('/').pop() : fileInfo.name,
                    style: { color: '#fff', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                })
            ]
        })

        return tag
    }
}

// Modern Document Management Component
export const Research = () => {
    let mainContainer
    let documentsTable
    let uploadModal
    let formData = {
        eventName: '',
        title: '',
        category: '',
        presenter: '',
        author: '',
        coAuthors: [],
        researchFile: null,
        programFile: null,
        endorsementFile: null
    }

    // Center categories mapping
    const centerCategoryMapping = {
        "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
        "Social Science Research & Development Center (SSRDC)": ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
        "Coconut Research and Development Center (Coco RDC)": ["Natural / Biological"],
        "Extension (Extension)": ["Extension"]
    }

    // Build reverse mapping
    const categoryToCenters = {}
    Object.entries(centerCategoryMapping).forEach(([center, categories]) => {
        categories.forEach(category => {
            if (!categoryToCenters[category]) categoryToCenters[category] = []
            categoryToCenters[category].push(center)
        })
    })

    // Categories list
    const categories = [
        "Social Science", "Natural / Biological", "Food", "Development",
        "Extension", "Agricultural Machinery", "Industrial", "Engineering", "Information Technology"
    ]

    // Status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#FF9800', text: 'Pending', icon: 'fa-clock' },
            approved: { bg: '#4CAF50', text: 'Approved', icon: 'fa-check-circle' },
            rejected: { bg: '#f44336', text: 'Rejected', icon: 'fa-times-circle' },
            review: { bg: '#2196F3', text: 'Under Review', icon: 'fa-eye' }
        }
        const config = styles[status] || styles.pending

        return $({
            tag: 'span',
            style: {
                backgroundColor: config.bg,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            },
            child: [
                $({ tag: 'i', att: { className: `fas ${config.icon}` }, style: { fontSize: '11px' } }),
                $({ tag: 'span', text: config.text })
            ]
        })
    }

    const createActionButtons = (rowData) => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
            }
        })

        // View Comments button (replacing View button)
        const viewCommentsBtn = $({
            tag: 'button',
            att: { className: 'action-btn view-comments-btn', title: 'View Comments' },
            style: {
                background: '#4caf50',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-comment-dots' }, style: { color: 'white', fontSize: '14px' } }),
                $({ tag: 'span', text: 'Comments', style: { marginLeft: '4px', fontSize: '12px', color: 'white' } })
            ],
            event: {
                type: 'click',
                method: () => viewComments(rowData)
            }
        })

        // Edit button
        const editBtn = $({
            tag: 'button',
            att: { className: 'action-btn edit-btn', title: 'Edit Document' },
            style: {
                background: '#FF9800',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-edit' }, style: { color: 'white', fontSize: '14px' } })
            ],
            event: {
                type: 'click',
                method: () => editDocument(rowData)
            }
        })

        // Delete button
        const deleteBtn = $({
            tag: 'button',
            att: { className: 'action-btn delete-btn', title: 'Delete Document' },
            style: {
                background: '#f44336',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-trash-alt' }, style: { color: 'white', fontSize: '14px' } })
            ],
            event: {
                type: 'click',
                method: () => deleteDocument(rowData)
            }
        })

        container.appendChild(viewCommentsBtn)
        container.appendChild(editBtn)
        container.appendChild(deleteBtn)

        return container
    }

    // View Comments Modal with Print functionality
    const viewComments = (doc) => {
        let commentsModal;
        let commentsBody;

        // Create modal
        const modal = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(4px)'
            },
            elementHandler: (el) => { commentsModal = el; }
        });

        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }
        });

        // Header
        const header = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1e1e1e'
            },
            child: [
                $({
                    tag: 'div',
                    child: [
                        $({ tag: 'h3', text: `Comments for: ${doc.title}`, style: { color: '#fff', margin: 0, fontSize: '18px', marginBottom: '8px' } }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', gap: '16px', fontSize: '12px', color: '#888' },
                            child: [
                                $({ tag: 'span', text: `Author: ${doc.author}` }),
                                $({ tag: 'span', text: `Event: ${doc.eventName}` }),
                                $({ tag: 'span', text: `Status: ${doc.status || 'Pending'}` })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'i',
                    att: { className: 'fas fa-times' },
                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                    event: {
                        type: 'click',
                        method: () => modal.remove()
                    }
                })
            ]
        });

        // Comments Body Container
        const commentsContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                overflow: 'auto',
                padding: '20px'
            },
            elementHandler: (el) => { commentsBody = el; }
        });

        // Show loading state
        commentsContainer.appendChild($({
            tag: 'div',
            style: { textAlign: 'center', padding: '40px', color: '#888' },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '24px', marginBottom: '12px', display: 'block' } }),
                $({ tag: 'div', text: 'Loading comments...' })
            ]
        }));

        // Footer with Print and Close buttons
        const footer = $({
            tag: 'div',
            style: {
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
            },
            child: [
                $({
                    tag: 'button',
                    text: 'Print Comments',
                    style: {
                        padding: '8px 20px',
                        backgroundColor: '#2196F3',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-print' }, style: { fontSize: '14px' } }),
                        $({ tag: 'span', text: 'Print' })
                    ],
                    event: {
                        type: 'click',
                        method: () => printCommentsWithComponent(doc)
                    }
                }),
                $({
                    tag: 'button',
                    text: 'Close',
                    style: {
                        padding: '8px 24px',
                        backgroundColor: '#444',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer'
                    },
                    event: {
                        type: 'click',
                        method: () => modal.remove()
                    }
                })
            ]
        });

        modalContent.appendChild(header);
        modalContent.appendChild(commentsContainer);
        modalContent.appendChild(footer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Load comments from API
        const loadComments = async () => {
            try {
                const form = new FormData();
                form.append('commentRequest', 'true');
                form.append('docId', doc.id);

                const response = await fetch('/uploadResearchFile', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    displayComments(data, doc);
                } else {
                    throw new Error('Failed to load comments');
                }
            } catch (error) {
                console.error('Error loading comments:', error);
                commentsBody.innerHTML = '';
                commentsBody.appendChild($({
                    tag: 'div',
                    style: { textAlign: 'center', padding: '40px', color: '#f44336' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '32px', marginBottom: '12px', display: 'block' } }),
                        $({ tag: 'div', text: 'Error loading comments: ' + error.message })
                    ]
                }));
            }
        };

        // Display comments
        const displayComments = (commentsData, docInfo) => {
            commentsBody.innerHTML = '';

            if (!commentsData || commentsData.length === 0) {
                commentsBody.appendChild($({
                    tag: 'div',
                    style: { textAlign: 'center', padding: '40px', color: '#888' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-comments' }, style: { fontSize: '32px', marginBottom: '12px', display: 'block' } }),
                        $({ tag: 'div', text: 'No comments available for this document' })
                    ]
                }));
                return;
            }

            // Create comment cards
            commentsData.forEach(comment => {
                const commentCard = createCommentCard(comment);
                commentsBody.appendChild(commentCard);
            });
        };

        // Create individual comment card
        const createCommentCard = (comment) => {
            const card = $({
                tag: 'div',
                style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    borderLeft: `4px solid ${comment.evalName ? '#2196F3' : '#FF9800'}`
                }
            });

            // Evaluator info
            const evaluatorInfo = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', gap: '8px' },
                        child: [
                            $({ tag: 'i', att: { className: 'fas fa-user-circle' }, style: { color: '#2196F3', fontSize: '16px' } }),
                            $({ tag: 'span', text: comment.evalName || 'Evaluator', style: { color: '#fff', fontWeight: '500' } })
                        ]
                    }),
                    comment.date ? $({
                        tag: 'span',
                        text: new Date(comment.date).toLocaleDateString(),
                        style: { color: '#888', fontSize: '12px' }
                    }) : null
                ]
            });

            card.appendChild(evaluatorInfo);

            // Comment sections
            const sections = [
                { title: 'Title', content: comment.title, icon: 'fa-heading' },
                { title: 'Introduction', content: comment.intro, icon: 'fa-book-open' },
                { title: 'Abstract', content: comment.abstract, icon: 'fa-paragraph' },
                { title: 'Objective', content: comment.objective, icon: 'fa-bullseye' },
                { title: 'Methodology', content: comment.methodology, icon: 'fa-flask' },
                { title: 'Results and Discussion', content: comment.results, icon: 'fa-chart-line' },
                { title: 'Recommendation and Conclusion', content: comment.recommendation, icon: 'fa-lightbulb' },
                { title: 'Literature', content: comment.literature, icon: 'fa-book' },
                { title: 'Other Comments', content: comment.other, icon: 'fa-comment' }
            ];

            sections.forEach(section => {
                if (section.content && section.content.trim() !== '') {
                    const sectionEl = $({
                        tag: 'div',
                        style: { marginBottom: '12px' },
                        child: [
                            $({
                                tag: 'div',
                                style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
                                child: [
                                    $({ tag: 'i', att: { className: `fas ${section.icon}` }, style: { color: '#FF9800', fontSize: '12px' } }),
                                    $({ tag: 'span', text: section.title, style: { color: '#FF9800', fontSize: '13px', fontWeight: '500' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: { color: '#ccc', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
                                text: section.content
                            })
                        ]
                    });
                    card.appendChild(sectionEl);
                }
            });

            return card;
        };

        // Print comments using the Print component
        const printCommentsWithComponent = async (docInfo) => {
            try {
                const form = new FormData();
                form.append('commentRequest', 'true');
                form.append('docId', docInfo.id);

                const response = await fetch('/uploadResearchFile', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const commentsData = await response.json();

                    if (commentsData && commentsData.length > 0) {
                        // For each comment, create a Print component
                        commentsData.forEach(comment => {
                            const printComponent = Print({
                                title: docInfo.title,
                                campus: comment.campus || docInfo.campus || 'Not specified',
                                author: docInfo.author,
                                category: docInfo.category,
                                date: comment.date ? new Date(comment.date).toLocaleDateString() : new Date().toLocaleDateString(),
                                review: comment,
                                getHandler: (el) => {
                                    // This will create the print content
                                    // The Print component handles the rendering
                                }
                            });

                            // Create a temporary container for printing
                            const printContainer = $({
                                tag: 'div',
                                style: { display: 'none' },
                                child: [printComponent]
                            });
                            document.body.appendChild(printContainer);

                            // Get the print content
                            const printContent = printContainer.querySelector('#commentPDF') || printContainer;
                            const printWindow = window.open('', '_blank', 'width=800,height=600,toolbar=yes,scrollbars=yes');
                            printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Review Comments - ${docInfo.title}</title>
                                    <link rel="stylesheet" href="/client/component/otherComponent/style/review.css">
                                    <style>
                                        body {
                                            font-family: 'Segoe UI', Arial, sans-serif;
                                            margin: 40px;
                                            background: white;
                                            color: #333;
                                        }
                                        .print-header {
                                            text-align: center;
                                            margin-bottom: 30px;
                                            padding-bottom: 20px;
                                            border-bottom: 2px solid #333;
                                        }
                                        @media print {
                                            body {
                                                margin: 20px;
                                            }
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="print-header">
                                        <h1>Review Comments</h1>
                                        <p><strong>Document:</strong> ${docInfo.title}</p>
                                        <p><strong>Author:</strong> ${docInfo.author} | <strong>Event:</strong> ${docInfo.eventName}</p>
                                    </div>
                            `);
                            printWindow.document.write(printContent.innerHTML);
                            printWindow.document.write('</body></html>');
                            printWindow.document.close();
                            printWindow.print();
                            printWindow.close();

                            // Remove temporary container
                            printContainer.remove();

                            // Only print one window (break after first comment)
                            // If you want all comments in one print, you'd need to combine them
                            return;
                        });
                    } else {
                        alert('No comments available to print');
                    }
                } else {
                    alert('Failed to load comments for printing');
                }
            } catch (error) {
                console.error('Error printing comments:', error);
                alert('Error printing comments: ' + error.message);
            }
        };

        // Load comments
        loadComments();
    };

    // Create table row
    const createTableRow = (doc) => {
        const row = $({ tag: 'tr', style: { borderBottom: '1px solid rgba(255,255,255,0.1)' } });

        // Determine status and ensure it's properly formatted
        let status = doc.status;
        if (!status || status === 'NULL' || status === 'null') {
            status = 'pending';
        }

        // Handle file display with proper icons for Google Drive files
        const getFileIcon = (fileUrl, fileType = 'research') => {
            if (!fileUrl || fileUrl === '—') return '—';
            if (fileUrl.includes('drive.google.com')) {
                return $({
                    tag: 'i',
                    att: { className: 'fab fa-google-drive' },
                    style: { color: '#0F9D58', fontSize: '18px', cursor: 'pointer' },
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation();
                            viewFileInModal(fileUrl, fileType);
                        }
                    }
                });
            }
            return $({
                tag: 'i',
                att: { className: 'fas fa-file-pdf' },
                style: { color: '#f44336', fontSize: '18px', cursor: 'pointer' },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation();
                        viewFileInModal(fileUrl, fileType);
                    }
                }
            });
        };

        const researchFileDisplay = doc.researchFile && doc.researchFile !== '—' ? getFileIcon(doc.researchFile) : '—';
        const programFileDisplay = doc.programFile && doc.programFile !== '—' ? getFileIcon(doc.programFile) : '—';
        const endorsementFileDisplay = doc.endorsementFile && doc.endorsementFile !== '—' ? getFileIcon(doc.endorsementFile) : '—';

        const cells = [
            doc.eventName || '—',
            getStatusBadge(status),
            doc.title || '—',
            doc.category || '—',
            doc.presenter || '—',
            doc.author || '—',
            (doc.coAuthors || []).join(', ') || '—',
            researchFileDisplay,
            programFileDisplay,
            endorsementFileDisplay,
            createActionButtons(doc)
        ];

        cells.forEach((content, index) => {
            const td = $({
                tag: 'td',
                style: {
                    padding: '16px 12px',
                    color: '#e0e0e0',
                    fontSize: '14px',
                    verticalAlign: 'middle'
                }
            });

            if (typeof content === 'object' && content.tagName) {
                td.appendChild(content);
            } else {
                td.innerText = content;
            }

            row.appendChild(td);
        });

        return row;
    };
    // View file in modal (for research, program, endorsement files)
    const viewFileInModal = (fileUrl, fileType = 'research') => {
        // Determine file type display name
        const typeNames = {
            research: 'Research Document',
            program: 'Program File',
            endorsement: 'Endorsement Letter'
        };
        const displayName = typeNames[fileType] || 'Document';

        // Create file viewer based on file type
        const fileViewer = () => {
            if (fileUrl.includes('drive.google.com')) {
                // Google Drive file - extract file ID for embed
                let embedUrl = fileUrl;
                if (fileUrl.includes('/file/d/')) {
                    const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (fileIdMatch && fileIdMatch[1]) {
                        embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                    }
                }

                return $({
                    tag: 'iframe',
                    att: {
                        src: embedUrl,
                        title: displayName
                    },
                    style: {
                        width: '100%',
                        height: '500px',
                        border: 'none',
                        borderRadius: '8px'
                    }
                });
            } else {
                // Local file
                return $({
                    tag: 'object',
                    att: {
                        data: fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl,
                        type: 'application/pdf'
                    },
                    style: {
                        width: '100%',
                        height: '500px',
                        border: 'none',
                        borderRadius: '8px'
                    }
                });
            }
        };

        const modal = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(4px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#1e1e1e',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '1200px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    },
                    child: [
                        // Header
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#1e1e1e'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    child: [
                                        $({ tag: 'h3', text: displayName, style: { color: '#fff', margin: 0, fontSize: '18px' } }),
                                        $({
                                            tag: 'div',
                                            style: { fontSize: '12px', color: '#888', marginTop: '4px' },
                                            text: fileUrl.split('/').pop() || 'Document'
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'i',
                                    att: { className: 'fas fa-times' },
                                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                                    event: {
                                        type: 'click',
                                        method: () => modal.remove()
                                    }
                                })
                            ]
                        }),
                        // Content
                        $({
                            tag: 'div',
                            style: { padding: '20px', flex: 1, overflow: 'auto' },
                            child: [fileViewer()]
                        }),
                        // Footer
                        $({
                            tag: 'div',
                            style: {
                                padding: '16px 24px',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Close',
                                    style: {
                                        padding: '8px 24px',
                                        backgroundColor: '#444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => modal.remove()
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Open in New Tab',
                                    style: {
                                        padding: '8px 24px',
                                        backgroundColor: '#2196F3',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => window.open(fileUrl, '_blank')
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        document.body.appendChild(modal);
    };
    // View document modal
    const viewDocument = (doc) => {
        // Create file viewer based on file type
        const fileViewer = () => {
            if (doc.drive_view_url) {
                // Google Drive file
                return $({
                    tag: 'iframe',
                    att: {
                        src: doc.drive_view_url,
                        title: 'Document Viewer'
                    },
                    style: {
                        width: '100%',
                        height: '500px',
                        border: 'none',
                        borderRadius: '8px'
                    }
                });
            } else if (doc.researchFile && doc.researchFile !== '—') {
                // Local file
                return $({
                    tag: 'object',
                    att: {
                        data: '/' + doc.researchFile,
                        type: 'application/pdf'
                    },
                    style: {
                        width: '100%',
                        height: '500px',
                        border: 'none',
                        borderRadius: '8px'
                    }
                });
            } else {
                return $({
                    tag: 'div',
                    text: 'No file available',
                    style: { textAlign: 'center', padding: '40px', color: '#999' }
                });
            }
        };

        const modal = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(4px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#1e1e1e',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '1200px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    },
                    child: [
                        // Header
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#1e1e1e'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    child: [
                                        $({ tag: 'h3', text: doc.title, style: { color: '#fff', margin: 0, fontSize: '18px', marginBottom: '8px' } }),
                                        $({
                                            tag: 'div',
                                            style: { display: 'flex', gap: '16px', fontSize: '12px', color: '#888' },
                                            child: [
                                                $({ tag: 'span', text: `Author: ${doc.author}` }),
                                                $({ tag: 'span', text: `Event: ${doc.eventName}` }),
                                                $({ tag: 'span', text: `Status: ${doc.status || 'Pending'}` })
                                            ]
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'i',
                                    att: { className: 'fas fa-times' },
                                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                                    event: {
                                        type: 'click',
                                        method: () => modal.remove()
                                    }
                                })
                            ]
                        }),
                        // Content
                        $({
                            tag: 'div',
                            style: { padding: '20px', flex: 1, overflow: 'auto' },
                            child: [fileViewer()]
                        }),
                        // Footer
                        $({
                            tag: 'div',
                            style: {
                                padding: '16px 24px',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Close',
                                    style: {
                                        padding: '8px 24px',
                                        backgroundColor: '#444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => modal.remove()
                                    }
                                }),
                                doc.drive_view_url ? $({
                                    tag: 'button',
                                    text: 'Open in New Tab',
                                    style: {
                                        padding: '8px 24px',
                                        backgroundColor: '#2196F3',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => window.open(doc.drive_view_url, '_blank')
                                    }
                                }) : null
                            ]
                        })
                    ]
                })
            ]
        });

        document.body.appendChild(modal);
    };

    // Edit document
    const editDocument = (doc) => {
        // Pre-fill form data
        formData = {
            eventName: doc.eventName || '',
            title: doc.title || '',
            category: doc.category || '',
            presenter: doc.presenter || '',
            author: doc.author || '',
            coAuthors: doc.coAuthors || [],
            researchFile: null,
            programFile: null,
            endorsementFile: null
        }

        // Open modal with pre-filled data
        openUploadModal(true, doc)
    }

    // Delete document
    const deleteDocument = (doc) => {
        DeleteConfirmModal('Delete Document', `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`).then(async (confirmed) => {
            if (confirmed) {
                try {
                    // Show loading indicator
                    let loading = Waiting();
                    document.body.appendChild(loading);

                    const form = new FormData();
                    form.append('deleteEndorsement', 'true');
                    form.append('docId', doc.endorsement_id || doc.id);

                    const response = await fetch('/uploadResearchFile', {
                        method: 'POST',
                        body: form
                    });

                    const result = await response.json();

                    // Remove loading indicator
                    if (loading && loading.remove) {
                        loading.remove();
                    }

                    if (result.status) {
                        // Remove from table
                        const rows = documentsTable.querySelectorAll('tr');
                        for (let i = 1; i < rows.length; i++) {
                            if (rows[i].cells[2]?.innerText === doc.title) {
                                rows[i].remove();
                                break;
                            }
                        }

                        // Update stats after deletion
                        const remainingRows = documentsTable.querySelectorAll('tbody tr:not(.empty-state-row)');
                        let total = remainingRows.length;
                        let pending = 0;
                        let approved = 0;
                        let rejected = 0;

                        remainingRows.forEach(row => {
                            const statusCell = row.cells[1];
                            if (statusCell) {
                                const statusText = statusCell.innerText.toLowerCase();
                                if (statusText.includes('pending')) pending++;
                                else if (statusText.includes('approved')) approved++;
                                else if (statusText.includes('rejected')) rejected++;
                            }
                        });

                        updateStatsFromData(total, pending, approved, rejected);

                        // Show success message
                        document.body.appendChild(ConfirmationAlert(result.message, () => {
                            // Optional: refresh the list
                            // loadDocuments();
                        }));
                    } else {
                        alert('Failed to delete: ' + result.message);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('Error deleting document: ' + error.message);
                }
            }
        });
    };

    // Create modal
    const createModal = (title, content) => {
        return $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(4px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#1e1e1e',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            },
                            child: [
                                $({ tag: 'h3', text: title, style: { color: '#fff', margin: 0, fontSize: '20px' } }),
                                $({
                                    tag: 'i',
                                    att: { className: 'fas fa-times' },
                                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            const modal = document.querySelector('.modal-container')
                                            if (modal) modal.remove()
                                        }
                                    }
                                })
                            ]
                        }),
                        $({ tag: 'div', att: { className: 'modal-content' }, html: content })
                    ]
                })
            ]
        })
    }

    // File upload input component
    const FileUploadField = ({ label, fieldName, accept = '.pdf,application/pdf' }) => {
        let fileInput, fileLabel, fileNameDisplay

        const container = $({
            tag: 'div',
            style: { marginBottom: '20px' }
        })

        const labelEl = $({
            tag: 'label',
            text: label,
            style: {
                display: 'block',
                color: '#bbb',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
            }
        })

        const uploadArea = $({
            tag: 'div',
            style: {
                border: '2px dashed #444',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(255,255,255,0.05)'
            },
            event: {
                type: 'click',
                method: () => fileInput.click()
            }
        })

        fileNameDisplay = $({
            tag: 'div',
            style: { marginTop: '8px', fontSize: '12px', color: '#888' }
        })

        fileInput = $({
            tag: 'input',
            att: { type: 'file', accept, style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const file = e.target.files[0]
                    if (file) {
                        if (file.type !== 'application/pdf') {
                            alert('Please select a PDF file')
                            fileInput.value = ''
                            return
                        }
                        fileNameDisplay.innerText = `Selected: ${file.name}`
                        fileNameDisplay.style.color = '#4caf50'
                        formData[fieldName] = file
                    } else {
                        fileNameDisplay.innerText = ''
                        formData[fieldName] = null
                    }
                }
            }
        })

        uploadArea.appendChild($({
            tag: 'i',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '32px', color: '#666', marginBottom: '8px', display: 'block' }
        }))
        uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#888', fontSize: '14px' } }))
        uploadArea.appendChild($({ tag: 'div', text: '(PDF only)', style: { color: '#666', fontSize: '12px', marginTop: '4px' } }))

        container.appendChild(labelEl)
        container.appendChild(uploadArea)
        container.appendChild(fileNameDisplay)
        container.appendChild(fileInput)

        return container
    }

    // Open upload modal
    const openUploadModal = (isEdit = false, editData = null) => {
        let titleInput, categorySelect, centerSelect, authorInput, presenterInput, coAuthorInput, coAuthorList
        let eventSelect

        const modal = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10001,
                backdropFilter: 'blur(5px)'
            },
            elementHandler: (el) => { uploadModal = el }
        })

        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }
        })

        // Header
        const header = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: '#1a1a1a',
                zIndex: 1
            },
            child: [
                $({ tag: 'h3', text: isEdit ? 'Edit Entry' : 'Submit New Entry', style: { color: '#fff', margin: 0, fontSize: '20px' } }),
                $({
                    tag: 'i',
                    att: { className: 'fas fa-times' },
                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                    event: {
                        type: 'click',
                        method: () => modal.remove()
                    }
                })
            ]
        })

        // Form body
        const formBody = $({
            tag: 'div',
            style: { padding: '24px' }
        })

        // Two column layout for form fields
        const twoColumnLayout = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }
        })

        // Event selection
        const eventField = $({ tag: 'div', style: { marginBottom: '20px' } })
        eventField.appendChild($({ tag: 'label', text: 'Event Name *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        eventSelect = $({
            tag: 'select',
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'change',
                method: (e) => {
                    if (e && e.target) {
                        formData.eventName = e.target.value
                    }
                }
            },
            elementHandler: async (el) => {
                // Check if el exists before using it
                if (!el) return;

                // Clear existing options
                el.innerHTML = '';

                // Add default option
                const defaultOption = $({
                    tag: 'option',
                    text: '-- Select Event Name --',
                    att: {
                        disabled: true,
                        selected: true,
                        value: ''
                    }
                });
                el.appendChild(defaultOption);

                const form = new FormData();
                form.append('getEvent', 'true');

                try {
                    const response = await fetch('/eventRequest', {
                        method: 'POST',
                        body: form
                    });

                    if (response.ok) {
                        const data = await response.json();
                        data.forEach(val => {
                            el.appendChild($({
                                tag: 'option',
                                text: val.name,
                                style: {
                                    backgroundColor: '#2a2a2a',
                                    fontSize: '14px'
                                },
                                att: {
                                    id: val.id,
                                    value: val.name
                                }
                            }));
                        });
                    } else {
                        console.error('Failed to fetch events:', response.status);
                    }
                } catch (error) {
                    console.error('Error fetching events:', error);
                }

                // Set value if editing
                if (isEdit && editData?.eventName) {
                    el.value = editData.eventName;
                }
            }
        })
        eventField.appendChild(eventSelect)

        // Title field
        const titleField = $({ tag: 'div', style: { marginBottom: '20px' } })
        titleField.appendChild($({ tag: 'label', text: 'Document Title *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        titleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter document title', value: isEdit ? editData?.title || '' : '' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: (e) => { formData.title = e.target.value }
            }
        })
        titleField.appendChild(titleInput)

        // Category field
        const categoryField = $({ tag: 'div', style: { marginBottom: '20px' } })
        categoryField.appendChild($({ tag: 'label', text: 'Category *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        categorySelect = $({
            tag: 'select',
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'change',
                method: (e) => {
                    formData.category = e.target.value
                    // Update center options
                    if (centerSelect) {
                        const centers = categoryToCenters[e.target.value] || Object.keys(centerCategoryMapping)
                        centerSelect.innerHTML = ''
                        centerSelect.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
                        centers.forEach(center => {
                            centerSelect.appendChild($({ tag: 'option', text: center, att: { value: center } }))
                        })
                    }
                }
            },
            elementHandler: (el) => {
                el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true } }))
                categories.forEach(cat => {
                    el.appendChild($({ tag: 'option', text: cat, att: { value: cat } }))
                })
                if (isEdit && editData?.category) el.value = editData.category
            }
        })
        categoryField.appendChild(categorySelect)

        // Center field
        const centerField = $({ tag: 'div', style: { marginBottom: '20px' } })
        centerField.appendChild($({ tag: 'label', text: 'Center *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        centerSelect = $({
            tag: 'select',
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'change',
                method: (e) => { formData.center = e.target.value }
            },
            elementHandler: (el) => {
                el.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
                Object.keys(centerCategoryMapping).forEach(center => {
                    el.appendChild($({ tag: 'option', text: center, att: { value: center } }))
                })
                if (isEdit && editData?.center) el.value = editData.center
            }
        })
        centerField.appendChild(centerSelect)

        // Author field
        const authorField = $({ tag: 'div', style: { marginBottom: '20px' } })
        authorField.appendChild($({ tag: 'label', text: 'Main Author *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        authorInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter main author name', value: isEdit ? editData?.author || '' : '' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: (e) => { formData.author = e.target.value }
            }
        })
        authorField.appendChild(authorInput)

        // Presenter field
        const presenterField = $({ tag: 'div', style: { marginBottom: '20px' } })
        presenterField.appendChild($({ tag: 'label', text: 'Presenter *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        presenterInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter presenter name', value: isEdit ? editData?.presenter || '' : '' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: (e) => { formData.presenter = e.target.value }
            }
        })
        presenterField.appendChild(presenterInput)

        // Co-authors field
        const coAuthorField = $({ tag: 'div', style: { marginBottom: '20px' } })
        coAuthorField.appendChild($({ tag: 'label', text: 'Co-Authors', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

        const coAuthorInputGroup = $({
            tag: 'div',
            style: { display: 'flex', gap: '10px', marginBottom: '12px' }
        })

        coAuthorInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter co-author name' },
            style: {
                flex: 1,
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            }
        })

        const addCoAuthorBtn = $({
            tag: 'button',
            text: 'Add',
            style: {
                padding: '8px 20px',
                backgroundColor: '#2196F3',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
            },
            event: {
                type: 'click',
                method: () => {
                    const name = coAuthorInput.value.trim()
                    if (name) {
                        formData.coAuthors.push(name)
                        updateCoAuthorList()
                        coAuthorInput.value = ''
                    }
                }
            }
        })

        coAuthorInputGroup.appendChild(coAuthorInput)
        coAuthorInputGroup.appendChild(addCoAuthorBtn)

        coAuthorList = $({
            tag: 'div',
            style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }
        })

        const updateCoAuthorList = () => {
            coAuthorList.innerHTML = ''
            formData.coAuthors.forEach((author, idx) => {
                const tag = $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2a2a2a',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px'
                    },
                    child: [
                        $({ tag: 'span', text: author, style: { color: '#fff' } }),
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-times' },
                            style: { color: '#999', fontSize: '10px', cursor: 'pointer' },
                            event: {
                                type: 'click',
                                method: () => {
                                    formData.coAuthors.splice(idx, 1)
                                    updateCoAuthorList()
                                }
                            }
                        })
                    ]
                })
                coAuthorList.appendChild(tag)
            })
        }

        if (isEdit && editData?.coAuthors) {
            formData.coAuthors = [...editData.coAuthors]
            updateCoAuthorList()
        }

        coAuthorField.appendChild(coAuthorInputGroup)
        coAuthorField.appendChild(coAuthorList)

        // Add fields to two-column layout
        twoColumnLayout.appendChild(titleField)
        twoColumnLayout.appendChild(categoryField)
        twoColumnLayout.appendChild(centerField)
        twoColumnLayout.appendChild(authorField)
        twoColumnLayout.appendChild(presenterField)
        twoColumnLayout.appendChild(coAuthorField)

        formBody.appendChild(eventField)
        formBody.appendChild(twoColumnLayout)

        // File upload sections
        const fileSection = $({
            tag: 'div',
            style: {
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }
        })

        fileSection.appendChild($({ tag: 'h4', text: 'Attachments', style: { color: '#fff', marginBottom: '16px', fontSize: '16px' } }))

        const fileGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px'
            }
        })

        fileGrid.appendChild(FileUploadField({ label: 'Research File', fieldName: 'researchFile' }))
        fileGrid.appendChild(FileUploadField({ label: 'Program File', fieldName: 'programFile' }))
        fileGrid.appendChild(FileUploadField({ label: 'Endorsement Letter', fieldName: 'endorsementFile' }))

        fileSection.appendChild(fileGrid)
        formBody.appendChild(fileSection)

        // Form actions
        const actions = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#1a1a1a'
            }
        })

        const cancelBtn = $({
            tag: 'button',
            text: 'Cancel',
            style: {
                padding: '10px 24px',
                backgroundColor: '#444',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            },
            event: {
                type: 'click',
                method: () => modal.remove()
            }
        })

        const submitBtn = $({
            tag: 'button',
            text: isEdit ? 'Submit Edited Entry' : 'Submit New Entry',
            style: {
                padding: '10px 28px',
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            },
            event: {
                type: 'click',
                method: async () => {
                    // Validate required fields
                    if (!formData.eventName || !formData.title || !formData.category || !formData.center || !formData.author || !formData.presenter) {
                        alert('Please fill in all required fields (*)');
                        return;
                    }

                    // File validations for new uploads
                    if (!isEdit) {
                        if (!formData.researchFile || !formData.programFile || !formData.endorsementFile) {
                            alert('Please upload all required files');
                            return;
                        }

                        // Validate PDF files
                        if (formData.researchFile && formData.researchFile.type !== 'application/pdf') {
                            alert('Research file must be a valid PDF file');
                            return;
                        }
                        if (formData.programFile && formData.programFile.type !== 'application/pdf') {
                            alert('Program file must be a valid PDF file');
                            return;
                        }
                        if (formData.endorsementFile && formData.endorsementFile.type !== 'application/pdf') {
                            alert('Endorsement letter must be a valid PDF file');
                            return;
                        }
                    }

                    // Validate co-authors if any
                    if (formData.coAuthors && formData.coAuthors.length > 0) {
                        const invalidCoAuthors = formData.coAuthors.filter(coAuth => !coAuth.trim());
                        if (invalidCoAuthors.length > 0) {
                            alert("Some co-authors have empty names. Please fix or remove them.");
                            return;
                        }
                    }

                    // Show loading indicator
                    let loading = Waiting();
                    document.body.appendChild(loading);

                    const removeLoading = () => {
                        if (loading && loading.remove) {
                            loading.remove();
                        }
                    };

                    try {
                        const form = new FormData();

                        if (isEdit) {
                            // For edit mode - add update flag
                            form.append('updateResearch', 'true');
                            form.append('docId', editData.id);
                        } else {
                            // For new upload
                            form.append('uploadResearch', 'true');
                        }

                        // Append all form data
                        form.append('eventType', formData.eventName);
                        form.append('title', formData.title);
                        form.append('category', formData.category);
                        form.append('center', formData.center);
                        form.append('author', formData.author);
                        form.append('presenter', formData.presenter);
                        form.append('coAuthor', JSON.stringify(formData.coAuthors || []));

                        // Append files if they exist (for new uploads or if files were updated)
                        if (formData.endorsementFile) {
                            form.append('uploadedFileEndorsement', formData.endorsementFile);
                        }
                        if (formData.researchFile) {
                            form.append('researchDoc', formData.researchFile);
                        }
                        if (formData.programFile) {
                            form.append('programFile', formData.programFile);
                        }

                        // Make the API request
                        const response = await fetch('/getresearch', {
                            method: 'POST',
                            body: form
                        });

                        // Check if response is OK
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        // Parse response as JSON
                        const dat = await response.json();
                        removeLoading();

                        if (dat.status) {
                            // Success - create/update the table row
                            const newDoc = {
                                id: isEdit ? editData.id : (dat.docId || Date.now()),
                                eventName: formData.eventName,
                                title: formData.title,
                                category: formData.category,
                                center: formData.center,
                                author: formData.author,
                                presenter: formData.presenter,
                                coAuthors: formData.coAuthors,
                                researchFile: formData.researchFile ? formData.researchFile.name : (editData?.researchFile || '—'),
                                programFile: formData.programFile ? formData.programFile.name : (editData?.programFile || '—'),
                                endorsementFile: formData.endorsementFile ? formData.endorsementFile.name : (editData?.endorsementFile || '—'),
                                status: isEdit ? (editData.status || 'pending') : 'pending',
                                date: new Date().toISOString()
                            };

                            if (isEdit) {
                                // Update existing row
                                const rows = documentsTable.querySelectorAll('tr');
                                for (let i = 1; i < rows.length; i++) {
                                    if (rows[i].cells[2]?.innerText === editData.title) {
                                        const newRow = createTableRow(newDoc);
                                        rows[i].parentNode.replaceChild(newRow, rows[i]);
                                        break;
                                    }
                                }
                            } else {
                                // Add new row at the top
                                const newRow = createTableRow(newDoc);
                                const tbody = documentsTable.querySelector('tbody');
                                // Remove empty state if exists
                                const emptyState = tbody.querySelector('.empty-state-row');
                                if (emptyState) emptyState.remove();

                                if (tbody.firstChild) {
                                    tbody.insertBefore(newRow, tbody.firstChild);
                                } else {
                                    tbody.appendChild(newRow);
                                }

                                // Update stats if you have them
                                updateStats();
                            }

                            // Show success message
                            document.body.appendChild(ConfirmationAlert(dat.message || (isEdit ? 'Document updated successfully!' : 'Document uploaded successfully!'), () => {
                                modal.remove();
                                if (!isEdit) {
                                    // Reset form data
                                    formData = {
                                        eventName: '',
                                        eventId: '',
                                        title: '',
                                        category: '',
                                        center: '',
                                        presenter: '',
                                        author: '',
                                        coAuthors: [],
                                        researchFile: null,
                                        programFile: null,
                                        endorsementFile: null
                                    };
                                }
                            }));

                        } else {
                            // Show error message from server
                            document.body.appendChild(ConfirmationAlert(dat.message || 'Upload failed. Please try again.', () => {
                                // Don't close modal on error
                            }));
                        }

                    } catch (err) {
                        removeLoading();
                        console.error('Error uploading document:', err);
                        alert('Error uploading document: ' + (err.message || 'Unknown error. Please try again.'));
                    }
                }
            }
        });

        actions.appendChild(cancelBtn)
        actions.appendChild(submitBtn)

        modalContent.appendChild(header)
        modalContent.appendChild(formBody)
        modalContent.appendChild(actions)
        modal.appendChild(modalContent)
        document.body.appendChild(modal)
    }

    // Create the main UI
    const createMainUI = () => {
        const container = $({
            tag: 'div',
            style: {
                padding: '24px',
                backgroundColor: '#121212',
                minHeight: '100vh'
            }
        })

        // Header
        const header = $({
            tag: 'div',
            style: {
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }
        })

        const titleSection = $({
            tag: 'div',
            child: [
                $({ tag: 'h1', text: 'Research Documents', style: { color: '#fff', fontSize: '28px', margin: 0, marginBottom: '8px' } }),
                $({ tag: 'p', text: 'Manage and track all research submissions', style: { color: '#888', fontSize: '14px', margin: 0 } })
            ]
        })

        const buttonGroup = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '12px'
            }
        });

        const uploadBtn = $({
            tag: 'button',
            style: {
                backgroundColor: '#2196F3',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-plus' }, style: { fontSize: '14px' } }),
                $({ tag: 'span', text: 'Submit Entry' })
            ],
            event: {
                type: 'click',
                method: () => openUploadModal(false)
            }
        })

        const viewResearchesBtn = $({
            tag: 'button',
            style: {
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-table-list' }, style: { fontSize: '14px' } }),
                $({ tag: 'span', text: 'View Researches' })
            ],
            event: {
                type: 'click',
                method: () => openViewResearchesModal()
            }
        });

        buttonGroup.appendChild(uploadBtn);
        buttonGroup.appendChild(viewResearchesBtn);
        header.appendChild(titleSection)
        header.appendChild(buttonGroup)

        // Stats cards
        const statsContainer = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            },
            att: { className: 'stats-container' }
        })

        const stats = [
            { label: 'Total Documents', value: '0', icon: 'fa-file-alt', color: '#2196F3' },
            { label: 'Pending Review', value: '0', icon: 'fa-clock', color: '#FF9800' },
            { label: 'Approved', value: '0', icon: 'fa-check-circle', color: '#4CAF50' },
            { label: 'Rejected', value: '0', icon: 'fa-times-circle', color: '#f44336' }
        ]

        stats.forEach((stat, index) => {
            const card = $({
                tag: 'div',
                style: {
                    backgroundColor: '#1e1e1e',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.05)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
                        child: [
                            $({ tag: 'span', text: stat.label, style: { color: '#888', fontSize: '14px' } }),
                            $({ tag: 'i', att: { className: `fas ${stat.icon}` }, style: { color: stat.color, fontSize: '20px' } })
                        ]
                    }),
                    $({
                        tag: 'div',
                        text: stat.value,
                        style: { color: '#fff', fontSize: '28px', fontWeight: 'bold' },
                        att: { className: 'stat-value' }
                    })
                ]
            })
            statsContainer.appendChild(card)
        })

        // Table container
        const tableContainer = $({
            tag: 'div',
            style: {
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.05)'
            }
        })

        const table = $({
            tag: 'table',
            style: {
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1200px'
            },
            elementHandler: (el) => { documentsTable = el }
        })

        // Table header
        const thead = $({ tag: 'thead' })
        const headerRow = $({ tag: 'tr', style: { backgroundColor: '#2a2a2a', borderBottom: '2px solid #333' } })
        const columns = ['Event Name', 'Status', 'Title', 'Category', 'Presenter', 'Author', 'Co-Authors', 'Research', 'Program', 'Endorsement', 'Actions']

        columns.forEach(col => {
            headerRow.appendChild($({
                tag: 'th',
                text: col,
                style: {
                    padding: '16px 12px',
                    textAlign: 'left',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                }
            }))
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        const tbody = $({ tag: 'tbody' })
        table.appendChild(tbody)

        // Loading state
        const loadingRow = $({ tag: 'tr', att: { className: 'loading-row' } });
        const loadingCell = $({
            tag: 'td',
            att: { colSpan: columns.length },
            style: { padding: '60px', textAlign: 'center', color: '#666' }
        });
        loadingCell.appendChild($({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '16px' } }));
        loadingCell.appendChild($({ tag: 'div', text: 'Loading documents...', style: { fontSize: '14px' } }));
        loadingRow.appendChild(loadingCell);
        tbody.appendChild(loadingRow);

        tableContainer.appendChild(table)

        container.appendChild(header)
        container.appendChild(statsContainer)
        container.appendChild(tableContainer)

        const updateStatsFromData = (total, pending, approved, rejected) => {
            const statValues = statsContainer.querySelectorAll('.stat-value');
            if (statValues.length >= 4) {
                statValues[0].innerText = total;
                statValues[1].innerText = pending;
                statValues[2].innerText = approved;
                statValues[3].innerText = rejected;
            }
        };

        const showEmptyState = () => {
            const emptyRow = $({ tag: 'tr', att: { className: 'empty-state-row' } });
            const emptyCell = $({
                tag: 'td',
                att: { colSpan: columns.length },
                style: { padding: '60px', textAlign: 'center', color: '#666' }
            });
            emptyCell.appendChild($({ tag: 'i', att: { className: 'fas fa-folder-open' }, style: { fontSize: '48px', display: 'block', marginBottom: '16px' } }));
            emptyCell.appendChild($({ tag: 'div', text: 'No documents yet', style: { fontSize: '16px', marginBottom: '8px' } }));
            emptyCell.appendChild($({ tag: 'div', text: 'Click the "Upload Document" button to get started', style: { fontSize: '14px' } }));
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        };

        const loadDocuments = async () => {
            try {
                // Show loading state
                tbody.innerHTML = '';
                const loadingRow = $({ tag: 'tr', att: { className: 'loading-row' } });
                const loadingCell = $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: { padding: '60px', textAlign: 'center', color: '#666' }
                });
                loadingCell.appendChild($({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '16px' } }));
                loadingCell.appendChild($({ tag: 'div', text: 'Loading documents...', style: { fontSize: '14px' } }));
                loadingRow.appendChild(loadingCell);
                tbody.appendChild(loadingRow);

                // Use the endpoint that returns user-specific documents by senderid
                const form = new FormData();
                form.append('researchReviewed', 'true');

                const response = await fetch('/uploadResearchFile', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response (filtered by senderid):', data);

                    // Clear loading state
                    tbody.innerHTML = '';

                    // The researchReviewed endpoint returns an object with a 'list' property
                    if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                        let totalDocs = 0;
                        let pendingCount = 0;
                        let approvedCount = 0;
                        let rejectedCount = 0;

                        // Process each endorsement (each contains ResearchDocs)
                        data.list.forEach(endorsement => {
                            // Process each research document under this endorsement
                            if (endorsement.ResearchDocs && Array.isArray(endorsement.ResearchDocs)) {
                                endorsement.ResearchDocs.forEach(researchDoc => {
                                    totalDocs++;

                                    // Count status from the endorsement level
                                    const status = endorsement.status;
                                    if (status === 'rejected') {
                                        rejectedCount++;
                                    } else if (status === 'accepted' || status === 'approved') {
                                        approvedCount++;
                                    } else {
                                        pendingCount++;
                                    }

                                    // Parse coauthors if present
                                    let coAuthors = [];
                                    if (researchDoc.coauthor) {
                                        try {
                                            coAuthors = JSON.parse(researchDoc.coauthor);
                                        } catch (e) {
                                            coAuthors = [];
                                        }
                                    }

                                    // Debug log to see what's coming from API
                                    console.log('Research Doc:', {
                                        title: researchDoc.title,
                                        program_drive_view_url: researchDoc.program_drive_view_url,
                                        program_drive_file_id: researchDoc.program_drive_file_id
                                    });

                                    // Create document object for table
                                    const documentObj = {
                                        id: researchDoc.docId,
                                        eventName: endorsement.eventType || '—',
                                        title: researchDoc.title || '—',
                                        category: researchDoc.category || '—',
                                        presenter: researchDoc.presenter || '—',
                                        author: researchDoc.author || '—',
                                        coAuthors: coAuthors,
                                        status: endorsement.status || 'pending',
                                        researchFile: researchDoc.drive_view_url || researchDoc.researchFile || '—',
                                        programFile: researchDoc.program_drive_view_url || researchDoc.program_drive_file_id || '—', // FIXED: Use program_drive_view_url
                                        endorsementFile: endorsement.drive_view_url || endorsement.endorsementFile || '—',
                                        drive_file_id: researchDoc.drive_file_id,
                                        drive_view_url: researchDoc.drive_view_url,
                                        endorsement_id: endorsement.id,
                                        campus: endorsement.campus || researchDoc.campus,
                                        center: endorsement.center || researchDoc.center,
                                        date: endorsement.date,
                                        program_drive_view_url: researchDoc.program_drive_view_url // Store for debugging
                                    };

                                    const row = createTableRow(documentObj);
                                    tbody.appendChild(row);
                                });
                            }
                        });

                        // Update stats
                        updateStatsFromData(totalDocs, pendingCount, approvedCount, rejectedCount);

                        if (totalDocs === 0) {
                            showEmptyState();
                        }
                    } else {
                        showEmptyState();
                    }
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error loading documents:', error);
                tbody.innerHTML = '';
                const errorRow = $({ tag: 'tr' });
                const errorCell = $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: { padding: '60px', textAlign: 'center', color: '#f44336' }
                });
                errorCell.appendChild($({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '48px', display: 'block', marginBottom: '16px' } }));
                errorCell.appendChild($({ tag: 'div', text: 'Error loading documents', style: { fontSize: '16px', marginBottom: '8px' } }));
                errorCell.appendChild($({ tag: 'div', text: error.message, style: { fontSize: '14px' } }));
                errorRow.appendChild(errorCell);
                tbody.appendChild(errorRow);
            }
        };

        // Load documents when component mounts
        setTimeout(() => {
            loadDocuments();
        }, 100);

        // Store loadDocuments function globally for refresh capability
        window.refreshDocumentsTable = loadDocuments;

        return container
    }

    return createMainUI()
}
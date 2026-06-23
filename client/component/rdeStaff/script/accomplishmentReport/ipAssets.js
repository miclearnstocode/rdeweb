import { $, ValidatePDF, DeleteConfirmModal, DragDropUpload, CustomModal } from "../../../../lib/lib.js"

export const PatentUM = () => {
    let mainTableContainer
    let tableBody
    let currentSearch = ''
    let currentType = ''
    let mainSearchTimeout

    // IPR status options based on user requirements
    const statusOptions = [
        { value: 'filed', label: 'Filed', color: '#ff9800' },
        { value: 'registered', label: 'Registered', color: '#4caf50' },
        { value: 'downgrade', label: 'Downgrade', color: '#f44336' }
    ]

    // IPR Type options
    const typeOptions = [
        { value: 'patent', label: 'Patent', icon: 'fa-file-invoice' },
        { value: 'utility_model', label: 'Utility Model', icon: 'fa-cogs' },
        { value: 'copyright', label: 'Copyright', icon: 'fa-copyright' },
        { value: 'industrial_design', label: 'Industrial Design', icon: 'fa-paint-brush' },
        { value: 'trademark', label: 'Trademark', icon: 'fa-trademark' }
    ]

    const campusOptions = [
        'Roxas City Main',
        'Pilar',
        'Pontevedra',
        'Sigma',
        'Mambusao',
        'Burias',
        'Tapaz',
        'Dayao',
        'Dumarao'
    ]

    const classOfWorkOptions = [
        { label: 'Class A', desc: 'Books, pamphlets, articles and other writings (includes thesis and dissertations)' },
        { label: 'Class B', desc: 'Periodicals and newspapers (includes electronic journals, magazines)' },
        { label: 'Class C', desc: 'Lectures, sermons, addresses, dissertations, speeches prepared for oral delivery' },
        { label: 'Class D', desc: 'Letters (includes circulars, encyclicals, electronic messages or emails)' },
        { label: 'Class E', desc: 'Dramatic or dramatico-musical compositions choreographic works and entertainment' },
        { label: 'Class F', desc: 'Musical compositions, with or without words' },
        { label: 'Class G', desc: 'Works of drawing, painting, architecture, sculpture, engraving, lithography digital artworks' },
        { label: 'Class H', desc: 'Original ornamental designs or models for articles of manufacture' },
        { label: 'Class I', desc: 'Illustrations, maps, plans, sketches, charts and three-dimensional works' },
        { label: 'Class K', desc: 'Photographic works lantern slides' },
        { label: 'Class L', desc: 'Audiovisual works and cinematographic works audio-visual recordings' },
        { label: 'Class M', desc: 'Pictorial illustrations and advertisements (includes product packaging graphical designs)' },
        { label: 'Class N', desc: 'Computer programs (includes mobile applications and games)' },
        { label: 'Class O', desc: 'Other literary, scholarly, scientific and artistic works (board games, flash cards, spreadsheets)' },
        { label: 'Class P', desc: 'Sound recordings (Related Rights)' },
        { label: 'Class Q', desc: 'Broadcast recordings (Related Rights)' },
        { label: 'Class R', desc: 'Audiovisual performance (Related Rights)' }
    ]

    const columns = [
        { field: 'type', header: 'IPR Type', width: '180px' },
        { field: 'technologyName', header: 'Title / Technology Name', width: '300px' },
        { field: 'caseNumber', header: 'Case Number', width: '180px' },
        { field: 'applicationNumber', header: 'Application No.', width: '150px' },
        { field: 'status', header: 'Status', width: '150px' },
        { field: 'applicationDate', header: 'Application Date', width: '130px' },
        { field: 'publicationDate', header: 'Publication Date', width: '130px' },
        { field: 'inventors', header: 'Inventors / Authors', width: '250px' },
        { field: 'campus', header: 'Campus', width: '150px' },
        { field: 'actions', header: 'Actions', width: '100px' }
    ]

    const getMainContainer = (el) => {
        mainTableContainer = el
    }

    const openAddPatentModal = () => {
        const modal = createPatentModal()
        document.body.appendChild(modal)
        setTimeout(() => {
            const overlay = document.getElementById('patent-modal-overlay')
            if (overlay) overlay.style.opacity = '1'
        }, 10)
    }

    const closeModal = () => {
        const overlay = document.getElementById('patent-modal-overlay')
        if (overlay) {
            overlay.style.opacity = '0'
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
            }, 300)
        }
    }

    const openUnderReviewModal = () => {
        const modal = createUnderReviewModal()
        document.body.appendChild(modal)
        setTimeout(() => {
            const overlay = document.getElementById('under-review-modal-overlay')
            if (overlay) overlay.style.opacity = '1'
        }, 10)
    }

    const closeUnderReviewModal = () => {
        const overlay = document.getElementById('under-review-modal-overlay')
        if (overlay) {
            overlay.style.opacity = '0'
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
            }, 300)
        }
    }

    const openFileViewer = (fileOrUrl, label) => {
        const isFileObject = typeof fileOrUrl !== 'string' && fileOrUrl instanceof File;
        const url = isFileObject ? URL.createObjectURL(fileOrUrl) : fileOrUrl;
        
        const isImage = isFileObject 
            ? fileOrUrl.type.startsWith('image/')
            : /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(url) || 
            url.includes('googleusercontent') && !url.endsWith('.pdf');

        const getGoogleDriveEmbedUrl = (url) => {
            if (url.includes('drive.google.com')) {
                const match = url.match(/[?&]id=([^&]+)/);
                if (match) {
                    const fileId = match[1];
                    if (isImage) {
                        return `https://drive.google.com/uc?export=view&id=${fileId}`;
                    } else {
                        return `https://drive.google.com/file/d/${fileId}/preview`;
                    }
                }
                const shareMatch = url.match(/\/file\/d\/([^/]+)/);
                if (shareMatch) {
                    const fileId = shareMatch[1];
                    if (isImage) {
                        return `https://drive.google.com/uc?export=view&id=${fileId}`;
                    } else {
                        return `https://drive.google.com/file/d/${fileId}/preview`;
                    }
                }
            }
            if (url.includes('googleusercontent.com')) {
                return url;
            }
            return url;
        };

        const displayUrl = isFileObject ? url : getGoogleDriveEmbedUrl(url);

        const createViewerContent = () => {
            const container = $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    minHeight: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                }
            });

            if (isImage) {
                const img = $({
                    tag: 'img',
                    att: {
                        src: displayUrl,
                        alt: label || 'File preview',
                        loading: 'lazy'
                    },
                    style: {
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        borderRadius: '8px'
                    },
                    event: {
                        type: 'error',
                        method: (e) => {
                            e.target.style.display = 'none';
                            const fallback = $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '40px',
                                    color: '#94a3b8'
                                },
                                child: [
                                    $({
                                        tag: 'i',
                                        att: { className: 'fa-solid fa-image' },
                                        style: { fontSize: '48px', marginBottom: '16px', opacity: 0.3 }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Failed to load image',
                                        style: { fontSize: '14px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Please try downloading the file instead.',
                                        style: { fontSize: '13px', marginTop: '4px', opacity: 0.7 }
                                    })
                                ]
                            });
                            container.appendChild(fallback);
                        }
                    }
                });
                container.appendChild(img);
            } else {
                const iframe = $({
                    tag: 'iframe',
                    att: {
                        src: displayUrl,
                        title: label || 'PDF Viewer',
                        frameborder: '0',
                        allowfullscreen: 'true',
                        sandbox: 'allow-scripts allow-same-origin allow-popups'
                    },
                    style: {
                        width: '100%',
                        height: '100%',
                        minHeight: '550px',
                        border: 'none',
                        display: 'block',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff'
                    },
                    event: {
                        type: 'error',
                        method: (e) => {
                            const fallback = $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '40px',
                                    color: '#94a3b8'
                                },
                                child: [
                                    $({
                                        tag: 'i',
                                        att: { className: 'fa-solid fa-file-pdf' },
                                        style: { fontSize: '48px', marginBottom: '16px', opacity: 0.3, color: '#f44336' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Unable to preview PDF',
                                        style: { fontSize: '14px', marginBottom: '8px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Please try downloading the file instead.',
                                        style: { fontSize: '13px', marginTop: '4px', opacity: 0.7 }
                                    })
                                ]
                            });
                            container.innerHTML = '';
                            container.appendChild(fallback);
                        }
                    }
                });
                container.appendChild(iframe);
            }

            return container;
        };

        const createFooter = ({ closeModal }) => {
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                },
                child: [
                    // Download button
                    $({
                        tag: 'a',
                        att: {
                            href: url,
                            download: label || 'file',
                            target: '_blank',
                            rel: 'noopener'
                        },
                        style: {
                            padding: '10px 24px',
                            backgroundColor: '#1a73e8',
                            color: '#ffffff',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            border: 'none',
                            cursor: 'pointer'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fa-solid fa-download' },
                                style: { fontSize: '14px' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Download'
                            })
                        ],
                        event: {
                            type: 'mouseenter',
                            method: (e) => {
                                e.currentTarget.style.backgroundColor = '#1557b0';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 115, 232, 0.3)';
                            },
                            type2: 'mouseleave',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#1a73e8';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }
                    }),
                    // Close button
                    $({
                        tag: 'button',
                        style: {
                            padding: '10px 24px',
                            backgroundColor: '#f1f3f4',
                            color: '#1a1a1a',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #dadce0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fa-solid fa-times' },
                                style: { fontSize: '14px' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Close'
                            })
                        ],
                        event: {
                            type: 'click',
                            method: closeModal,
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#e8eaed';
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f1f3f4';
                            }
                        }
                    })
                ]
            });
        };

        // Open the CustomModal - no fallback to new tab
        const modal = CustomModal({
            title: label || (isImage ? 'Image Viewer' : 'PDF Viewer'),
            size: 'large',
            content: createViewerContent(),
            footer: createFooter,
            closeOnOverlayClick: true,
            onClose: () => {
                if (isFileObject) {
                    URL.revokeObjectURL(url);
                }
                console.log('File viewer closed');
            }
        });
        if (modal && modal.element) {
            modal.element.style.zIndex = '1200';
        }
        // Return the modal instance in case we need to control it
        return modal;
    };

    const buildDocumentLinks = (item) => {
        const urlKeys = Object.keys(item).filter(k =>
            (k.toLowerCase().includes('url') || k === 'patent_image') && item[k]
        )
        
        if (urlKeys.length === 0) {
            return $({
                tag: 'div',
                text: 'No documents attached.',
                style: {
                    color: '#9aa0a6',
                    fontSize: '12px',
                    padding: '8px 4px',
                    fontStyle: 'italic',
                    fontWeight: '400'
                }
            })
        }
        
        const labelMap = {
            patentFormURL: 'Application Form',
            patentFormURLUM: 'Application Form (UM)',
            abstractURL: 'Abstract',
            abstractURLUM: 'Abstract (UM)',
            claimsURL: 'Claims',
            claimsURLUM: 'Claims (UM)',
            technicalDescriptionURL: 'Technical Description',
            technicalDescriptionURLUM: 'Technical Description (UM)',
            technicalDrawingURL: 'Technical Drawing',
            technicalDrawingURLUM: 'Technical Drawing (UM)',
            photoTechnologyURL: 'Photo of Technology',
            photoTechnologyURLUM: 'Photo of Technology (UM)',
            applicationFormURL: 'Application Form (ID)',
            copyrightFormsURL: 'Copyright Forms',
            supplementalDocumentURL: 'Supplemental Doc',
            deedAssignmentURL: 'Deed of Assignment',
            affidavitOwnershipURL: 'Affidavit of Ownership',
            idAuthorURL: 'IDs of Authors',
            creativeWorksURL: 'Creative Works',
            photoWorksURL: 'Photo of Works',
            trademarkFormURL: 'Trademark Application',
            photoTrademarkURL: 'Photo of Trademark'
        }

        // Helper to determine file type icon
        const getFileIcon = (url, label) => {
            if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(url) || url.includes('googleusercontent')) {
                return 'fa-image'
            }
            if (/\.(pdf)$/i.test(url)) {
                return 'fa-file-pdf'
            }
            if (/\.(doc|docx)$/i.test(url)) {
                return 'fa-file-word'
            }
            if (/\.(xls|xlsx)$/i.test(url)) {
                return 'fa-file-excel'
            }
            return 'fa-file'
        }

        const getFileColor = (url) => {
            if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(url) || url.includes('googleusercontent')) {
                return '#34a853'
            }
            if (/\.(pdf)$/i.test(url)) {
                return '#ea4335'
            }
            if (/\.(doc|docx)$/i.test(url)) {
                return '#4285f4'
            }
            if (/\.(xls|xlsx)$/i.test(url)) {
                return '#0f9d58'
            }
            return '#5f6368'
        }

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '4px 0'
            },
            child: urlKeys.map(k => {
                const label = labelMap[k] || k.replace(/_/g, ' ')
                const url = item[k]
                const fileIcon = getFileIcon(url, label)
                const fileColor = getFileColor(url)
                
                const btn = $({
                    tag: 'button',
                    style: {
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e8ecf0',
                        color: '#1a2a3a',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: `fa-solid ${fileIcon}` },
                            style: {
                                fontSize: '14px',
                                color: fileColor,
                                width: '16px',
                                textAlign: 'center'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: label,
                            style: {
                                flex: '1',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'i',
                            att: { className: 'fa-solid fa-eye' },
                            style: {
                                fontSize: '11px',
                                color: '#9aa0a6',
                                transition: 'color 0.2s ease'
                            }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: () => openFileViewer(url, label),
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9'
                            e.currentTarget.style.borderColor = '#d0d7de'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            const icon = e.currentTarget.querySelector('.fa-eye')
                            if (icon) icon.style.color = '#1a73e8'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc'
                            e.currentTarget.style.borderColor = '#e8ecf0'
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            const icon = e.currentTarget.querySelector('.fa-eye')
                            if (icon) icon.style.color = '#9aa0a6'
                        }
                    }
                })
                return btn
            })
        })
    }

    const createUnderReviewModal = () => {
        let reviewTableBody
        let reviewBadge

        const reviewColumns = [
            { field: 'type', header: 'IPR Type', width: '130px' },
            { field: 'technologyName', header: 'Title / Tech Name', width: '240px' },
            { field: 'caseNumber', header: 'Case No.', width: '150px' },
            { field: 'inventors', header: 'Inventors / Authors', width: '200px' },
            { field: 'campus', header: 'Campus', width: '120px' },
            { field: 'documents', header: 'Supporting Documents', width: '200px' },
            { field: 'reviewActions', header: 'Actions', width: '140px' }
        ]

        const refreshReviewTable = async () => {
            if (!reviewTableBody) return
            reviewTableBody.innerHTML = ''
            reviewTableBody.appendChild($({
                tag: 'tr', child: [
                    $({
                        tag: 'td', att: { colSpan: reviewColumns.length },
                        style: { padding: '32px', textAlign: 'center', color: '#888', fontSize: '14px' },
                        child: [$({ tag: 'i', att: { className: 'fa-solid fa-spinner fa-spin' }, style: { marginRight: '8px' } }),
                        $({ tag: 'span', text: 'Loading under review records...' })]
                    })]
            }))
            try {
                const fd = new FormData()
                fd.append('action', 'getAll')
                fd.append('submissionStatus', 'under review')
                const resp = await fetch('/patentresearch', { method: 'POST', body: fd })
                const result = await resp.json()
                reviewTableBody.innerHTML = ''
                if (!result.success || result.data.length === 0) {
                    reviewTableBody.appendChild($({
                        tag: 'tr', child: [
                            $({
                                tag: 'td', att: { colSpan: reviewColumns.length },
                                style: { padding: '60px', textAlign: 'center', color: '#888', fontSize: '14px' },
                                child: [
                                    $({ tag: 'i', att: { className: 'fa-solid fa-check-circle' }, style: { fontSize: '32px', color: '#4caf50', display: 'block', marginBottom: '12px' } }),
                                    $({ tag: 'div', text: 'No records under review. All caught up!', style: { color: '#aaa' } })
                                ]
                            })]
                    }))
                    if (reviewBadge) reviewBadge.textContent = '0'
                    return
                }
                if (reviewBadge) reviewBadge.textContent = result.data.length
                result.data.forEach(item => {
                    const row = $({
                        tag: 'tr',
                        style: { transition: 'background 0.2s', cursor: 'default', verticalAlign: 'top' },
                        event: {
                            type: 'mouseenter', method: e => e.currentTarget.style.backgroundColor = 'rgba(0,191,255,0.04)',
                            type2: 'mouseleave', method2: e => e.currentTarget.style.backgroundColor = 'transparent'
                        },
                        child: reviewColumns.map(col => {
                            const tdStyle = {
                                padding: '14px 12px', fontSize: '13px', color: '#ddd',
                                borderBottom: '1px solid #333', verticalAlign: 'top',
                                maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis'
                            }
                            let content
                            if (col.field === 'type') {
                                content = createTypeBadge(item.type)
                            } else if (col.field === 'technologyName') {
                                const name = item.technologyName || item.technologyNameUM || item.idTitle || item.title || item.productName || '—'
                                content = $({ tag: 'span', text: name, style: { fontWeight: '500', color: '#fff', whiteSpace: 'normal', lineHeight: '1.4' } })
                            } else if (col.field === 'caseNumber') {
                                content = item.caseNumber || item.caseNumberUM || '—'
                            } else if (col.field === 'inventors') {
                                content = item.inventors || item.inventorsUM || item.invertors || item.author || '—'
                            } else if (col.field === 'campus') {
                                content = item.campus || item.campusUM || '—'
                            } else if (col.field === 'documents') {
                                content = buildDocumentLinks(item)
                            } else if (col.field === 'reviewActions') {
                                const verifyBtn = $({
                                    tag: 'button', text: 'Verify',
                                    style: {
                                        backgroundColor: 'rgba(76,175,80,0.15)', border: '1px solid #4caf50',
                                        color: '#4caf50', padding: '7px 14px', borderRadius: '20px',
                                        cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                                    },
                                    child: [$({ tag: 'i', att: { className: 'fa-solid fa-circle-check' }, style: { fontSize: '11px' } }),
                                    $({ tag: 'span', text: 'Verify' })],
                                    event: {
                                        type: 'mouseenter', method: e => { e.currentTarget.style.backgroundColor = '#4caf50'; e.currentTarget.style.color = '#fff' },
                                        type2: 'mouseleave', method2: e => { e.currentTarget.style.backgroundColor = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#4caf50' }
                                    }
                                })
                                const rejectBtn = $({
                                    tag: 'button', text: 'Reject',
                                    style: {
                                        backgroundColor: 'rgba(244,67,54,0.15)', border: '1px solid #f44336',
                                        color: '#f44336', padding: '7px 14px', borderRadius: '20px',
                                        cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                                    },
                                    child: [$({ tag: 'i', att: { className: 'fa-solid fa-circle-xmark' }, style: { fontSize: '11px' } }),
                                    $({ tag: 'span', text: 'Reject' })],
                                    event: {
                                        type: 'mouseenter', method: e => { e.currentTarget.style.backgroundColor = '#f44336'; e.currentTarget.style.color = '#fff' },
                                        type2: 'mouseleave', method2: e => { e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.15)'; e.currentTarget.style.color = '#f44336' }
                                    }
                                })

                                const doAction = async (newStatus, btn) => {
                                    btn.disabled = true
                                    verifyBtn.disabled = true
                                    rejectBtn.disabled = true
                                    const fd2 = new FormData()
                                    fd2.append('action', 'verify_capsu')
                                    fd2.append('id', item.id)
                                    fd2.append('type', item.type)
                                    fd2.append('status', newStatus)
                                    const r = await fetch('/patentresearch', { method: 'POST', body: fd2 })
                                    const res = await r.json()
                                    if (res.success) {
                                        // Animate row out then refresh
                                        row.style.transition = 'opacity 0.4s, transform 0.4s'
                                        row.style.opacity = '0'
                                        row.style.transform = 'translateX(30px)'
                                        setTimeout(() => refreshReviewTable(), 420)
                                        loadPatents() // Refresh main table counts
                                    } else {
                                        alert('Error: ' + res.message)
                                        btn.disabled = false
                                        verifyBtn.disabled = false
                                        rejectBtn.disabled = false
                                    }
                                }
                                verifyBtn.addEventListener('click', () => doAction('verified', verifyBtn))
                                rejectBtn.addEventListener('click', () => doAction('rejected', rejectBtn))

                                content = $({
                                    tag: 'div', style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                                    child: [verifyBtn, rejectBtn]
                                })
                            } else {
                                content = item[col.field] || '—'
                            }
                            if (typeof content === 'string') {
                                return $({ tag: 'td', style: tdStyle, text: content })
                            }
                            return $({ tag: 'td', style: tdStyle, child: [content] })
                        })
                    })
                    reviewTableBody.appendChild(row)
                })
            } catch (err) {
                console.error('Under review load error:', err)
                reviewTableBody.innerHTML = ''
                reviewTableBody.appendChild($({
                    tag: 'tr', child: [
                        $({
                            tag: 'td', att: { colSpan: reviewColumns.length },
                            style: { padding: '32px', textAlign: 'center', color: '#f44336' },
                            text: 'Failed to load records. Please try again.'
                        })]
                }))
            }
        }

        const overlay = $({
            tag: 'div',
            att: { id: 'under-review-modal-overlay' },
            style: {
                position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: '3000', opacity: '0', transition: 'opacity 0.3s ease'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#1e1e1e', width: '98vw', maxWidth: '1600px',
                        maxHeight: '92vh', borderRadius: '22px', border: '1px solid #3a3a3a',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
                        animation: 'fieldFadeIn 0.35s cubic-bezier(0.4,0,0.2,1)'
                    },
                    child: [
                        // Header
                        $({
                            tag: 'div',
                            style: {
                                padding: '22px 32px', borderBottom: '1px solid #333',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: '#242424', flexShrink: '0'
                            },
                            child: [
                                $({
                                    tag: 'div', style: { display: 'flex', alignItems: 'center', gap: '14px' },
                                    child: [
                                        $({
                                            tag: 'div', style: {
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                backgroundColor: 'rgba(255,152,0,0.15)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,152,0,0.3)'
                                            },
                                            child: [$({ tag: 'i', att: { className: 'fa-solid fa-hourglass-half' }, style: { color: '#ff9800', fontSize: '20px' } })]
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'h2', text: 'Under Review IP Submissions',
                                                    style: { color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 2px', letterSpacing: '-0.3px' }
                                                }),
                                                $({
                                                    tag: 'p', text: 'Review, verify or reject submitted IP records from CAPSU users',
                                                    style: { color: '#888', fontSize: '12px', margin: '0' }
                                                })
                                            ]
                                        }),
                                        // Badge count
                                        $({
                                            tag: 'span', text: '…',
                                            elementHandler: el => { reviewBadge = el },
                                            style: {
                                                backgroundColor: 'rgba(255,152,0,0.2)', color: '#ff9800',
                                                border: '1px solid rgba(255,152,0,0.4)', borderRadius: '20px',
                                                padding: '4px 12px', fontSize: '12px', fontWeight: '700'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'button', att: { className: 'fa-solid fa-xmark' },
                                    style: {
                                        backgroundColor: 'transparent', border: 'none', color: '#666',
                                        fontSize: '20px', cursor: 'pointer', transition: 'color 0.2s', padding: '8px'
                                    },
                                    event: {
                                        type: 'click', method: closeUnderReviewModal,
                                        type2: 'mouseenter', method2: e => e.target.style.color = '#fff',
                                        type3: 'mouseleave', method3: e => e.target.style.color = '#666'
                                    }
                                })
                            ]
                        }),
                        // Body
                        $({
                            tag: 'div', style: { flex: '1', overflowY: 'auto', overflowX: 'hidden' },
                            child: [
                                $({
                                    tag: 'table',
                                    style: { width: '100%', borderCollapse: 'separate', borderSpacing: '0', tableLayout: 'fixed' },
                                    child: [
                                        // Head
                                        $({
                                            tag: 'thead',
                                            child: [$({
                                                tag: 'tr',
                                                child: reviewColumns.map(col => $({
                                                    tag: 'th',
                                                    style: {
                                                        padding: '14px 12px', textAlign: 'left', fontSize: '11px',
                                                        fontWeight: '700', color: '#888', backgroundColor: '#242424',
                                                        borderBottom: '2px solid #333', whiteSpace: 'nowrap',
                                                        width: col.width, position: 'sticky', top: '0', zIndex: '5',
                                                        textTransform: 'uppercase', letterSpacing: '0.6px'
                                                    },
                                                    text: col.header
                                                }))
                                            })]
                                        }),
                                        // Body
                                        $({
                                            tag: 'tbody',
                                            elementHandler: el => { reviewTableBody = el; refreshReviewTable() }
                                        })
                                    ]
                                })
                            ]
                        }),
                        // Footer
                        $({
                            tag: 'div',
                            style: {
                                padding: '16px 32px', borderTop: '1px solid #333',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: '#242424', flexShrink: '0'
                            },
                            child: [
                                $({
                                    tag: 'span', style: { color: '#888', fontSize: '12px' },
                                    text: '✓ Verified records move to accepted  •  ✗ Rejected records are marked accordingly in the main table.'
                                }),
                                $({
                                    tag: 'button', text: 'Close',
                                    style: {
                                        backgroundColor: 'transparent', border: '1px solid #444',
                                        color: '#aaa', padding: '9px 28px', borderRadius: '30px',
                                        cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                                        transition: 'all 0.2s'
                                    },
                                    event: {
                                        type: 'click', method: closeUnderReviewModal,
                                        type2: 'mouseenter', method2: e => { e.target.style.backgroundColor = '#333'; e.target.style.color = '#fff' },
                                        type3: 'mouseleave', method3: e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#aaa' }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
        return overlay
    }

    const searchResearchTitles = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return []

        try {
            const formData = new FormData()
            formData.append('action', 'search_research')
            formData.append('search', searchTerm)

            const response = await fetch('/patentresearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                return result.data
            } else {
                console.error('Search failed:', result.message)
                return []
            }
        } catch (error) {
            console.error('Error searching titles:', error)
            return []
        }
    }

    const createTitleSearchField = (inputBaseStyle) => {
        const containerId = 'title-search-container'
        const inputId = 'title-search-input'
        const resultsId = 'title-search-results'
        const hiddenResearchId = 'selected-research-id'
        const hiddenEndorsementId = 'selected-endorsement-id'

        const container = $({
            tag: 'div',
            style: { position: 'relative', width: '100%', zIndex: '100' }
        })

        const hiddenResearchInput = $({
            tag: 'input',
            att: { type: 'hidden', id: hiddenResearchId, name: 'research_id' }
        })

        const hiddenEndorsementInput = $({
            tag: 'input',
            att: { type: 'hidden', id: hiddenEndorsementId, name: 'endorsement_id' }
        })

        const searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                id: inputId,
                placeholder: 'Search completed research titles...',
                autocomplete: 'off',
                required: true
            },
            style: { ...inputBaseStyle, width: '100%' }
        })

        const resultsDropdown = $({
            tag: 'div',
            att: { id: resultsId },
            style: {
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '4px',
                marginTop: '4px',
                display: 'none',
                zIndex: '1000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }
        })

        let searchTimeout
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const searchTerm = e.target.value

            if (searchTerm.length < 2) {
                resultsDropdown.style.display = 'none'
                return
            }

            searchTimeout = setTimeout(async () => {
                const results = await searchResearchTitles(searchTerm)
                resultsDropdown.innerHTML = ''

                if (results.length === 0) {
                    resultsDropdown.appendChild($({
                        tag: 'div',
                        style: { padding: '12px', color: '#888', textAlign: 'center', fontSize: '13px' },
                        text: 'No matching accepted research found'
                    }))
                } else {
                    results.forEach(result => {
                        const item = $({
                            tag: 'div',
                            style: {
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #444',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({ tag: 'div', style: { color: '#fff', fontWeight: '500', fontSize: '14px' }, text: result.title }),
                                $({ tag: 'div', style: { color: '#aaa', fontSize: '12px', marginTop: '4px' }, text: `${result.author} • ${result.event}` })
                            ]
                        })

                        item.addEventListener('click', () => {
                            searchInput.value = result.title
                            hiddenResearchInput.value = result.id
                            hiddenEndorsementInput.value = result.endorsement_id
                            resultsDropdown.style.display = 'none'
                        })

                        item.addEventListener('mouseenter', () => item.style.backgroundColor = '#444')
                        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent')
                        resultsDropdown.appendChild(item)
                    })
                }
                resultsDropdown.style.display = 'block'
            }, 300)
        })

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) resultsDropdown.style.display = 'none'
        })

        container.appendChild(hiddenResearchInput)
        container.appendChild(hiddenEndorsementInput)
        container.appendChild(searchInput)
        container.appendChild(resultsDropdown)

        return container
    }

    const createPatentModal = (patent = null) => {
        const isEdit = !!patent
        const inputBaseStyle = {
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#1a2a3a',
            fontSize: '14px',
            width: '100%',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'Segoe UI, system-ui, sans-serif'
        }

        const labelStyle = {
            display: 'block',
            marginBottom: '6px',
            color: '#475569',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.3px'
        }

        const formGroupStyle = { marginBottom: '20px' }

        const createFormGroup = (label, input, span = 1, tooltip = null, customStyle = {}, groupId = null) => {
            if (!label) {
                return $({
                    tag: 'div',
                    att: groupId ? { id: groupId } : {},
                    style: { ...formGroupStyle, ...customStyle, gridColumn: span === 2 ? 'span 2' : 'auto', position: customStyle.zIndex ? 'relative' : 'static' },
                    child: [input]
                })
            }
            
            const labelChildren = [$({ tag: 'span', text: label })]

            if (tooltip) {
                labelChildren.push($({
                    tag: 'div',
                    att: { className: 'tooltip-container' },
                    child: [
                        $({ tag: 'i', att: { className: 'fa-solid fa-circle-question help-icon' } }),
                        $({ tag: 'div', att: { className: 'tooltip-text' }, text: tooltip })
                    ]
                }))
            }

            return $({
                tag: 'div',
                att: groupId ? { id: groupId } : {},
                style: { ...formGroupStyle, ...customStyle, gridColumn: span === 2 ? 'span 2' : 'auto', position: customStyle.zIndex ? 'relative' : 'static' },
                child: [
                    $({ tag: 'label', style: { ...labelStyle, display: 'flex', alignItems: 'center' }, child: labelChildren }),
                    input
                ]
            })
        }


        const renderDynamicFields = (type, data = null) => {
            const container = document.getElementById('dynamic-fields-container')
            if (!container) return

            container.innerHTML = ''
            container.className = 'dynamic-container'

            const grid = $({
                tag: 'div',
                att: { className: 'animate-fields form-grid' }
            })

            // Update Modal Title dynamically
            const modalTitleEl = document.getElementById('modal-title')
            if (modalTitleEl) {
                const typeLabel = typeOptions.find(opt => opt.value === type)?.label || 'IP Record'
                const isEdit = modalTitleEl.getAttribute('data-edit') === 'true'
                modalTitleEl.innerText = `${isEdit ? 'Edit' : 'New'} ${typeLabel}`
            }

            const sfx = type === 'utility_model' ? 'UM' : ''
            const statusName = 'status' + sfx
            const actualStatusOptions = statusOptions.filter(opt => type === 'patent' || opt.value !== 'downgrade')
            const initialStatusValue = (data?.status || data?.statusUM || 'filed')
            const isRegistered = initialStatusValue === 'registered'

            const statusField = $({
                tag: 'div',
                att: { className: 'radio-group' },
                style: {
                    display: 'flex',
                    gap: '12px',
                    padding: '4px 0',
                    flexWrap: 'wrap',
                    width: '100%'
                },
                child: actualStatusOptions.map(opt => {
                    const radioId = `status-${opt.value}`
                    const isChecked = initialStatusValue === opt.value
                    
                    // Map status colors with better contrast
                    const statusColors = {
                        filed: { 
                            bg: '#fef3c7', 
                            border: '#d97706', 
                            text: '#78350f', 
                            dot: '#d97706',
                            selectedBg: '#fbbf24',
                            hoverBg: '#fde68a'
                        },
                        registered: { 
                            bg: '#d1fae5', 
                            border: '#059669', 
                            text: '#064e3b', 
                            dot: '#059669',
                            selectedBg: '#34d399',
                            hoverBg: '#a7f3d0'
                        },
                        downgrade: { 
                            bg: '#fee2e2', 
                            border: '#dc2626', 
                            text: '#7f1d1d', 
                            dot: '#dc2626',
                            selectedBg: '#f87171',
                            hoverBg: '#fca5a5'
                        },
                        rejected: { 
                            bg: '#fee2e2', 
                            border: '#dc2626', 
                            text: '#7f1d1d', 
                            dot: '#dc2626',
                            selectedBg: '#f87171',
                            hoverBg: '#fca5a5'
                        },
                        verified: { 
                            bg: '#dbeafe', 
                            border: '#2563eb', 
                            text: '#1e3a5f', 
                            dot: '#2563eb',
                            selectedBg: '#60a5fa',
                            hoverBg: '#93c5fd'
                        }
                    }
                    
                    const colors = statusColors[opt.value] || statusColors.filed
                    
                    return $({
                        tag: 'div',
                        att: { className: 'radio-item' },
                        style: {
                            position: 'relative',
                            flex: '1 1 auto',
                            minWidth: '70px',
                            maxWidth: '150px',
                            display: 'flex',
                            alignItems: 'stretch'
                        },
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    type: 'radio',
                                    name: statusName,
                                    value: opt.value,
                                    id: radioId,
                                    checked: isChecked,
                                    required: true
                                },
                                style: {
                                    position: 'absolute',
                                    opacity: '0',
                                    width: '0',
                                    height: '0',
                                    pointerEvents: 'none'
                                },
                                event: {
                                    type: 'change',
                                    method: (e) => {
                                        const isVisible = e.target.value === 'registered'
                                        const regNoGroup = document.getElementById('reg-no-group')
                                        const regDateGroup = document.getElementById('reg-date-group')
                                        if (regNoGroup) regNoGroup.style.display = isVisible ? 'block' : 'none'
                                        if (regDateGroup) regDateGroup.style.display = isVisible ? 'block' : 'none'

                                        const regNoInput = regNoGroup?.querySelector('input')
                                        const regDateInput = regDateGroup?.querySelector('input')
                                        if (regNoInput) regNoInput.required = isVisible
                                        if (regDateInput) regDateInput.required = isVisible
                                        
                                        // Update visual state of all radio items
                                        const allRadioItems = document.querySelectorAll('.radio-item')
                                        allRadioItems.forEach(item => {
                                            const radio = item.querySelector('input[type="radio"]')
                                            const label = item.querySelector('.radio-label')
                                            if (radio && label) {
                                                if (radio.checked) {
                                                    const val = radio.value
                                                    const colorMap = {
                                                        filed: { bg: '#fef3c7', border: '#d97706', text: '#78350f', dot: '#d97706' },
                                                        registered: { bg: '#d1fae5', border: '#059669', text: '#064e3b', dot: '#059669' },
                                                        downgrade: { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', dot: '#dc2626' },
                                                        rejected: { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', dot: '#dc2626' },
                                                        verified: { bg: '#dbeafe', border: '#2563eb', text: '#1e3a5f', dot: '#2563eb' }
                                                    }
                                                    const c = colorMap[val] || colorMap.filed
                                                    label.style.background = c.bg
                                                    label.style.borderColor = c.border
                                                    label.style.color = c.text
                                                    label.style.boxShadow = `0 0 0 3px ${c.border}30`
                                                    // Update dot
                                                    const dot = item.querySelector('.status-dot')
                                                    if (dot) {
                                                        dot.style.backgroundColor = c.dot
                                                        dot.style.boxShadow = `0 0 10px ${c.dot}60`
                                                    }
                                                    // Show checkmark
                                                    const check = item.querySelector('.status-check')
                                                    if (check) {
                                                        check.style.opacity = '1'
                                                        check.style.transform = 'scale(1)'
                                                    }
                                                } else {
                                                    label.style.background = '#f1f5f9'
                                                    label.style.borderColor = '#e2e8f0'
                                                    label.style.color = '#475569'
                                                    label.style.boxShadow = 'none'
                                                    const dot = item.querySelector('.status-dot')
                                                    if (dot) {
                                                        dot.style.backgroundColor = '#cbd5e1'
                                                        dot.style.boxShadow = 'none'
                                                    }
                                                    const check = item.querySelector('.status-check')
                                                    if (check) {
                                                        check.style.opacity = '0'
                                                        check.style.transform = 'scale(0.5)'
                                                    }
                                                }
                                            }
                                        })
                                    }
                                }
                            }),
                            $({
                                tag: 'label',
                                att: { htmlFor: radioId, className: 'radio-label' },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '12px 18px',
                                    background: isChecked ? colors.bg : '#f1f5f9',
                                    border: `2px solid ${isChecked ? colors.border : '#e2e8f0'}`,
                                    borderRadius: '12px',
                                    color: isChecked ? colors.text : '#475569',
                                    fontSize: '13px',
                                    fontWeight: isChecked ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'center',
                                    boxShadow: isChecked ? `0 0 0 3px ${colors.border}25` : 'none',
                                    position: 'relative',
                                    userSelect: 'none',
                                    width: '100%',
                                    minHeight: '44px',
                                    flex: '1',
                                    boxSizing: 'border-box'
                                },
                                child: [
                                    // Status dot indicator
                                    $({
                                        tag: 'span',
                                        att: { className: 'status-dot' },
                                        style: {
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: isChecked ? colors.dot : '#cbd5e1',
                                            display: 'inline-block',
                                            flexShrink: '0',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isChecked ? `0 0 10px ${colors.dot}50` : 'none'
                                        }
                                    }),
                                    // Status label
                                    $({
                                        tag: 'span',
                                        text: opt.label,
                                        style: {
                                            fontWeight: isChecked ? '600' : '500',
                                            letterSpacing: '0.2px',
                                            flex: '1',
                                            textAlign: 'center'
                                        }
                                    }),
                                    // Checkmark for selected state
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-check status-check' },
                                        style: {
                                            fontSize: '12px',
                                            color: colors.border,
                                            marginLeft: '4px',
                                            opacity: isChecked ? '1' : '0',
                                            transform: isChecked ? 'scale(1)' : 'scale(0.5)',
                                            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            display: 'inline-block',
                                            flexShrink: '0'
                                        }
                                    })
                                ].filter(Boolean)
                            })
                        ],
                        event: {
                            type: 'mouseenter',
                            method: (e) => {
                                const label = e.currentTarget.querySelector('.radio-label')
                                const radio = e.currentTarget.querySelector('input[type="radio"]')
                                if (label && !radio?.checked) {
                                    label.style.borderColor = '#94a3b8'
                                    label.style.background = '#f8fafc'
                                    label.style.transform = 'translateY(-2px)'
                                    label.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                                }
                            },
                            type2: 'mouseleave',
                            method2: (e) => {
                                const label = e.currentTarget.querySelector('.radio-label')
                                const radio = e.currentTarget.querySelector('input[type="radio"]')
                                if (label && !radio?.checked) {
                                    label.style.borderColor = '#e2e8f0'
                                    label.style.background = '#f1f5f9'
                                    label.style.transform = 'translateY(0)'
                                    label.style.boxShadow = 'none'
                                }
                            }
                        }
                    })
                })
            })
            const selectedCampus = data?.campus || data?.campusUM || ''
            const campusSelect = $({
                tag: 'select',
                att: { name: 'campus' + sfx, required: true },
                style: { ...inputBaseStyle, appearance: 'none', cursor: 'pointer' },
                child: [
                    $({
                        tag: 'option',
                        att: { value: '', disabled: true, selected: selectedCampus === '' },
                        text: 'Select Campus'
                    }),
                    ...campusOptions.map(camp => $({
                        tag: 'option',
                        att: {
                            value: camp,
                            selected: selectedCampus === camp
                        },
                        text: camp
                    }))
                ],
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.target.style.borderColor = '#3b82f6'
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                    }
                }
            })

            const regNoField = $({
                tag: 'input',
                att: { type: 'text', name: 'registrationNumber', value: data?.registrationNumber || data?.registrationNumberUM || '', required: isRegistered },
                style: inputBaseStyle,
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.target.style.borderColor = '#3b82f6'
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                    }
                }
            })
            const regDateField = $({
                tag: 'input',
                att: { type: 'date', name: 'registrationDate', value: data?.registrationDate || data?.registrationDateUM || '', required: isRegistered },
                style: inputBaseStyle,
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.target.style.borderColor = '#3b82f6'
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                    }
                }
            })

            const regNoGroup = createFormGroup('Registration Number', regNoField, 1, null, { display: isRegistered ? 'block' : 'none' }, 'reg-no-group')
            const regDateGroup = createFormGroup('Registration Date', regDateField, 1, null, { display: isRegistered ? 'block' : 'none' }, 'reg-date-group')

            if (type === 'patent' || type === 'utility_model' || type === 'industrial_design') {

                // Shared fields for Tech-heavy IPR
                const isID = type === 'industrial_design'
                const isUM = type === 'utility_model'
                const sfx = isUM ? 'UM' : ''

                // For new records, fetch the next case number automatically
                let caseNumberValue = data?.['caseNumber' + sfx] || data?.caseNumber || ''

                const caseNumberInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'caseNumber' + sfx, placeholder: 'CAPSU IPMO 2026-001', value: caseNumberValue, required: true },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    },
                    elementHandler: async (el) => {
                        // Auto-fetch next case number for new records
                        if (!data && !caseNumberValue) {
                            try {
                                const formData = new FormData()
                                formData.append('action', 'get_next_case_number')
                                formData.append('type', type)

                                const response = await fetch('/server/rde/patent.php', { method: 'POST', body: formData })
                                const result = await response.json()

                                if (result.success && result.next_case) {
                                    el.value = result.next_case
                                }
                            } catch (error) {
                                console.error('Failed to fetch next case number:', error)
                            }
                        }
                    }
                })

                grid.appendChild(createFormGroup('Case Number (CAPSU IPMO Year-000)', caseNumberInput))

                grid.appendChild(createFormGroup('Research Title Search', createTitleSearchField(inputBaseStyle), 1,
                    'Linking your IP record to a research title in the database automatically fetches the research title. Type at least 2 characters to see suggestions.',
                    { zIndex: 1000 }
                ))

                const titleLabel = isID ? 'ID Title' : 'Technology Name'
                const titleField = isID ? 'idTitle' : ('technologyName' + sfx)
                const titleInput = $({
                    tag: 'input',
                    att: { type: 'text', name: titleField, required: true, value: data?.[titleField] || data?.technologyName || data?.productName || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup(titleLabel, titleInput))

                const inventorsLabel = isID ? 'Invertor/s' : 'Inventor/s'
                const inventorsField = isID ? 'invertors' : ('inventors' + sfx)
                const inventorsInput = $({
                    tag: 'input',
                    att: { type: 'text', name: inventorsField, required: true, value: data?.[inventorsField] || data?.inventors || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup(inventorsLabel, inventorsInput))

                grid.appendChild(createFormGroup('Campus', campusSelect))

                const agentInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'agent' + sfx, value: data?.['agent' + sfx] || data?.agent || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Agent', agentInput))

                const appDateField = isID ? 'applicationDate' : ('applicationDate' + sfx)
                const appDateInput = $({
                    tag: 'input',
                    att: { type: 'date', name: appDateField, required: true, value: data?.[appDateField] || data?.applicationDate || data?.filingDate || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Application / Filing Date', appDateInput))

                const appNumField = isID ? 'applicationNumber' : ('applicationNumber' + sfx)
                const appNumInput = $({
                    tag: 'input',
                    att: { type: 'text', name: appNumField, required: true, value: data?.[appNumField] || data?.applicationNumber || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Application Number', appNumInput))

                const pubDateField = isID ? 'publicationDate' : ('publicationDate' + sfx)
                const pubDateInput = $({
                    tag: 'input',
                    att: { type: 'date', name: pubDateField, required: true, value: data?.[pubDateField] || data?.publicationDate || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Publication / Issued Date', pubDateInput))

                const benefitingIndustryField = isID ? null : ('benefitingIndustry' + sfx)
                if (benefitingIndustryField) {
                    const benefitingInput = $({
                        tag: 'input',
                        att: { type: 'text', name: benefitingIndustryField, value: data?.[benefitingIndustryField] || '' },
                        style: inputBaseStyle,
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#3b82f6'
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e2e8f0'
                                e.target.style.boxShadow = 'none'
                            }
                        }
                    })
                    grid.appendChild(createFormGroup('Benefiting Industry', benefitingInput))
                }

                grid.appendChild(createFormGroup('Status', statusField))

                grid.appendChild(regNoGroup)
                grid.appendChild(regDateGroup)

                // File upload section
                grid.appendChild($({
                    tag: 'div',
                    style: {
                        gridColumn: 'span 2',
                        marginTop: '20px',
                        marginBottom: '10px',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fa-solid fa-file-arrow-up' },
                            style: { color: '#3b82f6', fontSize: '18px' }
                        }),
                        $({
                            tag: 'h4',
                            text: 'Upload Files (Cloud Storage)',
                            style: {
                                margin: '0',
                                color: '#1e293b',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: '600'
                            }
                        })
                    ]
                }))

                const fileFields = [
                    { label: 'Application Form', name: (isID ? 'application_form_file' : 'patentFormURL' + sfx + '_file'), db_url: (isID ? 'applicationFormURL' : 'patentFormURL' + sfx), accept: '.pdf' },
                    { label: 'Abstract', name: 'abstractURL' + sfx + '_file', db_url: 'abstractURL' + sfx, accept: '.pdf' },
                    { label: 'Claims', name: 'claimsURL' + sfx + '_file', db_url: 'claimsURL' + sfx, accept: '.pdf' },
                    { label: 'Technical Description', name: 'technicalDescriptionURL' + sfx + '_file', db_url: 'technicalDescriptionURL' + sfx, accept: '.pdf' },
                    { label: 'Technical Drawing/s', name: 'technicalDrawingURL' + sfx + '_file', db_url: 'technicalDrawingURL' + sfx, accept: '.png, .jpg, .jpeg, .gif, .webp' },
                    { label: 'Photo of the Technology', name: 'photoTechnologyURL' + sfx + '_file', db_url: 'photoTechnologyURL' + sfx, accept: '.png, .jpg, .jpeg, .gif, .webp' },
                ]

                fileFields.forEach(f => {
                    const currentUrl = data ? data[f.db_url] : null
                    
                    const uploader = DragDropUpload({
                        label: f.label, 
                        accept: f.accept,
                        required: !currentUrl && (isID || type === 'patent' || type === 'utility_model'),
                        currentFiles: currentUrl ? [currentUrl] : [],
                        maxSizeMB: 10,
                        description: `Drop your ${f.label.toLowerCase()} here or click to browse`,
                        onFileSelect: async (files, allFiles) => {
                            const file = files[0]
                            if (!file) return
                            
                            if (f.accept === '.pdf') {
                                const check = await ValidatePDF(file)
                                if (!check.valid) {
                                    alert(`File Validation Failed: ${check.error}`)
                                    uploader.clearFiles()
                                    return
                                }
                            }
                            
                            showNotification(`${f.label} uploaded: ${file.name}`, 'info')
                        },
                        onFileRemove: (file, index, allFiles) => {
                            showNotification(`${f.label} removed`, 'info')
                        },
                        onFileView: (file) => {
                            openFileViewer(file, typeof file === 'string' ? file.split('/').pop() : file.name);
                        }
                    })
                    
                    // Pass null as label to avoid duplicate
                    grid.appendChild(createFormGroup(null, uploader.element))
                })
            } else if (type === 'copyright') {
                const titleInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'title', required: true, value: data?.title || data?.productName || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Title', titleInput, 2))

                const authorInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'author', required: true, value: data?.author || data?.inventors || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Author/s', authorInput, 2))

                grid.appendChild(createFormGroup('Campus', campusSelect))

                const appDateInput = $({
                    tag: 'input',
                    att: { type: 'date', name: 'applicationDate', required: true, value: data?.applicationDate || data?.filingDate || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Application / Filing Date', appDateInput))

                grid.appendChild(createFormGroup('Class of Work', (() => {
                    const selectedVal = data?.classOfWork || ''
                    const selectedOption = classOfWorkOptions.find(o => o.label === selectedVal) || { label: 'Select Class...', desc: 'Please choose classification' }

                    const trigger = $({
                        tag: 'div',
                        att: { className: 'custom-select-trigger', id: 'class-work-trigger' },
                        style: {
                            ...inputBaseStyle,
                            height: 'auto',
                            minHeight: '45px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            backgroundColor: '#f8fafc'
                        },
                        child: [
                            $({
                                tag: 'div',
                                att: { className: 'option-label' },
                                text: selectedOption.label,
                                style: { color: '#1a2a3a', fontWeight: '600', fontSize: '14px' }
                            }),
                            $({
                                tag: 'div',
                                att: { className: 'option-desc' },
                                text: selectedOption.desc,
                                style: { color: '#64748b', fontSize: '11px', marginTop: '2px' }
                            })
                        ]
                    })

                    const hiddenInput = $({ tag: 'input', att: { type: 'hidden', name: 'classOfWork', required: true, value: selectedVal } })

                    const optionsList = $({
                        tag: 'div',
                        att: { className: 'custom-options-list' },
                        style: {
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            right: '0',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            marginTop: '8px',
                            maxHeight: '350px',
                            overflowY: 'auto',
                            zIndex: '1020',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02)',
                            display: 'none'
                        },
                        child: classOfWorkOptions.map(opt => $({
                            tag: 'div',
                            att: { className: 'custom-option' },
                            style: {
                                padding: '12px 16px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: { className: 'option-label' },
                                    text: opt.label,
                                    style: { color: '#1a2a3a', fontWeight: '600', fontSize: '14px' }
                                }),
                                $({
                                    tag: 'div',
                                    att: { className: 'option-desc' },
                                    text: opt.desc,
                                    style: { color: '#64748b', fontSize: '11px', marginTop: '2px' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    trigger.querySelector('.option-label').innerText = opt.label
                                    trigger.querySelector('.option-desc').innerText = opt.desc
                                    hiddenInput.value = opt.label
                                    container.classList.remove('open')
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                }
                            }
                        }))
                    })

                    const container = $({
                        tag: 'div',
                        att: { className: 'custom-select-container' },
                        style: { position: 'relative', width: '100%' },
                        child: [trigger, hiddenInput, optionsList],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                container.classList.toggle('open')
                                if (container.classList.contains('open')) {
                                    optionsList.style.display = 'block'
                                } else {
                                    optionsList.style.display = 'none'
                                }
                                document.addEventListener('click', () => {
                                    container.classList.remove('open')
                                    optionsList.style.display = 'none'
                                }, { once: true })
                            }
                        }
                    })

                    return container
                })(), 1, null, { zIndex: 1000 }))

                grid.appendChild(createFormGroup('Status', statusField))
                grid.appendChild(regNoGroup)
                grid.appendChild(regDateGroup)
                grid.appendChild($({
                    tag: 'div',
                    style: {
                        gridColumn: 'span 2',
                        marginTop: '20px',
                        marginBottom: '10px',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fa-solid fa-file-arrow-up' },
                            style: { color: '#3b82f6', fontSize: '18px' }
                        }),
                        $({
                            tag: 'h4',
                            text: 'Upload Files (Cloud Storage)',
                            style: {
                                margin: '0',
                                color: '#1e293b',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: '600'
                            }
                        })
                    ]
                }))

                const fileFields = [
                    { label: 'Photo of works', name: 'photo_works_file', db_url: 'photoWorksURL', accept: '.png, .jpg, .jpeg, .gif, .webp' },
                    { label: 'Copyright Forms', name: 'copyright_forms_file', db_url: 'copyrightFormsURL', accept: '.pdf' },
                    { label: 'Supplemental Document (Optional)', name: 'supplemental_file', db_url: 'supplementalDocumentURL', accept: '.pdf' },
                    { label: 'Deed of Assignment', name: 'deed_assignment_file', db_url: 'deedAssignmentURL', accept: '.pdf' },
                    { label: 'Affidavit of Ownership', name: 'affidavit_file', db_url: 'affidavitOwnershipURL', accept: '.pdf' },
                    { label: 'IDs of Authors', name: 'ids_authors_file', db_url: 'idAuthorURL', accept: '.pdf,.png,.jpg,.jpeg' },
                    { label: 'Creative Works (Original Specimen)', name: 'creative_work_file', db_url: 'creativeWorksURL', accept: '.pdf,.png,.jpg,.jpeg' }
                ]

                fileFields.forEach(f => {
                    const currentUrl = data ? data[f.db_url] : null
                    
                    const uploader = DragDropUpload({
                        label: f.label,
                        accept: f.accept,
                        required: false,
                        currentFiles: currentUrl ? [currentUrl] : [],
                        maxSizeMB: 10,
                        description: `Drop your ${f.label.toLowerCase()} here or click to browse`,
                        onFileSelect: async (files, allFiles) => {
                            const file = files[0]
                            if (!file) return
                            
                            if (f.accept === '.pdf') {
                                const check = await ValidatePDF(file)
                                if (!check.valid) {
                                    alert(`File Validation Failed: ${check.error}`)
                                    uploader.clearFiles()
                                    return
                                }
                            }
                            
                            showNotification(`${f.label} uploaded: ${file.name}`, 'info')
                        },
                        onFileRemove: () => {
                            showNotification(`${f.label} removed`, 'info')
                        },
                        onFileView: (file) => {
                            openFileViewer(file, typeof file === 'string' ? file.split('/').pop() : file.name);
                        }
                    })
                    
                    grid.appendChild(createFormGroup(null, uploader.element))
                })
            } else if (type === 'trademark') {
                const titleInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'title', required: true, value: data?.title || data?.productName || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Title', titleInput, 2))

                const registrantInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'registrant', required: true, value: data?.registrant || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Registrant', registrantInput))

                const appDateInput = $({
                    tag: 'input',
                    att: { type: 'date', name: 'applicationDate', required: true, value: data?.applicationDate || data?.filingDate || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Application / Filing Date', appDateInput))

                const appNumInput = $({
                    tag: 'input',
                    att: { type: 'text', name: 'applicationNumber', required: true, value: data?.applicationNumber || '' },
                    style: inputBaseStyle,
                    event: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        },
                        type2: 'blur',
                        method2: (e) => {
                            e.target.style.borderColor = '#e2e8f0'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
                grid.appendChild(createFormGroup('Application Number', appNumInput))

                grid.appendChild(createFormGroup('Status', statusField))
                grid.appendChild(regNoGroup)
                grid.appendChild(regDateGroup)

                // File upload section
                grid.appendChild($({
                    tag: 'div',
                    style: {
                        gridColumn: 'span 2',
                        marginTop: '20px',
                        marginBottom: '10px',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fa-solid fa-file-arrow-up' },
                            style: { color: '#3b82f6', fontSize: '18px' }
                        }),
                        $({
                            tag: 'h4',
                            text: 'Upload Files (Cloud Storage)',
                            style: {
                                margin: '0',
                                color: '#1e293b',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: '600'
                            }
                        })
                    ]
                }))

                const fileFields = [
                    { label: 'Trademark Application Form', name: 'trademark_form_file', db_url: 'trademarkFormURL', accept: '.pdf' },
                    { label: 'Photo of the Trademark', name: 'photo_trademark_file', db_url: 'photoTrademarkURL', accept: '.png, .jpg, .jpeg, .gif, .webp' }
                ]

                fileFields.forEach(f => {
                    const currentUrl = data ? data[f.db_url] : null
                    
                    const uploader = DragDropUpload({
                        label: f.label,
                        accept: f.accept,
                        required: false,
                        currentFiles: currentUrl ? [currentUrl] : [],
                        maxSizeMB: 10,
                        description: `Drop your ${f.label.toLowerCase()} here or click to browse`,
                        onFileSelect: async (files, allFiles) => {
                            const file = files[0]
                            if (!file) return
                            
                            if (f.accept === '.pdf') {
                                const check = await ValidatePDF(file)
                                if (!check.valid) {
                                    alert(`File Validation Failed: ${check.error}`)
                                    uploader.clearFiles()
                                    return
                                }
                            }
                            
                            showNotification(`${f.label} uploaded: ${file.name}`, 'info')
                        },
                        onFileRemove: () => {
                            showNotification(`${f.label} removed`, 'info')
                        },
                        onFileView: (file) => {
                            openFileViewer(file, typeof file === 'string' ? file.split('/').pop() : file.name);
                        }
                    })
                    
                    grid.appendChild(createFormGroup(null, uploader.element))
                })
            }

            // Description and Image at the bottom (for others)
            const hasTechnicalUploads = ['patent', 'utility_model', 'industrial_design', 'copyright', 'trademark'].includes(type)
            const bottomGrid = $({
                tag: 'div',
                att: { className: 'animate-fields description-container' },
                style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                child: [
                    !hasTechnicalUploads ? $({
                        tag: 'div',
                        child: [
                            $({
                                tag: 'div',
                                style: { display: 'flex', flexDirection: 'column', gap: '10px' },
                                child: [
                                    (() => {
                                        const currentPhoto = data?.image || null
                                        const uploader = DragDropUpload({
                                            label: 'Resource Photo',
                                            accept: '.png, .jpg, .jpeg, .gif, .webp',
                                            required: false,
                                            currentFiles: currentPhoto ? [currentPhoto] : [],
                                            maxSizeMB: 5,
                                            description: 'Drop your photo here or click to browse',
                                            onFileSelect: (files) => {
                                                const file = files[0]
                                                if (file) {
                                                    showNotification(`Photo uploaded: ${file.name}`, 'info')
                                                }
                                            },
                                            onFileRemove: () => {
                                                const hiddenInput = document.querySelector('input[name="current_image"]')
                                                if (hiddenInput) {
                                                    hiddenInput.value = ''
                                                }
                                                showNotification('Photo removed', 'info')
                                            }
                                        })
                                        
                                        const hiddenCurrentInput = data?.image ? $({
                                            tag: 'input',
                                            att: {
                                                type: 'hidden',
                                                name: 'current_image',
                                                value: data.image
                                            }
                                        }) : null
                                        
                                        return $({
                                            tag: 'div',
                                            child: [
                                                hiddenCurrentInput,
                                                uploader.element
                                            ].filter(Boolean)
                                        })
                                    })()
                                ]
                            })
                        ]
                    }) : null
                ].filter(Boolean)
            })

            container.appendChild(grid)
            container.appendChild(bottomGrid)
        }

        const overlay = $({
            tag: 'div',
            att: { id: 'patent-modal-overlay' },
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '1010',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        width: '92%',
                        maxWidth: '820px',
                        maxHeight: '92vh',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    },
                    child: [
                        // Modal Header
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 32px',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: { display: 'flex', alignItems: 'center', gap: '15px' },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: `fa-solid ${isEdit ? 'fa-edit' : 'fa-plus-circle'}` },
                                            style: { color: '#3b82f6', fontSize: '24px' }
                                        }),
                                        $({
                                            tag: 'h2',
                                            att: { id: 'modal-title', 'data-edit': isEdit ? 'true' : 'false' },
                                            text: isEdit ? 'Edit Record' : 'New Record',
                                            style: {
                                                color: '#0f172a',
                                                fontSize: '20px',
                                                fontWeight: '600',
                                                margin: '0',
                                                letterSpacing: '-0.3px'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'button',
                                    att: { className: 'fa-solid fa-xmark' },
                                    style: {
                                        backgroundColor: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#64748b',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#fee2e2'
                                            e.target.style.color = '#ef4444'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = '#f1f5f9'
                                            e.target.style.color = '#64748b'
                                        }
                                    }
                                })
                            ]
                        }),
                        // Modal Body (Scrollable)
                        $({
                            tag: 'div',
                            style: {
                                padding: '32px',
                                overflowY: 'auto',
                                flex: '1',
                                backgroundColor: '#ffffff'
                            },
                            child: [
                                $({
                                    tag: 'form',
                                    att: { id: 'patent-form' },
                                    child: [
                                        // IPR Type Dropdown (Top - determines other fields)
                                        $({
                                            tag: 'div',
                                            style: formGroupStyle,
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    style: labelStyle,
                                                    text: 'Intellectual Property Rights Type'
                                                }),
                                                $({
                                                    tag: 'select',
                                                    att: { name: 'type', required: true },
                                                    style: {
                                                        ...inputBaseStyle,
                                                        appearance: 'none',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#f8fafc'
                                                    },
                                                    child: typeOptions.map(opt => $({
                                                        tag: 'option',
                                                        att: {
                                                            value: opt.value,
                                                            selected: patent?.type === opt.value
                                                        },
                                                        text: opt.label
                                                    })),
                                                    event: {
                                                        type: 'change',
                                                        method: (e) => {
                                                            renderDynamicFields(e.target.value, patent)
                                                        },
                                                        type2: 'focus',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#3b82f6'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                        },
                                                        type3: 'blur',
                                                        method3: (e) => {
                                                            e.target.style.borderColor = '#e2e8f0'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        // Container for dynamic fields
                                        $({
                                            tag: 'div',
                                            att: { id: 'dynamic-fields-container' },
                                            style: { position: 'relative' },
                                            elementHandler: (el) => {
                                                // Initial render
                                                setTimeout(() => {
                                                    renderDynamicFields(patent?.type || 'patent', patent)
                                                }, 0)
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        // Modal Footer
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 32px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: '#f8fafc'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: '1px solid #e2e8f0',
                                        color: '#475569',
                                        padding: '10px 24px',
                                        borderRadius: '30px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#f1f5f9'
                                            e.target.style.borderColor = '#cbd5e1'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.borderColor = '#e2e8f0'
                                        }
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: isEdit ? 'Update Record' : 'Save Record',
                                    style: {
                                        backgroundColor: '#3b82f6',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '10px 32px',
                                        borderRadius: '30px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: async (e) => {
                                            const btn = e.target
                                            const originalText = btn.textContent
                                            btn.disabled = true
                                            btn.textContent = 'Saving...'

                                            const form = document.getElementById('patent-form')
                                            const formData = new FormData(form)
                                            formData.append('action', isEdit ? 'update' : 'save')
                                            if (isEdit) formData.append('id', patent.id)

                                            try {
                                                const response = await fetch('/patentresearch', {
                                                    method: 'POST',
                                                    body: formData
                                                })
                                                const result = await response.json()
                                                if (result.success) {
                                                    closeModal()
                                                    loadPatents()
                                                } else {
                                                    alert('Error: ' + result.message)
                                                }
                                            } catch (err) {
                                                console.error(err)
                                                alert('Network error occurred.')
                                            } finally {
                                                btn.disabled = false
                                                btn.textContent = originalText
                                            }
                                        },
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#2563eb'
                                            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)'
                                            e.target.style.transform = 'translateY(-1px)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = '#3b82f6'
                                            e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)'
                                            e.target.style.transform = 'translateY(0)'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1'
        }, 10)

        return overlay
    }

    const loadPatents = async () => {
        try {
            const formData = new FormData()
            formData.append('action', 'getAll')
            if (currentSearch) formData.append('search', currentSearch)
            if (currentType) formData.append('type', currentType)

            const response = await fetch('/patentresearch', {
                method: 'POST',
                body: formData
            })
            const result = await response.json()

            if (result.success) {
                updateTableDisplay(result.data)
                // Also update stats since we have new data
                updateStats(result.data)
            }
        } catch (error) {
            console.error('Error loading records:', error)
        }
    }

    const updateTableDisplay = (data) => {
        if (!tableBody) return
        tableBody.innerHTML = ''

        const recordCountEl = document.querySelector('.record-count')
        if (recordCountEl) recordCountEl.textContent = `${data.length} records`

        if (data.length === 0) {
            tableBody.appendChild(createEmptyState())
        } else {
            data.forEach(item => {
                tableBody.appendChild(createPatentRow(item))
            })
        }
    }

    const createPatentRow = (item) => {
        const row = $({
            tag: 'tr',
            style: {
                transition: 'background 0.2s ease',
                backgroundColor: '#ffffff'
            },
            event: {
                type: 'mouseenter',
                method: (e) => e.currentTarget.style.backgroundColor = '#f8fafc',
                type2: 'mouseleave',
                method2: (e) => e.currentTarget.style.backgroundColor = '#ffffff'
            },
            child: columns.map(col => {
                let content = item[col.field] || '—'
                const style = {
                    padding: '14px 12px',
                    fontSize: '13px',
                    color: '#1a2a3a',
                    borderBottom: '1px solid #e8ecf0',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Segoe UI, sans-serif',
                    maxWidth: col.width,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: 'transparent'
                }

                // Smart Mapping for different record types
                if (col.field === 'type') {
                    content = createTypeBadge(item.type)
                } else if (col.field === 'status') {
                    content = createStatusBadge(item.status || item.statusUM)
                } else if (col.field === 'technologyName') {
                    content = item.technologyName || item.technologyNameUM || item.idTitle || item.title || item.productName || '—'
                } else if (col.field === 'caseNumber') {
                    content = item.caseNumber || item.caseNumberUM || '—'
                } else if (col.field === 'applicationNumber') {
                    content = item.applicationNumber || item.applicationNumberUM || '—'
                } else if (col.field === 'applicationDate') {
                    const date = item.applicationDate || item.applicationDateUM || item.filingDate || '—'
                    content = formatPatentDate(date)
                } else if (col.field === 'publicationDate') {
                    const date = item.publicationDate || item.publicationDateUM || '—'
                    content = formatPatentDate(date)
                } else if (col.field === 'inventors') {
                    content = item.inventors || item.inventorsUM || item.invertors || item.author || '—'
                } else if (col.field === 'campus') {
                    content = item.campus || item.campusUM || '—'
                } else if (col.field === 'actions') {
                    content = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                        },
                        child: [
                            // Edit Button
                            $({
                                tag: 'button',
                                att: { title: 'Edit Record' },
                                style: {
                                    backgroundColor: '#e8f0fe',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#1a73e8',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-pen' },
                                        style: { fontSize: '13px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Edit',
                                        style: { fontSize: '12px' }
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.stopPropagation()
                                        const modal = createPatentModal(item)
                                        document.body.appendChild(modal)
                                        setTimeout(() => {
                                            const overlay = document.getElementById('patent-modal-overlay')
                                            if (overlay) overlay.style.opacity = '1'
                                        }, 10)
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#d2e3fc'
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 115, 232, 0.15)'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#e8f0fe'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }
                                }
                            }),
                            // Delete Button
                            $({
                                tag: 'button',
                                att: { title: 'Delete Record' },
                                style: {
                                    backgroundColor: '#fce8e6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#d93025',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-trash' },
                                        style: { fontSize: '13px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Delete',
                                        style: { fontSize: '12px' }
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: async (e) => {
                                        e.stopPropagation()
                                        const confirmed = await DeleteConfirmModal(
                                            `Delete ${item.type.replace('_', ' ')}?`,
                                            `Are you sure you want to delete this record? This will also MOVE all its associated files in Google Drive to TRASH.`
                                        )
                                        if (confirmed) {
                                            const fd = new FormData()
                                            fd.append('action', 'delete')
                                            fd.append('id', item.id)
                                            fd.append('type', item.type)
                                            const resp = await fetch('/patentresearch', { method: 'POST', body: fd })
                                            const res = await resp.json()
                                            if (res.success) loadPatents()
                                        }
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#fad2cf'
                                        e.currentTarget.style.transform = 'translateY(-1px)'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(217, 48, 37, 0.15)'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#fce8e6'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }
                                }
                            })
                        ]
                    })
                }

                if (typeof content === 'string') {
                    return $({ tag: 'td', style, text: content })
                } else {
                    return $({ tag: 'td', style, child: [content].flat() })
                }
            })
        })
        return row
    }

    const createEmptyState = () => {
        return $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: { 
                        padding: '0',
                        backgroundColor: 'transparent'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'empty-state' },
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '400px',
                                width: '100%',
                                fontFamily: 'Segoe UI, sans-serif',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
                                padding: '40px 20px',
                                boxSizing: 'border-box',
                                margin: '20px auto'
                            },
                            child: [
                                // Icon Container
                                $({
                                    tag: 'div',
                                    style: {
                                        position: 'relative',
                                        width: '200px',
                                        height: '200px',
                                        marginBottom: '28px'
                                    },
                                    child: [
                                        // Certificate Icon
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-certificate' },
                                            style: {
                                                fontSize: '100px',
                                                color: '#3b82f6',
                                                opacity: 0.12,
                                                position: 'absolute',
                                                left: '10px',
                                                top: '10px',
                                                transform: 'rotate(-12deg)'
                                            }
                                        }),
                                        // Gears Icon
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-gears' },
                                            style: {
                                                fontSize: '80px',
                                                color: '#10b981',
                                                opacity: 0.12,
                                                position: 'absolute',
                                                right: '-5px',
                                                bottom: '15px',
                                                transform: 'rotate(15deg)'
                                            }
                                        }),
                                        // Trophy Icon
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-trophy' },
                                            style: {
                                                fontSize: '60px',
                                                color: '#f59e0b',
                                                opacity: 0.15,
                                                position: 'absolute',
                                                left: '-10px',
                                                bottom: '25px',
                                                transform: 'rotate(-20deg)'
                                            }
                                        }),
                                        // Center Badge
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: '#1a2a3a',
                                                backgroundColor: '#f1f5f9',
                                                padding: '10px 20px',
                                                borderRadius: '30px',
                                                border: '2px solid #e2e8f0',
                                                whiteSpace: 'nowrap',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                letterSpacing: '0.5px'
                                            },
                                            text: 'IP'
                                        }),
                                        // Decorative Ring
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '160px',
                                                height: '160px',
                                                borderRadius: '50%',
                                                border: '2px dashed #e2e8f0',
                                                opacity: 0.4,
                                                animation: 'spin 20s linear infinite'
                                            }
                                        })
                                    ]
                                }),
                                // Title
                                $({
                                    tag: 'div',
                                    text: 'No IP Records Found',
                                    style: {
                                        fontSize: '24px',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#0f172a',
                                        letterSpacing: '-0.5px'
                                    }
                                }),
                                // Subtitle
                                $({
                                    tag: 'div',
                                    text: 'Patents, utility models, industrial designs, and inventions',
                                    style: {
                                        fontSize: '15px',
                                        color: '#64748b',
                                        textAlign: 'center',
                                        lineHeight: '1.6'
                                    }
                                }),
                                // Description
                                $({
                                    tag: 'div',
                                    text: 'with intellectual property protection will be displayed here',
                                    style: {
                                        fontSize: '15px',
                                        color: '#64748b',
                                        marginBottom: '30px',
                                        textAlign: 'center'
                                    }
                                }),
                                // Add IP Record Button
                                $({
                                    tag: 'button',
                                    text: '+ Add IP Record',
                                    style: {
                                        padding: '12px 32px',
                                        backgroundColor: '#3b82f6',
                                        border: 'none',
                                        borderRadius: '30px',
                                        color: '#ffffff',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-plus-circle' },
                                            style: { fontSize: '16px' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Add IP Record'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation()
                                            openAddPatentModal()
                                        },
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.currentTarget.style.backgroundColor = '#2563eb'
                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.currentTarget.style.backgroundColor = '#3b82f6'
                                            e.currentTarget.style.transform = 'translateY(0)'
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    const getTableBody = (el) => {
        tableBody = el
        loadPatents()
    }

    const createStatusBadge = (status) => {
        const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0]

        return $({
            tag: 'span',
            att: { className: `status-badge status-${status}` },
            style: {
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                backgroundColor: `${statusConfig.color}15`,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.color}30`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
            },
            text: statusConfig.label
        })
    }

    const createTypeBadge = (type) => {
        const typeConfig = typeOptions.find(t => t.value === type) || typeOptions[0]

        // Color mapping for different types
        const typeColors = {
            patent: { bg: '#e8f0fe', color: '#1a73e8', iconColor: '#1a73e8' },
            utility_model: { bg: '#e8f5e9', color: '#2e7d32', iconColor: '#2e7d32' },
            copyright: { bg: '#fce8e6', color: '#d93025', iconColor: '#d93025' },
            industrial_design: { bg: '#fff8e1', color: '#e65100', iconColor: '#e65100' },
            trademark: { bg: '#f3e5f5', color: '#7b1fa2', iconColor: '#7b1fa2' }
        }

        const colors = typeColors[type] || { bg: '#f1f3f4', color: '#5f6368', iconColor: '#5f6368' }

        return $({
            tag: 'span',
            att: { className: `type-badge type-${type}` },
            style: {
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.color}25`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${typeConfig.icon}` },
                    style: { 
                        fontSize: '12px', 
                        color: colors.iconColor,
                        opacity: 0.8
                    }
                }),
                $({
                    tag: 'span',
                    text: typeConfig.label
                })
            ]
        })
    }

    const FilterBar = () => {
        return $({
            tag: 'div',
            att: { className: 'filter-bar' },
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e8ecf0',
                flexWrap: 'wrap',
                gap: '15px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-invoice' },
                                    style: { color: '#3b82f6', fontSize: '24px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Intellectual Property Records',
                                    style: {
                                        color: '#0f172a',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        margin: '0',
                                        letterSpacing: '-0.5px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'record-count' },
                                    style: {
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #e2e8f0',
                                        fontWeight: '500'
                                    },
                                    text: '0 records'
                                })
                            ]
                        }),
                        // Filter buttons
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '6px',
                                backgroundColor: '#f8fafc',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                flexWrap: 'wrap'
                            },
                            child: [
                                'All', 'Patent', 'Utility Model', 'Copyright', 'Industrial Design', 'Trademark'
                            ].map(type => {
                                const val = type === 'All' ? '' : type.toLowerCase().replace(' ', '_')
                                const isActive = currentType === val

                                return $({
                                    tag: 'button',
                                    text: type,
                                    att: { className: `filter-btn-${val || 'all'}` },
                                    style: {
                                        backgroundColor: isActive ? '#3b82f6' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 18px',
                                        color: isActive ? '#ffffff' : '#475569',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            currentType = val
                                            // Refresh all buttons in this horizontal bar
                                            const parent = e.target.parentElement
                                            Array.from(parent.children).forEach(btn => {
                                                btn.style.backgroundColor = 'transparent'
                                                btn.style.color = '#475569'
                                            })
                                            e.target.style.backgroundColor = '#3b82f6'
                                            e.target.style.color = '#ffffff'

                                            loadPatents()
                                        },
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            if (!isActive) {
                                                e.target.style.backgroundColor = '#f1f5f9'
                                                e.target.style.color = '#0f172a'
                                            }
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            if (!isActive) {
                                                e.target.style.backgroundColor = 'transparent'
                                                e.target.style.color = '#475569'
                                            }
                                        }
                                    }
                                })
                            })
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    },
                    child: [
                        // Search input
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-magnifying-glass' },
                                    style: {
                                        position: 'absolute',
                                        left: '14px',
                                        color: '#94a3b8',
                                        fontSize: '14px',
                                        zIndex: '1'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search IP records...',
                                        className: 'patent-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#0f172a',
                                        fontSize: '14px',
                                        width: '260px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            const term = e.target.value
                                            currentSearch = term
                                            clearTimeout(mainSearchTimeout)
                                            mainSearchTimeout = setTimeout(() => {
                                                loadPatents()
                                            }, 400)
                                        },
                                        type2: 'focus',
                                        method2: (e) => {
                                            e.target.style.borderColor = '#3b82f6'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                            e.target.style.backgroundColor = '#ffffff'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.borderColor = '#e2e8f0'
                                            e.target.style.boxShadow = 'none'
                                            e.target.style.backgroundColor = '#f8fafc'
                                        }
                                    }
                                })
                            ]
                        }),
                        // Add IP Record button
                        $({
                            tag: 'button',
                            att: { className: 'add-patent-btn' },
                            style: {
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '10px 24px',
                                color: '#ffffff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-plus-circle' },
                                    style: { fontSize: '16px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add IP Record'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: openAddPatentModal,
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#2563eb'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.35)'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#3b82f6'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)'
                                }
                            }
                        })
                        /* Under Review IP button - commented out
                        $({
                            tag: 'button',
                            att: { className: 'under-review-btn' },
                            style: {
                                backgroundColor: 'rgba(255,152,0,0.12)',
                                border: '1px solid rgba(255,152,0,0.5)',
                                borderRadius: '30px',
                                padding: '10px 20px',
                                color: '#ff9800',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(255,152,0,0.15)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-hourglass-half' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Under Review IP'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: openUnderReviewModal,
                                type2: 'mouseenter',
                                method2: e => {
                                    e.currentTarget.style.backgroundColor = '#ff9800'
                                    e.currentTarget.style.color = '#fff'
                                    e.currentTarget.style.borderColor = '#ff9800'
                                },
                                type3: 'mouseleave',
                                method3: e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,152,0,0.12)'
                                    e.currentTarget.style.color = '#ff9800'
                                    e.currentTarget.style.borderColor = 'rgba(255,152,0,0.5)'
                                }
                            }
                        })
                        */
                    ]
                })
            ]
        })
    }

    // Statistics cards
    const StatsCards = () => {
        const stats = [
            {
                label: 'Total IP Records',
                value: '0',
                id: 'stat-total',
                icon: 'fa-file-invoice',
                color: '#3b82f6',
                subtext: 'Accumulated'
            },
            {
                label: 'Filed',
                value: '0',
                id: 'stat-filed',
                icon: 'fa-file-signature',
                color: '#f59e0b',
                subtext: 'IP Filings'
            },
            {
                label: 'Registered',
                value: '0',
                id: 'stat-registered',
                icon: 'fa-certificate',
                color: '#10b981',
                subtext: 'Success Cases'
            },
            {
                label: 'Downgraded',
                value: '0',
                id: 'stat-downgraded',
                icon: 'fa-level-down-alt',
                color: '#ef4444',
                subtext: 'Status Changed'
            }
        ]

        const statCards = stats.map(stat => {
            return $({
                tag: 'div',
                att: { className: 'stat-card' },
                style: {
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    flex: '1',
                    minWidth: '200px',
                    border: '1px solid #e8ecf0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }
                },
                child: [
                    // Background accent
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '120px',
                            height: '120px',
                            background: `radial-gradient(circle at top right, ${stat.color}15, transparent 70%)`,
                            borderRadius: '50%',
                            zIndex: '0'
                        }
                    }),
                    // Icon container
                    $({
                        tag: 'div',
                        style: {
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            backgroundColor: `${stat.color}12`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${stat.color}25`,
                            position: 'relative',
                            zIndex: '1',
                            flexShrink: 0
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: `fa-solid ${stat.icon}` },
                                style: {
                                    color: stat.color,
                                    fontSize: '28px'
                                }
                            })
                        ]
                    }),
                    // Content
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            zIndex: '1',
                            flex: '1'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { id: stat.id },
                                        text: stat.value,
                                        style: {
                                            fontSize: '34px',
                                            fontWeight: '700',
                                            color: '#0f172a',
                                            lineHeight: '1.2',
                                            letterSpacing: '-1px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: stat.subtext,
                                        style: {
                                            fontSize: '11px',
                                            color: '#94a3b8',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontWeight: '500'
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '14px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    marginTop: '2px'
                                }
                            })
                        ]
                    })
                ]
            })
        })

        return $({
            tag: 'div',
            att: { className: 'stats-cards' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e8ecf0'
            },
            child: statCards
        })
    }

    // Table header component
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '14px 12px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#475569',
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                    whiteSpace: 'nowrap',
                    minWidth: col.width,
                    position: 'sticky',
                    top: '0',
                    zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            userSelect: 'none'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header,
                                style: {
                                    color: '#475569'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-arrow-up-wide-short' },
                                style: {
                                    fontSize: '11px',
                                    color: '#94a3b8',
                                    opacity: '0.6',
                                    transition: 'all 0.2s ease'
                                }
                            })
                        ],
                        event: {
                            type: 'mouseenter',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid')
                                if (icon) icon.style.color = '#3b82f6'
                                const label = e.currentTarget.querySelector('span:first-child')
                                if (label) label.style.color = '#0f172a'
                            },
                            type2: 'mouseleave',
                            method2: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid')
                                if (icon) icon.style.color = '#94a3b8'
                                const label = e.currentTarget.querySelector('span:first-child')
                                if (label) label.style.color = '#475569'
                            }
                        }
                    })
                ]
            })
        })

        return $({
            tag: 'thead',
            style: {
                position: 'sticky',
                top: 0,
                zIndex: 11,
                backgroundColor: '#f8fafc'
            },
            child: [
                $({
                    tag: 'tr',
                    style: {
                        backgroundColor: '#f8fafc'
                    },
                    child: headerCells
                })
            ]
        })
    }

    const updateRecordCount = (count) => {
        const el = document.querySelector('.record-count')
        if (el) el.innerText = `${count} record${count !== 1 ? 's' : ''}`
    }

    const updateStats = (data) => {
        if (!data) return
        const total = data.length
        const filed = data.filter(i => (i.status || i.statusUM || '').toLowerCase() === 'filed').length
        const registered = data.filter(i => (i.status || i.statusUM || '').toLowerCase() === 'registered').length
        const downgraded = data.filter(i => {
            const s = (i.status || i.statusUM || '').toLowerCase()
            return s === 'downgrade' || s === 'downgraded'
        }).length

        const totalEl = document.getElementById('stat-total')
        const filedEl = document.getElementById('stat-filed')
        const registeredEl = document.getElementById('stat-registered')
        const downgradedEl = document.getElementById('stat-downgraded')

        if (totalEl) totalEl.innerText = total
        if (filedEl) filedEl.innerText = filed
        if (registeredEl) registeredEl.innerText = registered
        if (downgradedEl) downgradedEl.innerText = downgraded
    }

    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 200px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderTop: '1px solid #e8ecf0'
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0',
                        minWidth: 'max-content',
                        backgroundColor: '#ffffff'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            style: {
                                backgroundColor: '#ffffff'
                            },
                            elementHandler: getTableBody
                        })
                    ]
                })
            ]
        })
    }

    const showNotification = (message, type = 'info') => {
        const notification = $({
            tag: 'div',
            text: message,
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: type === 'error' ? '#e91e63' : '#4caf50',
                color: '#fff',
                fontSize: '14px',
                zIndex: '1001',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                animation: 'slideIn 0.3s ease'
            }
        })

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.opacity = '0'
            notification.style.transition = 'opacity 0.3s'
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }
    return $({
        tag: 'div',
        att: { className: 'patent-um-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#e2e2e2',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/ipAssets.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    })
}

// Utility functions for patent/utility model
export const formatPatentDate = (date) => {
    if (!date) return '—'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export const getStatusColor = (status) => {
    const colors = {
        'filed': '#ff9800',
        'published': '#2196f3',
        'granted': '#4caf50',
        'pending': '#9c27b0',
        'expired': '#f44336'
    }
    return colors[status] || '#9e9e9e'
}

export const getPatentStats = (data) => {
    return {
        total: 0,
        patents: 0,
        utilityModels: 0,
        industrialDesigns: 0,
        granted: 0,
        pending: 0
    }
}
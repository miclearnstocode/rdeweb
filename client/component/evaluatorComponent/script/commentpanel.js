import { $, Waiting } from '../../../lib/lib.js'

//to do: add a format times new roman font 12 all.
export const CommentBoard = ({ title, docId, closeState, eventId}) => {
    // Data storage
    const data = {
        title: '',
        abstract: '',
        intro: '',
        objective: '',
        methodology: '',
        results: '',
        recommendation: '',
        literature: '',
        other: ''
    };

    const baseData = {
        title: '',
        abstract: '',
        intro: '',
        objective: '',
        methodology: '',
        results: '',
        recommendation: '',
        literature: '',
        other: ''
    };
    let documentTitle = title;
    let eventName = null;
    closeState({ base: baseData, raw: data });

    // Comment sections configuration
    const sections = [
        { id: 'title', name: 'Title', icon: 'fa-solid fa-heading' },
        { id: 'abstract', name: 'Abstract', icon: 'fa-solid fa-file-lines' },
        { id: 'intro', name: 'Introduction', icon: 'fa-solid fa-book-open' },
        { id: 'objective', name: 'Objectives', icon: 'fa-solid fa-bullseye' },
        { id: 'methodology', name: 'Methodology', icon: 'fa-solid fa-flask' },
        { id: 'results', name: 'Results and Discussion', icon: 'fa-solid fa-chart-bar' },
        { id: 'recommendation', name: 'Conclusions and Recommendation', icon: 'fa-solid fa-check-double' },
        { id: 'literature', name: 'Literature', icon: 'fa-solid fa-book' },
        { id: 'other', name: 'Other comments', icon: 'fa-solid fa-comment' }
    ];

    // Create main container
    const container = $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }
    });

    const getEventInfo = async () => {
        try {
            const form = new FormData();
            form.append('getEventInfo', '1');
            form.append('docId', docId);
            
            const response = await fetch('/uploadResearchFile', {
                method: 'POST',
                body: form
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('getEventInfo response:', data);
            
            if (data.status) {
                eventId = data.event_id;
                eventName = data.event_name;
                sourceTable = data.source_table; 
                console.log('Event info loaded:', { eventId, eventName, sourceTable, docStatus: data.doc_status });
            } else {
                console.error('Failed to get event info:', data.message);
            }
        } catch (error) {
            console.error('Error fetching event info:', error);
        }
    };

    // Queue comment for email scheduling
    const queueCommentForEmail = async () => {
        if (!docId) return;
        
        try {
            const formData = new FormData();
            formData.append('queueCommentForEmail', '1');
            formData.append('docId', docId);
            if (eventId) formData.append('eventId', eventId);
            if (eventName) formData.append('eventName', eventName);
            
            const response = await fetch('/comments', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Email queue result:', result);
            return result;
        } catch (error) {
            console.error('Error queueing comment for email:', error);
            return null;
        }
    };

    // Header
    const header = $({
        tag: 'div',
        style: {
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
        },
        child: [
            $({
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', gap: '10px' },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-comments' },
                        style: { fontSize: '18px', color: '#3b82f6' }
                    }),
                    $({
                        tag: 'span',
                        text: 'Comments',
                        style: { fontSize: '16px', fontWeight: '600', color: '#0f172a' }
                    })
                ]
            }),
            $({
                tag: 'button',
                style: {
                    padding: '8px 20px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                },
                child: [
                    $({ tag: 'span', att: { className: 'fa-solid fa-save' } }),
                    $({ tag: 'span', text: 'Save All' })
                ],
                event: {
                    type: 'click',
                    method: async () => {
                        if (!docId) { alert('Document ID required'); return; }
                        
                        const formData = new FormData();
                        formData.append('updateReview', 'true');
                        formData.append('title', data.title || '');
                        formData.append('intro', data.intro || '');
                        formData.append('abstract', data.abstract || '');
                        formData.append('objective', data.objective || '');
                        formData.append('methodology', data.methodology || '');
                        formData.append('results', data.results || '');
                        formData.append('recommendation', data.recommendation || '');
                        formData.append('literature', data.literature || '');
                        formData.append('other', data.other || '');
                        formData.append('docId', docId);

                        let loading = Waiting();
                        document.body.appendChild(loading);

                        const remove = () => {
                            if (loading && loading.parentNode) {
                                loading.remove();
                            }
                        };

                        try {
                            const response = await fetch('/uploadResearchFile', { 
                                method: 'POST', 
                                body: formData 
                            });
                            
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const result = await response.json();
                            remove();

                            if (result.status) {
                                Object.keys(baseData).forEach(key => baseData[key] = data[key]);
                                closeState({ base: { ...baseData }, raw: { ...data } });
                                
                                // After saving comments, queue for email scheduling
                                const queueResult = await queueCommentForEmail();
                                
                                if (queueResult && queueResult.status) {
                                    alert(result.message + '\n' + queueResult.message);
                                } else {
                                    alert(result.message || 'Comments saved successfully!');
                                }
                            } else {
                                alert(result.message || 'Failed to save comments');
                            }

                        } catch (error) {
                            remove();
                            console.error('Error saving comments:', error);
                            alert('Error saving: ' + error.message);
                        }
                    }
                },
                elementHandler: (el) => {
                    el.addEventListener('mouseenter', () => {
                        el.style.backgroundColor = '#2563eb';
                        el.style.transform = 'translateY(-1px)';
                        el.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
                    });
                    el.addEventListener('mouseleave', () => {
                        el.style.backgroundColor = '#3b82f6';
                        el.style.transform = 'translateY(0)';
                        el.style.boxShadow = 'none';
                    });
                }
            })
        ]
    });
    container.appendChild(header);

    const fetchDocumentTitle = async (docId) => {
        try {
            const form = new FormData();
            form.append('getDocTitle', '1');
            form.append('docId', docId);
            
            const response = await fetch('/uploadResearchFile', {
                method: 'POST',
                body: form
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status && data.title) {
                return data.title;
            }
            return null;
        } catch (error) {
            console.error('Error fetching document title:', error);
            return null;
        }
    };

    // Title card
    const titleCard = $({
        tag: 'div',
        style: {
            margin: '12px 16px',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e8ecf1',
            position: 'relative',
            flexShrink: 0,
        },
        child: [
            $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '-10px',
                    left: '16px',
                    padding: '2px 12px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                },
                text: 'Title'
            }),
            $({
                tag: 'div',
                style: {
                    fontSize: '14px',
                    color: '#0f172a',
                    maxHeight: '60px',
                    overflowY: 'auto',
                    padding: '5px 0',
                    fontWeight: '500',
                    lineHeight: '1.5',
                },
                text: documentTitle || 'Untitled Document'
            })
        ]
    });
    container.appendChild(titleCard);

    // After the component is created, fetch the title if not provided
    if (!title || title === 'Untitled Document') {
        fetchDocumentTitle(docId).then(fetchedTitle => {
            if (fetchedTitle) {
                // Update the title card
                const titleDiv = container.querySelector('.title-card-text');
                if (titleDiv) {
                    titleDiv.textContent = fetchedTitle;
                }
            }
        });
    }

    // Fetch event info
    getEventInfo();

    // Main content area with sidebar and editor
    const mainContent = $({
        tag: 'div',
        style: {
            flex: 1,
            display: 'flex',
            gap: '12px',
            padding: '0 12px 12px 12px',
            overflow: 'hidden'
        }
    });

    // Sidebar with comment sections
    const sidebar = $({
        tag: 'div',
        style: {
            width: '200px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e8ecf1',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
        }
    });

    // Sidebar header
    sidebar.appendChild($({
        tag: 'div',
        style: {
            padding: '10px 14px',
            borderBottom: '1px solid #e8ecf1',
            fontSize: '11px',
            fontWeight: '600',
            color: '#3b82f6',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            backgroundColor: '#ffffff',
        },
        text: 'Sections'
    }));

    // Create clickable nav items
    const navItemsContainer = $({
        tag: 'div',
        style: {
            flex: 1,
            overflowY: 'auto',
            padding: '6px'
        }
    });

    // Track active section
    let activeSection = 'title';

    // Create editor container
    const editorContainer = $({
        tag: 'div',
        style: {
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e8ecf1',
            overflow: 'hidden',
            position: 'relative'
        }
    });

    // Create all section editors but hide them initially
    const editors = {};

    sections.forEach(section => {
        // Create editor div
        const editorDiv = $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                display: section.id === 'title' ? 'flex' : 'none',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: 0,
                left: 0
            },
            att: { id: `editor-${section.id}` }
        });

        // Editor header
        editorDiv.appendChild($({
            tag: 'div',
            style: {
                padding: '10px 16px',
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: section.icon },
                    style: { fontSize: '16px', color: '#3b82f6' }
                }),
                $({
                    tag: 'span',
                    text: section.name,
                    style: { fontSize: '14px', fontWeight: '600', color: '#0f172a' }
                })
            ]
        }));

        // Toolbar
        const toolbar = $({
            tag: 'div',
            style: {
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e8ecf1',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                alignItems: 'center',
                flexShrink: 0,
            }
        });

        // Helper function to add toolbar buttons
        const addToolButton = (icon, command, title = '') => {
            toolbar.appendChild($({
                tag: 'button',
                style: {
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    color: '#475569',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    transition: 'all 0.15s ease',
                },
                att: {
                    className: icon,
                    title: title || command
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.preventDefault();
                        document.execCommand(command, false, null);
                        const activeEditor = document.querySelector(`#editor-${activeSection} [contenteditable="true"]`);
                        if (activeEditor) {
                            activeEditor.focus();
                            const inputEvent = new Event('input', { bubbles: true });
                            activeEditor.dispatchEvent(inputEvent);
                        }
                    }
                },
                elementHandler: (el) => {
                    el.addEventListener('mouseenter', () => {
                        el.style.backgroundColor = '#f1f5f9';
                        el.style.borderColor = '#94a3b8';
                    });
                    el.addEventListener('mouseleave', () => {
                        el.style.backgroundColor = 'transparent';
                        el.style.borderColor = '#e2e8f0';
                    });
                }
            }));
        };

        // Text formatting buttons
        addToolButton('fa-solid fa-bold', 'bold', 'Bold (Ctrl+B)');
        addToolButton('fa-solid fa-italic', 'italic', 'Italic (Ctrl+I)');
        addToolButton('fa-solid fa-underline', 'underline', 'Underline (Ctrl+U)');

        // Separator
        toolbar.appendChild($({
            tag: 'div',
            style: {
                width: '1px',
                height: '20px',
                backgroundColor: '#e2e8f0',
                margin: '0 4px'
            }
        }));

        // List buttons
        addToolButton('fa-solid fa-list-ul', 'insertUnorderedList', 'Bullet List');
        addToolButton('fa-solid fa-list-ol', 'insertOrderedList', 'Numbered List');

        // Indent/outdent buttons
        addToolButton('fa-solid fa-indent', 'indent', 'Increase Indent');
        addToolButton('fa-solid fa-outdent', 'outdent', 'Decrease Indent');

        // Separator
        toolbar.appendChild($({
            tag: 'div',
            style: {
                width: '1px',
                height: '20px',
                backgroundColor: '#e2e8f0',
                margin: '0 4px'
            }
        }));

        // Color picker
        let colorInput;
        const colorPicker = $({
            tag: 'div',
            style: {
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                color: '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                position: 'relative',
                transition: 'all 0.15s ease',
            },
            child: [
                $({
                    tag: 'input',
                    att: { type: 'color', value: '#000000' },
                    style: {
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        cursor: 'pointer'
                    },
                    elementHandler: (el) => { colorInput = el; },
                    event: {
                        type: 'change',
                        method: (e) => {
                            document.execCommand('foreColor', true, e.target.value);
                            const activeEditor = document.querySelector(`#editor-${activeSection} [contenteditable="true"]`);
                            if (activeEditor) {
                                activeEditor.focus();
                                const inputEvent = new Event('input', { bubbles: true });
                                activeEditor.dispatchEvent(inputEvent);
                            }
                        }
                    }
                }),
                $({ tag: 'span', att: { className: 'fa-solid fa-palette' }, style: { fontSize: '14px' } }),
                $({ tag: 'span', text: 'Color', style: { fontSize: '11px' } })
            ],
            event: {
                type: 'click',
                method: () => { if (colorInput) colorInput.click(); }
            },
            elementHandler: (el) => {
                el.addEventListener('mouseenter', () => {
                    el.style.backgroundColor = '#f1f5f9';
                    el.style.borderColor = '#94a3b8';
                });
                el.addEventListener('mouseleave', () => {
                    el.style.backgroundColor = 'transparent';
                    el.style.borderColor = '#e2e8f0';
                });
            }
        });
        toolbar.appendChild(colorPicker);

        // Clear button
        toolbar.appendChild($({
            tag: 'button',
            style: {
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                color: '#ef4444',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
                fontSize: '12px',
            },
            child: [
                $({ tag: 'span', att: { className: 'fa-solid fa-trash' }, style: { fontSize: '13px' } }),
                $({ tag: 'span', text: 'Clear', style: { fontSize: '12px' } })
            ],
            event: {
                type: 'click',
                method: () => {
                    if (confirm(`Clear "${section.name}"?`)) {
                        data[section.id] = '';
                        const editor = document.querySelector(`#editor-${section.id} [contenteditable="true"]`);
                        if (editor) {
                            editor.innerHTML = '';
                            const inputEvent = new Event('input', { bubbles: true });
                            editor.dispatchEvent(inputEvent);
                        }
                        closeState({ base: { ...baseData }, raw: { ...data } });
                    }
                }
            },
            elementHandler: (el) => {
                el.addEventListener('mouseenter', () => {
                    el.style.backgroundColor = '#fef2f2';
                    el.style.borderColor = '#fca5a5';
                });
                el.addEventListener('mouseleave', () => {
                    el.style.backgroundColor = 'transparent';
                    el.style.borderColor = '#e2e8f0';
                });
            }
        }));

        editorDiv.appendChild(toolbar);

        // Create the content area
        const contentArea = document.createElement('div');
        Object.assign(contentArea.style, {
            flex: '1',
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            overflowY: 'auto',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#1e293b',
            outline: 'none',
            lineHeight: '1.7',
            minHeight: '100px',
        });
        contentArea.setAttribute('contentEditable', 'true');
        contentArea.setAttribute('data-section', section.id);

        // Add event listeners directly
        contentArea.addEventListener('input', (e) => {
            data[section.id] = e.target.innerHTML;
            closeState({ base: { ...baseData }, raw: { ...data } });
        });

        contentArea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === '7') {
                e.preventDefault();
                document.execCommand('insertUnorderedList', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({ base: { ...baseData }, raw: { ...data } });
                }, 10);
            }
            if (e.ctrlKey && e.shiftKey && e.key === '8') {
                e.preventDefault();
                document.execCommand('insertOrderedList', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({ base: { ...baseData }, raw: { ...data } });
                }, 10);
            }
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                document.execCommand('indent', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({ base: { ...baseData }, raw: { ...data } });
                }, 10);
            }
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                document.execCommand('outdent', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({ base: { ...baseData }, raw: { ...data } });
                }, 10);
            }
        });

        // Load saved data - FIXED to properly handle multiple comments
        (async () => {
            let loading = null
            try {
                const form = new FormData();
                form.append('reqCommentIndiv2', '1');
                form.append('comName', section.id); // Pass the section name
                form.append('docId', docId);

                loading = Waiting()
                document.body.appendChild(loading)

                const res = await fetch('/comments', {
                    method: 'post',
                    body: form,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const text = await res.text();
                if (!text || text.trim() === '') {
                    throw new Error('Empty response from server');
                }

                let val;
                try {
                    val = JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON response:', text);
                    throw new Error('Invalid JSON response from server');
                }

                if (loading) loading.remove()

                // Check if we have comments
                if (val && val.status !== 'error') {
                    // If comName is specified, data should be the specific section content
                    if (val.name === section.id && val.data) {
                        // This is the specific section content
                        baseData[val.name] = val.data || '';
                        data[val.name] = val.data || '';
                        // IMPORTANT: Use innerHTML to render HTML tags
                        contentArea.innerHTML = val.data || '';
                        closeState({ base: { ...baseData }, raw: { ...data } });
                    } 
                    // If we have multiple comments (val.data is an array)
                    else if (Array.isArray(val.data) && val.data.length > 0) {
                        // Display all comments for this section
                        let html = '';
                        val.data.forEach((comment, index) => {
                            // Get the section content from the comment
                            const sectionContent = comment[section.id] || '';
                            if (sectionContent) {
                                const evaluatorName = comment.evaluator_name || 'Unknown Evaluator';
                                const date = comment.date ? new Date(comment.date).toLocaleString() : '';
                                
                                html += `
                                    <div style="border-bottom: 1px solid #e8ecf1; padding: 12px 0; margin-bottom: 8px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                            <strong style="color: #0f172a; font-size: 13px;">${evaluatorName}</strong>
                                            <span style="color: #94a3b8; font-size: 11px;">${date}</span>
                                        </div>
                                        <div style="color: #1e293b; font-size: 14px; line-height: 1.6;">${sectionContent}</div>
                                    </div>
                                `;
                            }
                        });
                        
                        // If we have content, display it
                        if (html) {
                            // Store the combined content in data
                            const combinedContent = val.data.map(c => c[section.id]).filter(c => c).join('<br><br>');
                            baseData[section.id] = combinedContent;
                            data[section.id] = combinedContent;
                            contentArea.innerHTML = html;
                            closeState({ base: { ...baseData }, raw: { ...data } });
                        } else {
                            // No content for this section
                            baseData[section.id] = '';
                            data[section.id] = '';
                            contentArea.innerHTML = '';
                            closeState({ base: { ...baseData }, raw: { ...data } });
                        }
                    } else {
                        // No comments found, set empty state
                        baseData[section.id] = '';
                        data[section.id] = '';
                        contentArea.innerHTML = '';
                        closeState({ base: { ...baseData }, raw: { ...data } });
                    }
                } else {
                    // No comments found, set empty state
                    baseData[section.id] = '';
                    data[section.id] = '';
                    contentArea.innerHTML = '';
                    closeState({ base: { ...baseData }, raw: { ...data } });
                }
            } catch (error) {
                if (loading) loading.remove()
                console.error('Error loading comment:', error);
                // Set empty state on error
                baseData[section.id] = '';
                data[section.id] = '';
                contentArea.innerHTML = '';
                closeState({ base: { ...baseData }, raw: { ...data } });
            }
        })();
        editorDiv.appendChild(contentArea);
        editorContainer.appendChild(editorDiv);
        editors[section.id] = editorDiv;
    });

    // Create nav items with click handlers
    sections.forEach(section => {
        const navItem = $({
            tag: 'div',
            style: {
                padding: '10px 14px',
                margin: '2px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: section.id === 'title' ? '#e2e8f0' : 'transparent',
                color: section.id === 'title' ? '#0f172a' : '#475569',
                borderLeft: section.id === 'title' ? '3px solid #3b82f6' : 'none',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                fontWeight: section.id === 'title' ? '600' : '400',
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: section.icon },
                    style: { width: '18px', fontSize: '14px', color: section.id === 'title' ? '#3b82f6' : '#94a3b8' }
                }),
                $({ tag: 'span', text: section.name, style: { fontSize: '13px' } })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    e.stopPropagation();

                    // Update active section
                    activeSection = section.id;

                    // Hide all editors
                    Object.keys(editors).forEach(id => {
                        editors[id].style.display = 'none';
                    });

                    // Show selected editor
                    editors[section.id].style.display = 'flex';

                    // Update nav item styles
                    const allNavItems = navItemsContainer.children;
                    Array.from(allNavItems).forEach((item, index) => {
                        if (index === sections.findIndex(s => s.id === section.id)) {
                            item.style.backgroundColor = '#e2e8f0';
                            item.style.color = '#0f172a';
                            item.style.borderLeft = '3px solid #3b82f6';
                            item.style.fontWeight = '600';
                            const icon = item.querySelector('span:first-child');
                            if (icon) icon.style.color = '#3b82f6';
                        } else {
                            item.style.backgroundColor = 'transparent';
                            item.style.color = '#475569';
                            item.style.borderLeft = 'none';
                            item.style.fontWeight = '400';
                            const icon = item.querySelector('span:first-child');
                            if (icon) icon.style.color = '#94a3b8';
                        }
                    });

                    // Focus the editor
                    setTimeout(() => {
                        const editor = document.querySelector(`#editor-${section.id} [contenteditable="true"]`);
                        if (editor) editor.focus();
                    }, 100);
                }
            },
            elementHandler: (el) => {
                el.addEventListener('mouseenter', () => {
                    if (!el.style.borderLeft || el.style.borderLeft === 'none') {
                        el.style.backgroundColor = '#f1f5f9';
                    }
                });
                el.addEventListener('mouseleave', () => {
                    if (!el.style.borderLeft || el.style.borderLeft === 'none') {
                        el.style.backgroundColor = 'transparent';
                    }
                });
            }
        });

        navItemsContainer.appendChild(navItem);
    });

    sidebar.appendChild(navItemsContainer);
    mainContent.appendChild(sidebar);
    mainContent.appendChild(editorContainer);
    container.appendChild(mainContent);

    // Add CSS for list styling
    const style = document.createElement('style');
    style.textContent = `
        [contenteditable="true"] ul, [contenteditable="true"] ol {
            margin: 8px 0;
            padding-left: 30px;
        }
        [contenteditable="true"] li {
            margin: 4px 0;
        }
        [contenteditable="true"] ul {
            list-style-type: disc;
        }
        [contenteditable="true"] ol {
            list-style-type: decimal;
        }
        [contenteditable="true"] ul ul, [contenteditable="true"] ol ul {
            list-style-type: circle;
        }
        [contenteditable="true"] ol ol, [contenteditable="true"] ul ol {
            list-style-type: lower-alpha;
        }
        [contenteditable="true"]:empty:before {
            content: "Click here to add comments...";
            color: #94a3b8;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);

    return container;
};
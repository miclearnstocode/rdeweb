import {$, Waiting} from '../../../lib/lib.js'

export const CommentBoard = ({title, docId, closeState}) => {
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
    
    closeState({base: baseData, raw: data});

    // Comment sections configuration
    const sections = [
        {id: 'title', name: 'Title', icon: 'fa-solid fa-heading'},
        {id: 'abstract', name: 'Abstract', icon: 'fa-solid fa-file-lines'},
        {id: 'intro', name: 'Introduction', icon: 'fa-solid fa-book-open'},
        {id: 'objective', name: 'Objectives', icon: 'fa-solid fa-bullseye'},
        {id: 'methodology', name: 'Methodology', icon: 'fa-solid fa-flask'},
        {id: 'results', name: 'Results and Discussion', icon: 'fa-solid fa-chart-bar'},
        {id: 'recommendation', name: 'Conclusions and Recommendation', icon: 'fa-solid fa-check-double'},
        {id: 'literature', name: 'Literature', icon: 'fa-solid fa-book'},
        {id: 'other', name: 'Other comments', icon: 'fa-solid fa-comment'}
    ];

    // Create main container
    const container = $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#1e1e1e',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }
    });

    // Header
    const header = $({
        tag: 'div',
        style: {
            padding: '12px 20px',
            backgroundColor: '#2a2a2a',
            borderBottom: '2px solid #FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        child: [
            $({
                tag: 'div',
                style: {display: 'flex', alignItems: 'center', gap: '10px'},
                child: [
                    $({tag: 'span', att: {className: 'fa-solid fa-comments'}, style: {fontSize: '1.3vw', color: '#FFD700'}}),
                    $({tag: 'span', text: 'COMMENTS', style: {fontSize: '1.1vw', fontWeight: '600', color: '#fff'}})
                ]
            }),
            $({
                tag: 'button',
                style: {
                    padding: '6px 16px',
                    backgroundColor: '#FFD700',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9vw',
                    fontWeight: '600',
                    color: '#1e1e1e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                },
                child: [
                    $({tag: 'span', att: {className: 'fa-solid fa-save'}}),
                    $({tag: 'span', text: 'Save All Changes'})
                ],
                event: {
                    type: 'click',
                    method: async () => {
                        if (!docId) {alert('Document ID required'); return;}
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
                        // Show loading indicator
                        let loading = Waiting()
                        document.body.appendChild(loading)
                        
                        const remove = () => {
                            loading.remove()
                        }
                        try {
                            const response = await fetch('/uploadResearchFile', {method: 'POST', body: formData});
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            const result = await response.json();
                            remove()
                            if (result.emailStatus) {
                                alert(result.message + '\n' + result.emailStatus);
                            } else {
                                alert(result.message || 'Saved!');
                            }
                            
                            if (result.status) {
                                Object.keys(baseData).forEach(key => baseData[key] = data[key]);
                                closeState({base: {...baseData}, raw: {...data}});
                            }
                            
                        } catch (error) {
                            remove()
                            console.error('Error saving comments:', error);
                            alert('Error saving: ' + error.message);
                            
                        }
                    }
                }
            })
        ]
    });
    container.appendChild(header);

    // Title card
    const titleCard = $({
        tag: 'div',
        style: {
            margin: '12px 20px',
            padding: '12px 20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            border: '1px solid #444',
            position: 'relative'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '-10px',
                    left: '20px',
                    padding: '2px 12px',
                    backgroundColor: '#FFD700',
                    borderRadius: '20px',
                    fontSize: '0.75vw',
                    fontWeight: '600',
                    color: '#1e1e1e',
                    textTransform: 'uppercase'
                },
                text: 'Research Title'
            }),
            $({
                tag: 'div',
                style: {fontSize: '0.95vw', color: '#fff', maxHeight: '60px', overflowY: 'auto', padding: '5px 0'},
                text: `"${title}"`
            })
        ]
    });
    container.appendChild(titleCard);

    // Main content area with sidebar and editor
    const mainContent = $({
        tag: 'div',
        style: {
            flex: 1,
            display: 'flex',
            gap: '16px',
            padding: '0 16px 16px 16px',
            overflow: 'hidden'
        }
    });

    // Sidebar with comment sections
    const sidebar = $({
        tag: 'div',
        style: {
            width: '240px',
            backgroundColor: '#2a2a2a',
            borderRadius: '10px',
            border: '1px solid #444',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }
    });

    // Sidebar header
    sidebar.appendChild($({
        tag: 'div',
        style: {
            padding: '12px 16px',
            borderBottom: '1px solid #444',
            fontSize: '0.8vw',
            fontWeight: '600',
            color: '#FFD700',
            textTransform: 'uppercase'
        },
        text: 'COMMENT SECTIONS'
    }));

    // Create clickable nav items
    const navItemsContainer = $({
        tag: 'div',
        style: {
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
        }
    });

    // Track active section
    let activeSection = 'title';
    
    // Create editor container
    const editorContainer = $({
        tag: 'div',
        style: {
            flex: 1,
            backgroundColor: '#2a2a2a',
            borderRadius: '10px',
            border: '1px solid #444',
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
                backgroundColor: '#2a2a2a',
                position: 'absolute',
                top: 0,
                left: 0
            },
            att: {id: `editor-${section.id}`}
        });
        
        // Editor header
        editorDiv.appendChild($({
            tag: 'div',
            style: {
                padding: '12px 16px',
                backgroundColor: '#333',
                borderBottom: '2px solid #FFD700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            },
            child: [
                $({tag: 'span', att: {className: section.icon}, style: {fontSize: '1.2vw', color: '#FFD700'}}),
                $({tag: 'span', text: section.name, style: {fontSize: '1.1vw', fontWeight: '600', color: '#fff'}})
            ]
        }));
        
        // Toolbar
        const toolbar = $({
            tag: 'div',
            style: {
                padding: '10px 16px',
                backgroundColor: '#3a3a3a',
                borderBottom: '1px solid #444',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
                alignItems: 'center'
            }
        });
        
        // Helper function to add toolbar buttons
        const addToolButton = (icon, command, title = '') => {
            toolbar.appendChild($({
                tag: 'button',
                style: {
                    padding: '.4rem .8rem',
                    borderRadius: '.4rem',
                    backgroundColor: '#4a4a4a',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '1vw',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    transition: 'all 0.2s'
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
                            // Trigger input event to save data
                            const inputEvent = new Event('input', { bubbles: true });
                            activeEditor.dispatchEvent(inputEvent);
                        }
                    }
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
                height: '24px',
                backgroundColor: '#555',
                margin: '0 5px'
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
                height: '24px',
                backgroundColor: '#555',
                margin: '0 5px'
            }
        }));
        
        // Color picker
        let colorInput;
        const colorPicker = $({
            tag: 'div',
            style: {
                padding: '.4rem .8rem',
                borderRadius: '.4rem',
                backgroundColor: '#4a4a4a',
                cursor: 'pointer',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                position: 'relative'
            },
            child: [
                $({
                    tag: 'input',
                    att: {type: 'color', value: '#000000'},
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
                $({tag: 'span', att: {className: 'fa-solid fa-palette'}}),
                $({tag: 'span', text: 'Color', style: {fontSize: '0.8vw'}})
            ],
            event: {
                type: 'click',
                method: () => { if (colorInput) colorInput.click(); }
            }
        });
        toolbar.appendChild(colorPicker);
        
        // Clear button
        toolbar.appendChild($({
            tag: 'button',
            style: {
                padding: '.4rem .8rem',
                borderRadius: '.4rem',
                backgroundColor: '#dc3545',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s'
            },
            child: [
                $({tag: 'span', att: {className: 'fa-solid fa-trash'}}),
                $({tag: 'span', text: 'Clear', style: {fontSize: '0.8vw'}})
            ],
            event: {
                type: 'click',
                method: () => {
                    if (confirm(`Clear "${section.name}"?`)) {
                        data[section.id] = '';
                        const editor = document.querySelector(`#editor-${section.id} [contenteditable="true"]`);
                        if (editor) {
                            editor.innerHTML = '';
                            // Trigger input event to save data
                            const inputEvent = new Event('input', { bubbles: true });
                            editor.dispatchEvent(inputEvent);
                        }
                        closeState({base: {...baseData}, raw: {...data}});
                    }
                }
            }
        }));
        
        editorDiv.appendChild(toolbar);
        
        // Create the content area
        const contentArea = document.createElement('div');
        Object.assign(contentArea.style, {
            flex: '1',
            padding: '20px',
            backgroundColor: '#fff',
            overflowY: 'auto',
            fontSize: '0.95vw',
            fontFamily: 'Segoe UI, sans-serif',
            color: '#333',
            outline: 'none',
            lineHeight: '1.6'
        });
        contentArea.setAttribute('contentEditable', 'true');
        contentArea.setAttribute('data-section', section.id);
        
        // Add event listeners directly (not through the $ library)
        contentArea.addEventListener('input', (e) => {
            data[section.id] = e.target.innerHTML;
            closeState({base: {...baseData}, raw: {...data}});
        });
        
        contentArea.addEventListener('keydown', (e) => {
            // Ctrl+Shift+7 for bullet list
            if (e.ctrlKey && e.shiftKey && e.key === '7') {
                e.preventDefault();
                document.execCommand('insertUnorderedList', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({base: {...baseData}, raw: {...data}});
                }, 10);
            }
            // Ctrl+Shift+8 for numbered list
            if (e.ctrlKey && e.shiftKey && e.key === '8') {
                e.preventDefault();
                document.execCommand('insertOrderedList', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({base: {...baseData}, raw: {...data}});
                }, 10);
            }
            // Tab key for nested lists
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                document.execCommand('indent', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({base: {...baseData}, raw: {...data}});
                }, 10);
            }
            if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                document.execCommand('outdent', false, null);
                setTimeout(() => {
                    data[section.id] = e.target.innerHTML;
                    closeState({base: {...baseData}, raw: {...data}});
                }, 10);
            }
        });
        
        // Load saved data
        (async () => {
            try {
                const form = new FormData();
                form.append('reqCommentIndiv2', '1');
                form.append('comName', section.id);
                form.append('docId', docId);
                // Show loading indicator
                let loading = Waiting()
                document.body.appendChild(loading)
                        
                const remove = () => {
                    loading.remove()
                }
                const res = await fetch('/comments', {method: 'post', body: form});
                const val = await res.json();
                remove()
                if (val && val.name) {
                    baseData[val.name] = val.data || '';
                    data[val.name] = val.data || '';
                    contentArea.innerHTML = val.data || '';
                    closeState({base: {...baseData}, raw: {...data}});
                }
            } catch (error) {
                remove()
                console.error('Error loading comment:', error);
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
                padding: '12px 16px',
                margin: '2px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: section.id === 'title' ? '#3a3a3a' : 'transparent',
                color: section.id === 'title' ? '#FFD700' : '#bbb',
                borderLeft: section.id === 'title' ? '3px solid #FFD700' : 'none',
                transition: 'all 0.2s'
            },
            child: [
                $({tag: 'span', att: {className: section.icon}, style: {width: '20px', fontSize: '1.1vw'}}),
                $({tag: 'span', text: section.name, style: {fontSize: '0.95vw'}})
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
                            item.style.backgroundColor = '#3a3a3a';
                            item.style.color = '#FFD700';
                            item.style.borderLeft = '3px solid #FFD700';
                        } else {
                            item.style.backgroundColor = 'transparent';
                            item.style.color = '#bbb';
                            item.style.borderLeft = 'none';
                        }
                    });
                    
                    // Focus the editor
                    setTimeout(() => {
                        const editor = document.querySelector(`#editor-${section.id} [contenteditable="true"]`);
                        if (editor) editor.focus();
                    }, 100);
                }
            }
        });
        
        navItemsContainer.appendChild(navItem);
    });
    
    sidebar.appendChild(navItemsContainer);
    mainContent.appendChild(sidebar);
    mainContent.appendChild(editorContainer);
    container.appendChild(mainContent);

    // Add some CSS for list styling
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
    `;
    document.head.appendChild(style);

    return container;
};
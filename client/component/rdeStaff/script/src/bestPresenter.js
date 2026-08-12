import { $, CustomModal, Request, Path, Waiting, ConfirmationAlert } from "../../../../lib/lib.js";

export const BestPresenter = () => {
    let containerEl = null;
    let contentEl = null;
    let eventSelectEl = null;
    let loadingIndicator = null;
    let currentEventId = null;
    let currentData = null;
    let selectedDocId = null;

    // ============================================================
    // Helper: Parse Co-authors
    // ============================================================
    const parseCoauthors = (coauthorData) => {
        if (!coauthorData) return [];
        try {
            if (typeof coauthorData === 'string') {
                // Check if it's a JSON array string
                if (coauthorData.startsWith('[') && coauthorData.endsWith(']')) {
                    const parsed = JSON.parse(coauthorData);
                    return Array.isArray(parsed) ? parsed : [];
                }
                // If it's a single name string
                if (coauthorData.trim() && coauthorData !== '[]' && coauthorData !== 'null') {
                    return [coauthorData];
                }
                return [];
            }
            if (Array.isArray(coauthorData)) {
                return coauthorData;
            }
            return [];
        } catch (e) {
            // If parsing fails, return as single item if not empty
            if (coauthorData && coauthorData !== '[]' && coauthorData !== 'null') {
                return [coauthorData];
            }
            return [];
        }
    };

    // ============================================================
    // Helper: Format Co-authors for Display
    // ============================================================
    const formatCoauthors = (coauthorData) => {
        const coauthors = parseCoauthors(coauthorData);
        if (coauthors.length === 0) return null;
        return coauthors.join(', ');
    };

    // ============================================================
    // Load Events
    // ============================================================
    const loadEvents = () => {
        const req = new Request('/eventRequest');
        req.Post([{ name: 'getEventAdmin', value: '1' }]);
        req.Json();
        req.Send()
            .then(data => {
                if (eventSelectEl) {
                    eventSelectEl.innerHTML = '';
                    
                    const defaultOption = document.createElement('option');
                    defaultOption.textContent = '-- Select Event --';
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    defaultOption.style.color = '#adb5bd';
                    eventSelectEl.appendChild(defaultOption);
                    
                    data.forEach(val => {
                        const option = document.createElement('option');
                        option.textContent = val.name;
                        option.value = val.id;
                        option.style.padding = '8px';
                        eventSelectEl.appendChild(option);
                    });
                    
                    const urlEventId = Path(4);
                    if (urlEventId && data.some(e => e.id == urlEventId)) {
                        eventSelectEl.value = urlEventId;
                        loadBestPresenterData(urlEventId);
                    }
                }
            })
            .catch(err => {
                console.error('Error loading events:', err);
                showError('Failed to load events. Please refresh and try again.');
            });
    };

    // ============================================================
    // Load Best Presenter Data
    // ============================================================
    const loadBestPresenterData = (eventId) => {
        if (!eventId || eventId === '-- Select Event --' || eventId === '') {
            showPlaceholder('Select an event to view Best Presenter', 'Choose an event from the dropdown above');
            return;
        }

        currentEventId = eventId;
        showLoading();

        const form = new FormData();
        form.append('getBestPresenter', '1');
        form.append('eventId', eventId);

        fetch('/getresearch', {
            method: 'POST',
            body: form
        })
        .then(response => response.json())
        .then(response => {
            if (response.status && response.data) {
                currentData = response.data;
                renderResults(response.data);
            } else {
                showError(response.message || 'No data available. Make sure the event has scored documents with Quality of Presentation criteria.');
            }
        })
        .catch(err => {
            console.error('Error loading best presenter data:', err);
            showError('Failed to load data. Please try again.');
        });
    };

    // ============================================================
    // Render Functions
    // ============================================================
    const showLoading = () => {
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;">
                    <div style="width:48px;height:48px;border:4px solid #e9ecef;border-top-color:#0d6efd;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:20px;"></div>
                    <div style="font-size:15px;color:#6c757d;font-family:Inter, sans-serif;">Loading Best Presenter data...</div>
                </div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
        }
    };

    const showPlaceholder = (title, subtitle) => {
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="text-align:center;padding:80px 20px;color:#94a3b8;">
                    <i class="fa-solid fa-trophy" style="font-size:56px;display:block;margin-bottom:20px;color:#ffd700;"></i>
                    <div style="font-size:20px;font-weight:600;color:#1a2a3a;margin-bottom:8px;">${title}</div>
                    <div style="font-size:14px;color:#6c757d;">${subtitle}</div>
                </div>
            `;
        }
    };

    const showError = (message) => {
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="text-align:center;padding:80px 20px;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size:48px;display:block;margin-bottom:16px;color:#dc3545;"></i>
                    <div style="font-size:16px;font-weight:600;color:#1a2a3a;margin-bottom:8px;">No Data Available</div>
                    <div style="font-size:14px;color:#6c757d;max-width:500px;margin:0 auto;line-height:1.6;">${message}</div>
                </div>
            `;
        }
    };

    // ============================================================
    // Render Detail Panel (Left Side)
    // ============================================================
    const renderDetailPanel = (doc, isStudentEvent, eventName, criteriaPercentage, totalEvaluators) => {
        if (!doc) {
            return `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;color:#94a3b8;text-align:center;">
                    <i class="fa-regular fa-hand-pointer" style="font-size:36px;margin-bottom:16px;"></i>
                    <div style="font-size:14px;font-weight:500;color:#1a2a3a;">Select a document from the ranking</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:4px;">Click on any row to view details</div>
                </div>
            `;
        }

        const rankEmoji = doc.rank === 1 ? '🥇' : doc.rank === 2 ? '🥈' : doc.rank === 3 ? '🥉' : `#${doc.rank}`;
        const isTop3 = doc.rank <= 3;
        
        // Format co-authors
        const coauthors = parseCoauthors(doc.coauthor);
        const coauthorDisplay = coauthors.length > 0 ? coauthors.join(', ') : null;

        return `
            <div style="height:100%;display:flex;flex-direction:column;">
                <!-- Rank Badge -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                    <div style="font-size:32px;line-height:1;">${rankEmoji}</div>
                    <div>
                        <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${isTop3 ? 'Top ' + doc.rank : 'Rank #' + doc.rank}</div>
                        <div style="font-size:18px;font-weight:700;color:#1a2a3a;">${escapeHtml(doc.presenter || doc.author || 'Unknown')}</div>
                    </div>
                    ${isTop3 ? `
                        <div style="margin-left:auto;padding:2px 12px;background:${doc.rank === 1 ? '#ffd700' : doc.rank === 2 ? '#c0c0c0' : '#cd7f32'};color:#fff;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">
                            ${doc.rank === 1 ? 'Winner' : doc.rank === 2 ? 'Runner-up' : '2nd Runner-up'}
                        </div>
                    ` : ''}
                </div>

                <!-- Score Overview -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
                    <div style="background:linear-gradient(135deg,#f8f9fa,#fff);border-radius:12px;padding:16px;border:1px solid #e9ecef;text-align:center;">
                        <div style="font-size:11px;color:#94a3b8;font-weight:500;">Average Score</div>
                        <div style="font-size:28px;font-weight:700;color:#1a2a3a;margin-top:4px;">${doc.average_score}</div>
                        <div style="font-size:11px;color:#94a3b8;">out of ${criteriaPercentage}</div>
                    </div>
                    <div style="background:linear-gradient(135deg,#f8f9fa,#fff);border-radius:12px;padding:16px;border:1px solid #e9ecef;text-align:center;">
                        <div style="font-size:11px;color:#94a3b8;font-weight:500;">Evaluators</div>
                        <div style="font-size:28px;font-weight:700;color:#1a2a3a;margin-top:4px;">${doc.evaluator_count}</div>
                        <div style="font-size:11px;color:#94a3b8;">of ${totalEvaluators} scored</div>
                    </div>
                </div>

                <!-- Document Details -->
                <div style="flex:1;overflow-y:auto;">
                    <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Document Details</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        ${renderDetailItem('Title', doc.title || 'Untitled')}
                        ${renderDetailItem('Presenter', doc.presenter || doc.author || 'Unknown')}
                        ${coauthorDisplay ? renderDetailItem('Co-Authors', coauthorDisplay) : ''}
                        ${renderDetailItem('Author', doc.author || 'Unknown')}
                        ${renderDetailItem('Category', doc.category || 'N/A')}
                        ${renderDetailItem('Campus', doc.campus || 'N/A')}
                        ${!isStudentEvent ? renderDetailItem('Center', doc.center || 'N/A') : ''}
                        ${isStudentEvent ? renderDetailItem('Paper Type', doc.paper_type || 'N/A') : ''}
                        ${renderDetailItem('Event', eventName || 'N/A')}
                    </div>

                    <!-- Individual Scores -->
                    ${doc.scores && doc.scores.length > 0 ? `
                        <div style="margin-top:16px;">
                            <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Individual Scores</div>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                                ${doc.scores.map((score, idx) => `
                                    <span style="background:#f1f3f5;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:500;border:1px solid #e9ecef;text-align:center;">
                                        ${score}
                                        ${doc.evaluator_names && doc.evaluator_names[idx] ? `<span style="font-size:9px;color:#94a3b8;display:block;">${escapeHtml(doc.evaluator_names[idx])}</span>` : ''}
                                    </span>
                                `).join('')}
                            </div>
                            ${doc.abstained_count > 0 ? `
                                <div style="margin-top:8px;padding:6px 12px;background:#fef2f2;border-radius:6px;border:1px solid #fecaca;font-size:12px;color:#dc3545;">
                                    ⚠️ ${doc.abstained_count} evaluator${doc.abstained_count > 1 ? 's' : ''} abstained from scoring
                                </div>
                            ` : `
                                <div style="margin-top:8px;padding:6px 12px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;font-size:12px;color:#16a34a;">
                                    ✓ All ${doc.evaluator_count} evaluators completed scoring
                                </div>
                            `}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    };

    const renderDetailItem = (label, value) => {
        if (!value || value === 'N/A' || value === '') return '';
        return `
            <div style="padding:6px 0;border-bottom:1px solid #f1f3f5;">
                <div style="font-size:10px;color:#94a3b8;font-weight:500;text-transform:uppercase;">${label}</div>
                <div style="font-size:13px;color:#1a2a3a;font-weight:500;margin-top:2px;word-break:break-word;">${escapeHtml(value)}</div>
            </div>
        `;
    };

    // ============================================================
    // Main Results Render
    // ============================================================
    const renderResults = (data) => {
        if (!contentEl) return;

        const { 
            ranking = [], 
            best_presenter = null, 
            event_name = '', 
            criteria_name = 'Quality of Presentation',
            criteria_percentage = 25,
            total_documents = 0,
            total_evaluators = 0,
            categories = [],
            is_student_event = false
        } = data;

        if (!best_presenter || ranking.length === 0) {
            showError('No scored documents found for this event. Make sure documents have been evaluated with Quality of Presentation criteria.');
            return;
        }

        // Set default selected to best presenter
        if (!selectedDocId && best_presenter) {
            selectedDocId = best_presenter.doc_id;
        }

        // Find the selected document
        const selectedDoc = ranking.find(d => d.doc_id === selectedDocId) || best_presenter;

        // Build the results HTML with two-column layout
        let html = `
            <div style="display:grid;grid-template-columns:380px 1fr;gap:24px;height:100%;min-height:500px;">
                <!-- LEFT PANEL - Detail View -->
                <div style="background:#ffffff;border-radius:16px;border:1px solid #e9ecef;padding:24px;overflow-y:auto;height:100%;max-height:650px;">
                    ${renderDetailPanel(selectedDoc, is_student_event, event_name, criteria_percentage, total_evaluators)}
                </div>

                <!-- RIGHT PANEL - Ranking Table -->
                <div style="display:flex;flex-direction:column;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;flex-shrink:0;">
                        <div>
                            <div style="font-size:16px;font-weight:600;color:#1a2a3a;">Full Ranking</div>
                            <div style="font-size:12px;color:#94a3b8;">${total_documents} documents · ${criteria_name}</div>
                        </div>
                        ${categories && categories.length > 0 ? `
                            <select id="categoryFilter" style="padding:6px 14px;border:1px solid #e9ecef;border-radius:8px;font-size:12px;background:#fff;cursor:pointer;font-family:Inter, sans-serif;color:#1a2a3a;outline:none;">
                                <option value="all">All Categories</option>
                                ${categories.map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('')}
                            </select>
                        ` : ''}
                    </div>
                    <div style="flex:1;overflow-y:auto;border:1px solid #e9ecef;border-radius:12px;overflow:hidden;min-height:300px;">
                        <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:Inter, sans-serif;">
                            <thead style="background:#f8fafc;position:sticky;top:0;z-index:10;">
                                <tr>
                                    <th style="padding:10px 14px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e9ecef;width:44px;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;">Rank</th>
                                    <th style="padding:10px 14px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e9ecef;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;">Presenter</th>
                                    <th style="padding:10px 14px;text-align:left;font-weight:600;color:#475569;border-bottom:2px solid #e9ecef;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;">Title</th>
                                    <th style="padding:10px 14px;text-align:center;font-weight:600;color:#475569;border-bottom:2px solid #e9ecef;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;width:100px;">Scores</th>
                                    <th style="padding:10px 14px;text-align:center;font-weight:600;color:#475569;border-bottom:2px solid #e9ecef;font-size:11px;text-transform:uppercase;letter-spacing:0.3px;width:60px;">Avg</th>
                                </tr>
                            </thead>
                            <tbody id="rankingBody">
                                ${ranking.map((doc, index) => {
                                    const isSelected = doc.doc_id === selectedDocId;
                                    const rankDisplay = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                                    const isTop3 = index < 3;
                                    const rowBg = isSelected ? '#f0f7ff' : (isTop3 ? '#faf9f6' : '');
                                    const rowBorder = isSelected ? '2px solid #0d6efd' : '1px solid transparent';
                                    
                                    // Format co-authors for table
                                    const coauthors = parseCoauthors(doc.coauthor);
                                    const coauthorDisplay = coauthors.length > 0 ? coauthors.join(', ') : null;
                                    
                                    return `
                                        <tr data-docid="${doc.doc_id}" style="border-bottom:1px solid #f1f3f5;background:${rowBg};cursor:pointer;transition:all 0.15s ease;border-left:${rowBorder};">
                                            <td style="padding:10px 14px;text-align:center;font-size:${isTop3 ? '22px' : '13px'};font-weight:${isTop3 ? '600' : '400'};">
                                                ${rankDisplay}
                                            </td>
                                            <td style="padding:10px 14px;font-weight:${isTop3 ? '600' : '400'};">
                                                <div style="color:#1a2a3a;">${escapeHtml(doc.presenter || doc.author || 'Unknown')}</div>
                                                ${coauthorDisplay ? `<div style="font-size:10px;color:#94a3b8;font-weight:400;">Co-author: ${escapeHtml(coauthorDisplay)}</div>` : ''}
                                            </td>
                                            <td style="padding:10px 14px;max-width:200px;">
                                                <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#1a2a3a;">${escapeHtml(doc.title || 'Untitled')}</div>
                                                <div style="font-size:10px;color:#94a3b8;font-weight:400;">${escapeHtml(doc.category || 'N/A')} · ${escapeHtml(doc.campus || 'N/A')}</div>
                                            </td>
                                            <td style="padding:10px 14px;text-align:center;">
                                                <div style="display:flex;flex-wrap:wrap;gap:3px;justify-content:center;font-size:12px;">
                                                    ${doc.scores && doc.scores.length > 0 
                                                        ? doc.scores.map(s => `<span style="background:#f8fafc;padding:1px 8px;border-radius:4px;border:1px solid #e9ecef;font-size:11px;font-weight:500;">${s}</span>`).join('')
                                                        : '<span style="color:#adb5bd;font-size:11px;">—</span>'
                                                    }
                                                </div>
                                                <div style="font-size:9px;color:#94a3b8;margin-top:2px;">
                                                    ${doc.evaluator_count} of ${total_evaluators} scored
                                                    ${doc.abstained_count > 0 ? `· <span style="color:#dc3545;">${doc.abstained_count} abstained</span>` : ''}
                                                </div>
                                            </td>
                                            <td style="padding:10px 14px;text-align:center;font-weight:${isTop3 ? '700' : '600'};color:${index === 0 ? '#856404' : index === 1 ? '#6b7280' : index === 2 ? '#a0522d' : '#1a2a3a'};font-size:${isTop3 ? '16px' : '14px'};">
                                                ${doc.average_score}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        contentEl.innerHTML = html;

        // Add row click handlers
        const rows = contentEl.querySelectorAll('#rankingBody tr');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                const docId = parseInt(row.getAttribute('data-docid'));
                if (docId) {
                    selectedDocId = docId;
                    renderResults(currentData);
                }
            });

            // Hover effects
            row.addEventListener('mouseenter', () => {
                if (!row.style.borderLeft.includes('2px solid #0d6efd')) {
                    row.style.backgroundColor = '#f8fafc';
                }
            });
            row.addEventListener('mouseleave', () => {
                if (!row.style.borderLeft.includes('2px solid #0d6efd')) {
                    const isTop3 = row.querySelector('td:first-child').textContent.includes('🥇') || 
                                   row.querySelector('td:first-child').textContent.includes('🥈') || 
                                   row.querySelector('td:first-child').textContent.includes('🥉');
                    row.style.backgroundColor = isTop3 ? '#faf9f6' : '';
                }
            });
        });

        // Add category filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                const selected = e.target.value;
                const rows = contentEl.querySelectorAll('#rankingBody tr');
                rows.forEach(row => {
                    const category = row.getAttribute('data-category') || '';
                    if (selected === 'all' || category === selected) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
    };

    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // ============================================================
    // Component Creation
    // ============================================================
    const createComponent = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e9ecef',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            },
            child: [
                // Header
                $({
                    tag: 'div',
                    style: {
                        padding: '18px 24px',
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        flexShrink: '0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: { display: 'flex', alignItems: 'center', gap: '14px' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-trophy' },
                                    style: { fontSize: '24px', color: '#ffd700' }
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Best Presenter',
                                            style: {
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#1a2a3a'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Based on Quality of Presentation',
                                            style: {
                                                fontSize: '12px',
                                                color: '#94a3b8',
                                                fontWeight: '400'
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                // Event Selector
                $({
                    tag: 'div',
                    style: {
                        padding: '14px 24px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        flexShrink: '0'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: 'Select Event:',
                            style: {
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#475569'
                            }
                        }),
                        $({
                            tag: 'select',
                            style: {
                                padding: '8px 16px',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                fontSize: '13px',
                                backgroundColor: '#ffffff',
                                color: '#1a2a3a',
                                outline: 'none',
                                cursor: 'pointer',
                                minWidth: '280px',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'border-color 0.15s ease'
                            },
                            elementHandler: (el) => {
                                eventSelectEl = el;
                                loadEvents();
                                
                                el.addEventListener('change', (e) => {
                                    const eventId = e.target.value;
                                    loadBestPresenterData(eventId);
                                });
                                
                                el.addEventListener('focus', () => {
                                    el.style.borderColor = '#0d6efd';
                                    el.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                                });
                                el.addEventListener('blur', () => {
                                    el.style.borderColor = '#e9ecef';
                                    el.style.boxShadow = 'none';
                                });
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 20px',
                                backgroundColor: '#0d6efd',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-rotate' }, style: { fontSize: '12px' } }),
                                $({ tag: 'span', text: 'Refresh' })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    if (eventSelectEl) {
                                        const eventId = eventSelectEl.value;
                                        loadBestPresenterData(eventId);
                                    }
                                }
                            },
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = '#0b5ed7';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = '#0d6efd';
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                marginLeft: 'auto',
                                fontSize: '12px',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            },
                            id: 'eventInfoDisplay',
                            child: [
                                $({ tag: 'span', att: { className: 'fa-regular fa-calendar' }, style: { fontSize: '12px' } }),
                                $({ tag: 'span', text: 'Select an event', id: 'eventInfoText' })
                            ]
                        })
                    ]
                }),
                // Content Area
                $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        overflowY: 'auto',
                        padding: '24px',
                        backgroundColor: '#f8fafc'
                    },
                    elementHandler: (el) => {
                        contentEl = el;
                        showPlaceholder('Select an event to view Best Presenter', 'Choose an event from the dropdown above to see the ranking based on Quality of Presentation');
                    }
                })
            ]
        });
    };

    // ============================================================
    // Public API
    // ============================================================
    return {
        element: createComponent(),
        refresh: () => {
            if (currentEventId) {
                loadBestPresenterData(currentEventId);
            }
        },
        setEvent: (eventId) => {
            if (eventSelectEl) {
                eventSelectEl.value = eventId;
                loadBestPresenterData(eventId);
            }
        }
    };
};

export const showBestPresenterModal = (preselectedEventId = null) => {
    const bestPresenter = BestPresenter();
    
    const modal = CustomModal({
        title: 'Best Presenter',
        size: 'full',
        content: () => {
            return bestPresenter.element;
        },
        showCloseButton: true,
        closeOnOverlayClick: true,
        onClose: () => {
            // Cleanup if needed
        }
    });

    if (preselectedEventId) {
        setTimeout(() => {
            bestPresenter.setEvent(preselectedEventId);
        }, 300);
    }

    return modal;
};
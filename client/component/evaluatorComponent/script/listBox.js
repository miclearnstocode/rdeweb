import { $, ConfirmationAlert, Request, Waiting } from '../../../lib/lib.js'
import { EntryList, BestPresenterRanking } from "./EntryList.js";

export const Search = (method) => {
    // Get event ID for ranking
    const getEventId = () => {
        if (window.eventId) return window.eventId
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get('eventId') || null
    }

    return $({
        tag: 'div',
        att: { className: 'searchBarEval' },
        style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: '12px',
            padding: '8px 0',
            width: '100%',
            position: 'relative',
            zIndex: '10',
        },
        child: [
            // Search Box - This will EXPAND to fill available space
            $({
                tag: 'div',
                att: { className: 'searchBox' },
                style: {
                    flex: '1 1 0%',
                    minWidth: '0',
                    maxWidth: '100%',
                    position: 'relative',
                    zIndex: '11',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-magnifying-glass searchIcEval'
                        },
                        style: {
                            color: '#94a3b8',
                            fontSize: '14px',
                            marginRight: '10px',
                            flexShrink: '0',
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'search',
                            placeholder: 'Search research papers...',
                            className: 'searchInputEval',
                            id: 'search-input-evaluation',
                            name: 'searchInputEvaluation'
                        },
                        style: { 
                            height: 'auto',
                            minWidth: '0',
                            width: '100%',
                            flex: '1 1 auto',
                            boxSizing: 'border-box',
                            position: 'relative',
                            zIndex: '12',
                        },
                        event: {
                            type: 'input',
                            method: method
                        }
                    })
                ]
            }),

            // Right side: Total Entries + Ranking Button - This will NOT shrink
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexShrink: '0',
                    flexWrap: 'nowrap',
                    position: 'relative',
                    zIndex: '13',
                    background: 'transparent',
                },
                child: [
                    // Total Entries
                    $({
                        tag: 'div',
                        att: { className: 'entriesCounter' },
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            flexShrink: '0',
                            position: 'relative',
                            zIndex: '14',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-chart-simple'
                                },
                                style: {
                                    fontSize: '14px',
                                    color: '#3b82f6',
                                    flexShrink: '0',
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'Total Entries:',
                                style: {
                                    flexShrink: '0',
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'countNumber' },
                                style: {
                                    flexShrink: '0',
                                },
                                elementHandler: async (el) => {
                                    try {
                                        const req = new Request('/eventRequest')
                                        req.Post([{ name: 'collectEntries', value: '1' }])
                                        const data = await req.Send()

                                        if (typeof data === 'object' && data !== null) {
                                            el.textContent = data.count || '0'
                                        } else {
                                            el.textContent = data || '0'
                                        }
                                    } catch (err) {
                                        console.error('Error loading entry count:', err)
                                        el.textContent = '0'
                                    }
                                }
                            })
                        ]
                    }),

                    // Separator
                    $({
                        tag: 'span',
                        style: {
                            color: '#e2e8f0',
                            fontSize: '18px',
                            fontWeight: '300',
                            padding: '0 2px',
                            flexShrink: '0',
                            position: 'relative',
                            zIndex: '14',
                        },
                        text: '|'
                    }),

                    // Ranking Button
                    $({
                        tag: 'div',
                        style: {
                            flexShrink: '0',
                            position: 'relative',
                            zIndex: '14',
                        },
                        elementHandler: (el) => {
                            const eventId = getEventId()
                            if (eventId) {
                                const rankingBtn = BestPresenterRanking({
                                    eventId: eventId,
                                    sourceTable: 'researchfile',
                                    onUpdate: () => {
                                        const panel = document.querySelector('.listBox')
                                        if (panel) {
                                            const event = new Event('refresh')
                                            panel.dispatchEvent(event)
                                        }
                                    }
                                })
                                el.appendChild(rankingBtn)
                            } else {
                                const disabledBtn = document.createElement('button')
                                disabledBtn.style.cssText = `
                                    padding: 5px 14px;
                                    border-radius: 8px;
                                    border: 1px solid #e2e8f0;
                                    background: #f1f5f9;
                                    color: #94a3b8;
                                    font-size: 12px;
                                    font-weight: 600;
                                    cursor: not-allowed;
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                    white-space: nowrap;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    opacity: 0.6;
                                    position: relative;
                                    z-index: 15;
                                `
                                disabledBtn.innerHTML = `
                                    <i class="fa-solid fa-ranking-star" style="font-size: 12px;"></i>
                                    <span>Rankings</span>
                                `
                                disabledBtn.title = 'No event selected'
                                el.appendChild(disabledBtn)
                            }
                        }
                    })
                ]
            })
        ]
    })
}

export const CategoryTabs = ({ categories, onTabChange, activeCategory, categoryCounts }) => {
    if (!categories || categories.length <= 1) {
        return null;
    }

    return $({
        tag: 'div',
        att: { className: 'category-tabs-container' },
        style: {
            display: 'flex',
            gap: '4px',
            padding: '4px 0 12px 0',
            overflowX: 'auto',
            flexWrap: 'wrap',
        },
        child: categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts && categoryCounts[cat.id] ? categoryCounts[cat.id].count : 0;

            return $({
                tag: 'button',
                att: {
                    className: `category-tab ${isActive ? 'active' : ''}`,
                    'data-category-id': cat.id,
                    'data-category-name': cat.name
                },
                style: {
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    fontWeight: isActive ? '600' : '500',
                    boxShadow: isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid ' + (isActive ? '#bfdbfe' : '#e8ecf0'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: `tab-icon ${getCategoryIcon(cat.name)}`
                        },
                        style: {
                            color: isActive ? '#2563eb' : '#94a3b8',
                            fontSize: '13px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: cat.name,
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'tab-count' },
                        style: {
                            backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#64748b',
                            padding: '1px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                        },
                        text: count.toString()
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'tab-indicator' },
                        style: {
                            position: 'absolute',
                            bottom: '-1px',
                            left: isActive ? '20%' : '50%',
                            width: isActive ? '60%' : '0%',
                            height: '2px',
                            background: '#2563eb',
                            borderRadius: '2px',
                            opacity: isActive ? '1' : '0',
                            transition: 'all 0.3s ease',
                        }
                    })
                ],
                event: {
                    type: 'click',
                    method: (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ripple = document.createElement('span');
                        ripple.className = 'ripple';
                        const size = Math.max(rect.width, rect.height);
                        ripple.style.cssText = `
                            position: absolute;
                            border-radius: 50%;
                            background: rgba(37, 99, 235, 0.15);
                            width: ${size}px;
                            height: ${size}px;
                            left: ${e.clientX - rect.left - size / 2}px;
                            top: ${e.clientY - rect.top - size / 2}px;
                            pointer-events: none;
                            animation: rippleEffect 0.6s ease-out forwards;
                        `;
                        e.currentTarget.appendChild(ripple);
                        setTimeout(() => ripple.remove(), 600);

                        onTabChange(cat.id, cat.name);
                    }
                }
            });
        })
    });
};

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
    }
`;
document.head.appendChild(style);

const getCategoryIcon = (categoryName) => {
    const iconMap = {
        'Social Science': 'fa-solid fa-users',
        'Natural / Biological': 'fa-solid fa-leaf',
        'Food': 'fa-solid fa-utensils',
        'Development': 'fa-solid fa-chart-line',
        'Extension': 'fa-solid fa-handshake',
        'default': 'fa-solid fa-folder'
    };
    return iconMap[categoryName] || iconMap.default;
};

// Helper function to determine if an event is undergraduate or graduate
const getEventType = (eventName) => {
    const name = eventName?.toLowerCase() || '';
    if (name.includes('undergraduate')) return 'undergraduate';
    if (name.includes('graduate')) return 'graduate';
    return 'other';
};

// Helper function to get event icon and color
const getEventStyles = (eventName) => {
    const type = getEventType(eventName);
    if (type === 'undergraduate') {
        return {
            icon: 'fa-solid fa-graduation-cap',
            color: '#3b82f6',
            bgColor: '#eff6ff',
            borderColor: '#bfdbfe',
            label: 'Undergraduate Research'
        };
    } else if (type === 'graduate') {
        return {
            icon: 'fa-solid fa-university',
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            borderColor: '#ddd6fe',
            label: 'Graduate Research'
        };
    }
    return {
        icon: 'fa-solid fa-file-lines',
        color: '#64748b',
        bgColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        label: 'Research'
    };
};

export const Box = (getBody) => {
    let panelBox
    let currentCategoryId = null;
    let currentCategoryName = null;
    let allData = [];
    let categoryTabsContainer = null;
    let categoryCounts = {};
    let totalCount = 0;
    let allCategories = [];
    let tabsRendered = false;
    let evalData = null;
    let currentEventId = null;
    let groupedEventData = []; // Store grouped data by event

    // Update total count function
    const updateTotalCount = () => {
        const countElement = document.querySelector('.countNumber');
        if (countElement) {
            countElement.textContent = totalCount.toString();
        }
    };

    // Function to update category badge counts
    const updateCategoryCounts = () => {
        if (!categoryTabsContainer) return;
        
        const tabs = categoryTabsContainer.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            const categoryId = parseInt(tab.dataset.categoryId);
            
            // Count items in this category from allData
            const count = allData.filter(item => {
                const itemCategoryId = parseInt(item.category_id || item.catId || -1);
                return itemCategoryId === categoryId;
            }).length;
            
            const badge = tab.querySelector('.tab-count');
            if (badge) {
                badge.textContent = count.toString();
            }
        });
    };

    // Render event group header
    const renderEventGroupHeader = (eventName, eventData) => {
        const styles = getEventStyles(eventName);
        const count = eventData.length;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            margin: 20px 0 12px 0;
            background: ${styles.bgColor};
            border-radius: 12px;
            border-left: 4px solid ${styles.color};
            transition: all 0.2s ease;
        `;

        // Icon with gradient background
        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: ${styles.color}20;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        `;
        const icon = document.createElement('i');
        icon.className = styles.icon;
        icon.style.cssText = `
            font-size: 18px;
            color: ${styles.color};
        `;
        iconWrapper.appendChild(icon);

        // Event name and count
        const infoWrapper = document.createElement('div');
        infoWrapper.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
        `;
        
        const nameEl = document.createElement('span');
        nameEl.textContent = eventName || 'Untitled Event';
        nameEl.style.cssText = `
            font-size: 15px;
            font-weight: 600;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const metaEl = document.createElement('span');
        metaEl.style.cssText = `
            font-size: 12px;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        const badge = document.createElement('span');
        badge.style.cssText = `
            padding: 2px 10px;
            border-radius: 12px;
            background: ${styles.color}15;
            color: ${styles.color};
            font-weight: 500;
            font-size: 11px;
        `;
        badge.textContent = `${count} paper${count > 1 ? 's' : ''}`;
        metaEl.appendChild(badge);

        // Add a tag indicating event type
        const typeTag = document.createElement('span');
        typeTag.style.cssText = `
            padding: 2px 10px;
            border-radius: 12px;
            background: ${styles.color}10;
            color: ${styles.color};
            font-weight: 500;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        typeTag.textContent = styles.label;
        metaEl.appendChild(typeTag);

        infoWrapper.appendChild(nameEl);
        infoWrapper.appendChild(metaEl);

        // Optional: Add a count pill on the right
        const countPill = document.createElement('div');
        countPill.style.cssText = `
            padding: 4px 12px;
            border-radius: 20px;
            background: ${styles.color};
            color: white;
            font-size: 13px;
            font-weight: 600;
            flex-shrink: 0;
        `;
        countPill.textContent = count;

        header.appendChild(iconWrapper);
        header.appendChild(infoWrapper);
        header.appendChild(countPill);

        return header;
    };

    // Main filter function with event grouping
    const filterAndRender = (categoryId, searchTerm = '') => {
        if (!panelBox) return;

        panelBox.innerHTML = '';

        // First, filter data by category
        let filteredData = allData.filter(item => {
            const itemCategoryId = parseInt(item.category_id || item.catId || -1);
            
            if (categoryId === 'all' || categoryId === null || categoryId === undefined) {
                return true;
            }
            
            const filterId = parseInt(categoryId);
            return itemCategoryId === filterId;
        });

        // Apply search filter if provided
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.trim().toLowerCase();
            filteredData = filteredData.filter(item => {
                const searchText = `${item.title || ''} ${item.author || ''} ${item.presenter || ''} ${item.coauthor || ''}`.toLowerCase();
                return searchText.includes(term);
            });
        }

        // Group filtered data by event
        const groupedByEvent = {};
        filteredData.forEach(item => {
            const eventKey = item.eventId || item.event_id || 'unknown';
            if (!groupedByEvent[eventKey]) {
                groupedByEvent[eventKey] = {
                    eventName: item.event_name || 'Untitled Event',
                    eventId: eventKey,
                    items: []
                };
            }
            groupedByEvent[eventKey].items.push(item);
        });

        // Convert to array and sort: Undergraduate first, then Graduate
        const sortedEvents = Object.values(groupedByEvent).sort((a, b) => {
            const typeA = getEventType(a.eventName);
            const typeB = getEventType(b.eventName);
            if (typeA === 'undergraduate' && typeB !== 'undergraduate') return -1;
            if (typeA !== 'undergraduate' && typeB === 'undergraduate') return 1;
            if (typeA === 'graduate' && typeB !== 'graduate') return -1;
            if (typeA !== 'graduate' && typeB === 'graduate') return 1;
            return a.eventName.localeCompare(b.eventName);
        });

        if (sortedEvents.length === 0) {
            const categoryName = currentCategoryName || 'selected';
            panelBox.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#94a3b8;">
                    <div style="font-size:48px;margin-bottom:16px;">📭</div>
                    <h3 style="color:#475569;margin-bottom:8px;">No entries found</h3>
                    <p style="color:#94a3b8;font-size:14px;">There are no research papers in the "${categoryName}" category for your assigned events yet.</p>
                </div>
            `;
            return;
        }

        // Render each event group
        let totalRendered = 0;
        sortedEvents.forEach((eventGroup, groupIndex) => {
            // Add a divider between different event types
            if (groupIndex > 0) {
                const prevEvent = sortedEvents[groupIndex - 1];
                const currentType = getEventType(eventGroup.eventName);
                const prevType = getEventType(prevEvent.eventName);
                
                if (currentType !== prevType) {
                    const divider = document.createElement('div');
                    divider.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        margin: 28px 0 12px 0;
                        padding: 0 8px;
                    `;
                    
                    const line = document.createElement('div');
                    line.style.cssText = `
                        flex: 1;
                        height: 1px;
                        background: linear-gradient(to right, transparent, #e2e8f0);
                    `;
                    
                    const label = document.createElement('span');
                    label.style.cssText = `
                        font-size: 11px;
                        font-weight: 600;
                        color: #94a3b8;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        white-space: nowrap;
                    `;
                    label.textContent = currentType === 'undergraduate' ? 'Undergraduate Research' : 'Graduate Research';
                    
                    const line2 = document.createElement('div');
                    line2.style.cssText = `
                        flex: 1;
                        height: 1px;
                        background: linear-gradient(to left, transparent, #e2e8f0);
                    `;
                    
                    divider.appendChild(line);
                    divider.appendChild(label);
                    divider.appendChild(line2);
                    panelBox.appendChild(divider);
                }
            }

            // Render event group header
            const header = renderEventGroupHeader(eventGroup.eventName, eventGroup.items);
            panelBox.appendChild(header);

            // Render entries for this event
            eventGroup.items.forEach((val) => {
                let coAuthors = val.coauthor || val.coAuthors || null;
                if (typeof coAuthors === 'string' && coAuthors.startsWith('[') && coAuthors.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(coAuthors);
                        if (Array.isArray(parsed)) {
                            coAuthors = parsed.join(', ');
                        }
                    } catch (e) { }
                }
                if (Array.isArray(coAuthors)) {
                    coAuthors = coAuthors.join(', ');
                }

                const entryElement = EntryList({
                    title: val.title,
                    author: val.author,
                    coAuthors: coAuthors,
                    presenter: val.presenter,
                    center: val.center,
                    docId: val.id,
                    eventId: val.eventId || val.event_id,
                    centerId: val.centerId,
                    categoryId: val.category_id || val.catId,
                    categoryName: val.category_name || val.category,
                    hasScore: val.hasScore || false,
                    hasComment: val.hasComment || false,
                    status: val.status || false,
                    userType: val.userType || 'category'
                });
                
                panelBox.appendChild(entryElement);
                totalRendered++;
            });
        });

        updateCategoryCounts();
    };

    // Render tabs function
    const renderTabs = (categories, activeId, counts) => {
        if (!categories || categories.length <= 1) return null;

        const parentContainer = panelBox?.parentElement;
        if (!parentContainer) return null;

        const existingTabs = parentContainer.querySelector('.category-tabs-container');
        if (existingTabs) {
            existingTabs.remove();
        }

        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'category-tabs-container';
        tabsContainer.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 4px 0 12px 0;
            overflow-x: auto;
            flex-wrap: wrap;
        `;

        categories.forEach(cat => {
            const isActive = activeId === cat.id;
            const count = counts && counts[cat.id] ? counts[cat.id].count : 0;

            const tab = document.createElement('button');
            tab.className = `category-tab ${isActive ? 'active' : ''}`;
            tab.dataset.categoryId = cat.id;
            tab.dataset.categoryName = cat.name;

            tab.style.cssText = `
                padding: 8px 16px;
                border-radius: 10px;
                border: 1px solid ${isActive ? '#bfdbfe' : '#e8ecf0'};
                background: ${isActive ? '#eff6ff' : 'transparent'};
                color: ${isActive ? '#2563eb' : '#64748b'};
                font-weight: ${isActive ? '600' : '500'};
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                white-space: nowrap;
                position: relative;
                box-shadow: ${isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none'};
                transform: ${isActive ? 'translateY(-1px)' : 'translateY(0)'};
            `;

            const icon = document.createElement('span');
            icon.className = `tab-icon ${getCategoryIcon(cat.name)}`;
            icon.style.cssText = `
                color: ${isActive ? '#2563eb' : '#94a3b8'};
                font-size: 13px;
            `;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = cat.name;

            const badge = document.createElement('span');
            badge.className = 'tab-count';
            // Use the actual count from allData
            const actualCount = allData.filter(item => {
                const itemCategoryId = parseInt(item.category_id || item.catId || -1);
                return itemCategoryId === cat.id;
            }).length;
            badge.textContent = actualCount.toString();
            badge.style.cssText = `
                padding: 1px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                background: ${isActive ? '#2563eb' : '#f1f5f9'};
                color: ${isActive ? '#ffffff' : '#64748b'};
                transition: all 0.2s ease;
            `;

            const indicator = document.createElement('div');
            indicator.className = 'tab-indicator';
            indicator.style.cssText = `
                position: absolute;
                bottom: -1px;
                left: ${isActive ? '20%' : '50%'};
                width: ${isActive ? '60%' : '0%'};
                height: 2px;
                background: #2563eb;
                border-radius: 2px;
                opacity: ${isActive ? '1' : '0'};
                transition: all 0.3s ease;
            `;

            tab.appendChild(icon);
            tab.appendChild(nameSpan);
            tab.appendChild(badge);
            tab.appendChild(indicator);

            tab.addEventListener('click', (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const size = Math.max(rect.width, rect.height);
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(37, 99, 235, 0.15);
                    width: ${size}px;
                    height: ${size}px;
                    left: ${e.clientX - rect.left - size / 2}px;
                    top: ${e.clientY - rect.top - size / 2}px;
                    pointer-events: none;
                    animation: rippleEffect 0.6s ease-out forwards;
                `;
                e.currentTarget.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                // Update active tab
                updateActiveTab(cat.id, cat.name);
            });

            tabsContainer.appendChild(tab);
        });

        parentContainer.insertBefore(tabsContainer, panelBox);
        return tabsContainer;
    };

    // Update active tab function
    const updateActiveTab = (categoryId, categoryName) => {
        if (!categoryTabsContainer) return;

        currentCategoryId = categoryId;
        currentCategoryName = categoryName;

        const tabs = categoryTabsContainer.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            const tabId = parseInt(tab.dataset.categoryId);
            const isActive = (tabId === categoryId);

            tab.classList.toggle('active', isActive);

            tab.style.background = isActive ? '#eff6ff' : 'transparent';
            tab.style.color = isActive ? '#2563eb' : '#64748b';
            tab.style.fontWeight = isActive ? '600' : '500';
            tab.style.borderColor = isActive ? '#bfdbfe' : '#e8ecf0';
            tab.style.boxShadow = isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none';
            tab.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';

            const icon = tab.querySelector('.tab-icon');
            if (icon) {
                icon.style.color = isActive ? '#2563eb' : '#94a3b8';
            }

            const badge = tab.querySelector('.tab-count');
            if (badge) {
                badge.style.background = isActive ? '#2563eb' : '#f1f5f9';
                badge.style.color = isActive ? '#ffffff' : '#64748b';
            }

            const indicator = tab.querySelector('.tab-indicator');
            if (indicator) {
                indicator.style.width = isActive ? '60%' : '0%';
                indicator.style.left = isActive ? '20%' : '50%';
                indicator.style.opacity = isActive ? '1' : '0';
            }
        });

        filterAndRender(categoryId);
    };

    // Hook up search to filter
    const setupSearchListener = () => {
        const searchInput = document.getElementById('search-input-evaluation');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value;
                filterAndRender(currentCategoryId || 'all', searchTerm);
            });
        }
    };

    // Get list panel function
    const getListPanel = async (panel) => {
        getBody(panel);
        panelBox = panel;

        try {
            // Get user info
            const evalReq = new FormData();
            evalReq.append('evalLeb', '1');
            const evalRes = await fetch('/evaluatorReg', { method: 'POST', body: evalReq });
            evalData = await evalRes.json();

            // Store event ID for ranking
            if (evalData.eventIds && evalData.eventIds.length > 0) {
                currentEventId = evalData.eventIds[0];
                window.eventId = currentEventId;
            }

            const centerLabel = document.getElementById('centerLabel');
            if (centerLabel) {
                if (evalData.userType === 'category' && evalData.categories && evalData.categories.length > 0) {
                    const categoryNames = evalData.categories.map(cat => cat.name).join(', ');
                    centerLabel.textContent = 'Categories: ' + categoryNames;
                } else if (evalData.userType === 'center' && evalData.displayCenter) {
                    centerLabel.textContent = 'Center: ' + evalData.displayCenter;
                } else {
                    centerLabel.textContent = 'No Access';
                }
            }

            // Get category counts
            try {
                const countReq = new FormData();
                countReq.append('collectEntries', '1');
                const countRes = await fetch('/eventRequest', { method: 'POST', body: countReq });
                const countData = await countRes.json();

                if (countData.categoryCounts) {
                    categoryCounts = countData.categoryCounts;
                }

                if (countData.count !== undefined) {
                    totalCount = countData.count;
                    updateTotalCount();
                }
            } catch (err) {
                console.error('Error loading category counts:', err);
            }

            // Get event IDs
            const eventIds = evalData.eventIds || [];
            
            if (eventIds.length === 0) {
                panel.innerHTML = `
                    <div style="text-align:center;padding:48px 24px;color:#f59e0b;">
                        <div style="font-size:48px;margin-bottom:16px;">📋</div>
                        <h3 style="color:#475569;margin-bottom:8px;">No Events Assigned</h3>
                        <p style="color:#94a3b8;font-size:14px;">You don't have any events assigned yet.</p>
                    </div>
                `;
                return;
            }

            // Show loading state
            panel.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#94a3b8;">
                    <div style="font-size:48px;margin-bottom:16px;">⏳</div>
                    <h3 style="color:#475569;margin-bottom:8px;">Loading entries...</h3>
                    <p style="color:#94a3b8;font-size:14px;">Please wait while we fetch your research papers.</p>
                </div>
            `;

            // Build base form data
            const allDataCombined = [];
            const eventDetails = {};
            
            // Make separate requests for each event
            for (let i = 0; i < eventIds.length; i++) {
                const eventId = eventIds[i];
                
                const eventForm = new FormData();
                eventForm.append('researchSubmit', 'true');
                
                if (evalData.userType === 'center') {
                    eventForm.append('center', evalData.centerId || '');
                    eventForm.append('filterType', 'center');
                } else if (evalData.userType === 'category') {
                    eventForm.append('categoryIds', JSON.stringify(evalData.categoryIds || []));
                    eventForm.append('filterType', 'category');
                }
                
                eventForm.append('event', eventId);

                try {
                    const res = await fetch('/uploadResearchFile', { 
                        method: 'POST', 
                        body: eventForm 
                    });
                    const data = await res.json();
                    
                    // Store event details
                    eventDetails[eventId] = {
                        eventName: data.event_name || 'Untitled Event',
                        sourceTable: data.source_table || 'researchfile'
                    };
                    
                    if (data.list && data.list.length > 0) {
                        data.list.forEach(item => {
                            item.eventId = eventId;
                            item.event_name = data.event_name || 'Untitled Event';
                            item.userType = evalData.userType;
                            if (!item.category_id && item.catId) {
                                item.category_id = item.catId;
                            }
                        });
                        allDataCombined.push(...data.list);
                    }
                } catch (err) {
                    console.error(`Error loading event ${eventId}:`, err);
                }
            }

            // Store combined data
            allData = allDataCombined;
            totalCount = allData.length;
            updateTotalCount();

            // Get the parent container
            const parentContainer = panel.parentElement;

            // Show tabs if user has multiple categories
            if (evalData.userType === 'category' && evalData.categories && evalData.categories.length > 1) {
                allCategories = evalData.categories;
                currentCategoryId = evalData.categories[0].id;
                currentCategoryName = evalData.categories[0].name;

                categoryTabsContainer = renderTabs(
                    evalData.categories,
                    currentCategoryId,
                    categoryCounts
                );

                filterAndRender(currentCategoryId);
            } else if (evalData.userType === 'category' && evalData.categories && evalData.categories.length === 1) {
                currentCategoryId = evalData.categories[0].id;
                currentCategoryName = evalData.categories[0].name;
                filterAndRender('all');
            } else {
                filterAndRender('all');
            }

            tabsRendered = true;
            
            // Setup search listener after rendering
            setTimeout(setupSearchListener, 100);

        } catch (err) {
            console.error('Error loading research list:', err);
            panel.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#ef4444;">
                    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                    <h3 style="margin-bottom:8px;">Error loading entries</h3>
                    <p style="font-size:14px;color:#94a3b8;">Please refresh the page to try again.</p>
                    <p style="font-size:12px;color:#94a3b8;margin-top:8px;">${err.message || 'Unknown error'}</p>
                </div>
            `;
        }
    };

    // Return the component
    return ($({
        tag: 'div',
        att: { className: 'listBoxWrapper' },
        style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
        },
        child: [
            $({
                tag: 'div',
                att: { className: 'listBox' },
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px 16px',
                },
                elementHandler: getListPanel
            })
        ]
    }));
};
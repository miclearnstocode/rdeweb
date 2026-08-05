import { $, ConfirmationAlert, Request, Waiting } from '../../../lib/lib.js'
import { EntryList } from "./EntryList.js";


export const Search = (method) => {
    return $({
        tag: 'div',
        att: { className: 'searchBarEval' },
        child: [
            $({
                tag: 'div',
                att: { className: 'searchBox' },
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
                        style: { height: 'auto' },
                        event: {
                            type: 'input',
                            method: method
                        }
                    })
                ]
            }),
            $({
                tag: 'div',
                att: { className: 'entriesCounter' },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-chart-simple'
                        },
                        style: {
                            fontSize: '14px',
                            color: '#3b82f6'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Total Entries:'
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'countNumber' },
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
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: `tab-icon ${getCategoryIcon(cat.name)}`
                        },
                        style: {
                            color: isActive ? '#2563eb' : '#94a3b8'
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
                            color: isActive ? '#ffffff' : '#64748b'
                        },
                        text: count.toString()
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'tab-indicator' },
                        style: {
                            width: isActive ? '60%' : '0%',
                            left: isActive ? '20%' : '50%',
                            opacity: isActive ? '1' : '0'
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
                        ripple.style.width = ripple.style.height = size + 'px';
                        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                        e.currentTarget.appendChild(ripple);
                        setTimeout(() => ripple.remove(), 600);

                        onTabChange(cat.id, cat.name);
                    }
                }
            });
        })
    });
};

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

    // Main filter function
    const filterByCategory = (categoryId) => {
        if (!panelBox) return;

        panelBox.innerHTML = '';

        // Log for debugging
        console.log('Filtering by category ID:', categoryId);
        console.log('All data:', allData);

        const filteredData = allData.filter(item => {
            const itemCategoryId = parseInt(item.category_id || item.catId || -1);
            
            // If categoryId is 'all' or null, show all
            if (categoryId === 'all' || categoryId === null || categoryId === undefined) {
                return true;
            }
            
            const filterId = parseInt(categoryId);
            return itemCategoryId === filterId;
        });

        console.log('Filtered data count:', filteredData.length);

        // Update badge counts after filtering
        updateCategoryCounts();

        if (filteredData.length > 0) {
            filteredData.forEach((val) => {
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

                panelBox.appendChild(EntryList({
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
                }));
            });
        } else {
            const categoryName = currentCategoryName || 'selected';
            panelBox.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#94a3b8;">
                    <div style="font-size:48px;margin-bottom:16px;">📭</div>
                    <h3 style="color:#475569;margin-bottom:8px;">No entries found</h3>
                    <p style="color:#94a3b8;font-size:14px;">There are no research papers in the "${categoryName}" category for your assigned events yet.</p>
                </div>
            `;
        }
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

        categories.forEach(cat => {
            const isActive = activeId === cat.id;
            const count = counts && counts[cat.id] ? counts[cat.id].count : 0;

            const tab = document.createElement('button');
            tab.className = `category-tab ${isActive ? 'active' : ''}`;
            tab.dataset.categoryId = cat.id;
            tab.dataset.categoryName = cat.name;

            tab.style.backgroundColor = isActive ? '#eff6ff' : 'transparent';
            tab.style.color = isActive ? '#2563eb' : '#64748b';
            tab.style.fontWeight = isActive ? '600' : '500';
            tab.style.boxShadow = isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none';
            tab.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';

            const icon = document.createElement('span');
            icon.className = `tab-icon ${getCategoryIcon(cat.name)}`;
            icon.style.color = isActive ? '#2563eb' : '#94a3b8';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = cat.name;

            const badge = document.createElement('span');
            badge.className = 'tab-count';
            badge.style.backgroundColor = isActive ? '#2563eb' : '#f1f5f9';
            badge.style.color = isActive ? '#ffffff' : '#64748b';
            // Use the actual count from allData
            const actualCount = allData.filter(item => {
                const itemCategoryId = parseInt(item.category_id || item.catId || -1);
                return itemCategoryId === cat.id;
            }).length;
            badge.textContent = actualCount.toString();

            const indicator = document.createElement('div');
            indicator.className = 'tab-indicator';
            indicator.style.width = isActive ? '60%' : '0%';
            indicator.style.left = isActive ? '20%' : '50%';
            indicator.style.opacity = isActive ? '1' : '0';

            tab.appendChild(icon);
            tab.appendChild(nameSpan);
            tab.appendChild(badge);
            tab.appendChild(indicator);

            tab.addEventListener('click', (e) => {
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

            tab.style.backgroundColor = isActive ? '#eff6ff' : 'transparent';
            tab.style.color = isActive ? '#2563eb' : '#64748b';
            tab.style.fontWeight = isActive ? '600' : '500';
            tab.style.boxShadow = isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none';
            tab.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';

            const icon = tab.querySelector('.tab-icon');
            if (icon) {
                icon.style.color = isActive ? '#2563eb' : '#94a3b8';
            }

            const badge = tab.querySelector('.tab-count');
            if (badge) {
                badge.style.backgroundColor = isActive ? '#2563eb' : '#f1f5f9';
                badge.style.color = isActive ? '#ffffff' : '#64748b';
            }

            const indicator = tab.querySelector('.tab-indicator');
            if (indicator) {
                indicator.style.width = isActive ? '60%' : '0%';
                indicator.style.left = isActive ? '20%' : '50%';
                indicator.style.opacity = isActive ? '1' : '0';
            }
        });

        // Filter by the selected category
        filterByCategory(categoryId);
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
                    
                    if (data.list && data.list.length > 0) {
                        data.list.forEach(item => {
                            item.eventId = eventId;
                            item.userType = evalData.userType;
                            // Ensure category_id is set
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
            console.log('Total data loaded:', allData.length);

            // Get the parent container
            const parentContainer = panel.parentElement;

            // Show tabs if user has multiple categories
            if (evalData.userType === 'category' && evalData.categories && evalData.categories.length > 1) {
                allCategories = evalData.categories;
                // Set the first category as active
                currentCategoryId = evalData.categories[0].id;
                currentCategoryName = evalData.categories[0].name;

                categoryTabsContainer = renderTabs(
                    evalData.categories,
                    currentCategoryId,
                    categoryCounts
                );

                // Filter by the first category
                filterByCategory(currentCategoryId);
            } else if (evalData.userType === 'category' && evalData.categories && evalData.categories.length === 1) {
                currentCategoryId = evalData.categories[0].id;
                currentCategoryName = evalData.categories[0].name;
                filterByCategory('all');
            } else {
                filterByCategory('all');
            }

            tabsRendered = true;

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
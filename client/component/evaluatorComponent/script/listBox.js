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

                                // Handle both JSON and string responses
                                if (typeof data === 'object' && data !== null) {
                                    // JSON response with count property
                                    el.textContent = data.count || '0'
                                } else {
                                    // String response (backward compatibility)
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
                    // Icon for each category
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
                    // Count badge
                    $({
                        tag: 'span',
                        att: { className: 'tab-count' },
                        style: {
                            backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#64748b'
                        },
                        text: count.toString()
                    }),
                    // Active indicator underline
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
                        // Add ripple effect
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

    const updateTotalCount = () => {
        // Update the total entries counter
        const countElement = document.querySelector('.countNumber');
        if (countElement) {
            countElement.textContent = totalCount.toString();
        }
    };

    // Separate function to render tabs
    const renderTabs = (categories, activeId, counts) => {
        if (!categories || categories.length <= 1) return null;

        // Remove existing tabs
        const parentContainer = panelBox?.parentElement;
        if (!parentContainer) return null;

        const existingTabs = parentContainer.querySelector('.category-tabs-container');
        if (existingTabs) {
            existingTabs.remove();
        }

        // Create new tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'category-tabs-container';

        categories.forEach(cat => {
            const isActive = activeId === cat.id;
            const count = counts && counts[cat.id] ? counts[cat.id].count : 0;

            const tab = document.createElement('button');
            tab.className = `category-tab ${isActive ? 'active' : ''}`;
            tab.dataset.categoryId = cat.id;
            tab.dataset.categoryName = cat.name;

            // Set styles
            tab.style.backgroundColor = isActive ? '#eff6ff' : 'transparent';
            tab.style.color = isActive ? '#2563eb' : '#64748b';
            tab.style.fontWeight = isActive ? '600' : '500';
            tab.style.boxShadow = isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none';
            tab.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';

            // Create tab content
            const icon = document.createElement('span');
            icon.className = `tab-icon ${getCategoryIcon(cat.name)}`;
            icon.style.color = isActive ? '#2563eb' : '#94a3b8';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = cat.name;

            const badge = document.createElement('span');
            badge.className = 'tab-count';
            badge.style.backgroundColor = isActive ? '#2563eb' : '#f1f5f9';
            badge.style.color = isActive ? '#ffffff' : '#64748b';
            badge.textContent = count.toString();

            const indicator = document.createElement('div');
            indicator.className = 'tab-indicator';
            indicator.style.width = isActive ? '60%' : '0%';
            indicator.style.left = isActive ? '20%' : '50%';
            indicator.style.opacity = isActive ? '1' : '0';

            tab.appendChild(icon);
            tab.appendChild(nameSpan);
            tab.appendChild(badge);
            tab.appendChild(indicator);

            // Add click event
            tab.addEventListener('click', (e) => {
                // Add ripple effect
                const rect = e.currentTarget.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                e.currentTarget.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                // Update active tab without recreating all tabs
                updateActiveTab(cat.id, cat.name);
            });

            tabsContainer.appendChild(tab);
        });

        parentContainer.insertBefore(tabsContainer, panelBox);
        return tabsContainer;
    };

    // Function to update active tab without recreating
    const updateActiveTab = (categoryId, categoryName) => {
        if (!categoryTabsContainer) return;

        currentCategoryId = categoryId;
        currentCategoryName = categoryName;

        const tabs = categoryTabsContainer.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            const tabId = parseInt(tab.dataset.categoryId);
            const isActive = (tabId === categoryId);

            // Update class
            if (isActive) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }

            // Update styles
            tab.style.backgroundColor = isActive ? '#eff6ff' : 'transparent';
            tab.style.color = isActive ? '#2563eb' : '#64748b';
            tab.style.fontWeight = isActive ? '600' : '500';
            tab.style.boxShadow = isActive ? '0 1px 3px rgba(59, 130, 246, 0.1)' : 'none';
            tab.style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';

            // Update icon
            const icon = tab.querySelector('.tab-icon');
            if (icon) {
                icon.style.color = isActive ? '#2563eb' : '#94a3b8';
            }

            // Update badge
            const badge = tab.querySelector('.tab-count');
            if (badge) {
                badge.style.backgroundColor = isActive ? '#2563eb' : '#f1f5f9';
                badge.style.color = isActive ? '#ffffff' : '#64748b';
            }

            // Update indicator
            const indicator = tab.querySelector('.tab-indicator');
            if (indicator) {
                if (isActive) {
                    indicator.style.width = '60%';
                    indicator.style.left = '20%';
                    indicator.style.opacity = '1';
                } else {
                    indicator.style.width = '0%';
                    indicator.style.left = '50%';
                    indicator.style.opacity = '0';
                }
            }
        });

        // Filter data for the selected category
        filterByCategory(categoryId);
    };

    const filterByCategory = (categoryId) => {
        if (!panelBox) return;

        // Clear the panel
        panelBox.innerHTML = '';

        // Filter data
        const filteredData = allData.filter(item => {
            if (categoryId === 'all') {
                return true;
            }
            return item.category_id == categoryId || item.catId == categoryId;
        });

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
                    categoryName: val.category_name,
                    hasScore: val.hasScore || false,
                    hasComment: val.hasComment || false,
                    status: val.status || false,
                    userType: val.userType || 'category'
                }));
            });
        } else {
            panelBox.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#94a3b8;">
                    <div style="font-size:48px;margin-bottom:16px;">📭</div>
                    <h3 style="color:#475569;margin-bottom:8px;">No entries found</h3>
                    <p style="color:#94a3b8;font-size:14px;">There are no research papers in the "${currentCategoryName || 'selected'}" category for this event yet.</p>
                </div>
            `;
        }
    };

    const getListPanel = async (panel) => {
        getBody(panel);
        panelBox = panel;

        try {
            // Get user info (center or categories)
            const evalReq = new FormData();
            evalReq.append('evalLeb', '1');
            const evalRes = await fetch('/evaluatorReg', { method: 'POST', body: evalReq });
            const evalData = await evalRes.json();

            console.log('User Data:', evalData);

            // Update the center display with dynamic categories
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

            // Get category counts and total count
            try {
                const countReq = new FormData();
                countReq.append('collectEntries', '1');
                const countRes = await fetch('/eventRequest', { method: 'POST', body: countReq });
                const countData = await countRes.json();

                if (countData.categoryCounts) {
                    categoryCounts = countData.categoryCounts;
                }

                // Set total count from response
                if (countData.count !== undefined) {
                    totalCount = countData.count;
                    updateTotalCount();
                }
            } catch (err) {
                console.error('Error loading category counts:', err);
            }

            // Get research list
            const form = new FormData();
            form.append('researchSubmit', 'true');

            if (evalData.userType === 'center') {
                form.append('center', evalData.centerId || '');
                form.append('filterType', 'center');
            } else if (evalData.userType === 'category') {
                form.append('categoryIds', JSON.stringify(evalData.categoryIds || []));
                form.append('filterType', 'category');
            } else {
                panel.innerHTML = `
                    <div style="text-align:center;padding:48px 24px;color:#ef4444;">
                        <div style="font-size:48px;margin-bottom:16px;">🚫</div>
                        <h3 style="color:#475569;margin-bottom:8px;">No Access Rights</h3>
                        <p style="color:#94a3b8;font-size:14px;">You don't have permission to view any documents.</p>
                    </div>
                `;
                return;
            }

            form.append('event', evalData.eventId || '');

            const res = await fetch('/evaluatorReg', { method: 'POST', body: form });
            const data = await res.json();

            allData = data.list || [];

            // Store user type in each item
            allData.forEach(item => {
                item.userType = evalData.userType;
            });

            // Get the parent container
            const parentContainer = panel.parentElement;

            // Show tabs if user has multiple categories
            if (evalData.userType === 'category' && evalData.categories && evalData.categories.length > 1) {
                // Store categories for later use
                allCategories = evalData.categories;

                // Set default category to first one
                currentCategoryId = evalData.categories[0].id;
                currentCategoryName = evalData.categories[0].name;

                // Render tabs
                categoryTabsContainer = renderTabs(
                    evalData.categories,
                    currentCategoryId,
                    categoryCounts
                );

                // Filter by first category
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
                </div>
            `;
        }
    };

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
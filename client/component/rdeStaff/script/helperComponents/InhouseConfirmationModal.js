import { $, Waiting, CustomModal, showToast, Toast, ConfirmationModal } from "../../../../lib/lib.js";

export const InhouseConfirmationModal = () => {
    let proposals = [];
    let filteredProposals = [];
    let stats = { pending: 0, presented: 0, not_presented: 0, total: 0 };
    let isLoading = false;
    let currentFilter = 'all';
    let searchTerm = '';
    let modalCloseFn = null;

    const fetchProposals = async (statusFilter = 'all') => {
        if (isLoading) return;
        isLoading = true;

        try {
            const formData = new FormData();
            formData.append('action', 'fetch_inhouse');
            
            const statusParam = statusFilter === 'all' ? '' : statusFilter;
            if (statusParam) {
                formData.append('status', statusParam);
            }

            const response = await fetch('/proposedresearch', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status) {
                proposals = result.data || [];
                stats = result.stats || { pending: 0, presented: 0, not_presented: 0, total: 0 };
                applyFilters();
                updateStats();
            } else {
                console.error('Error fetching proposals:', result.message);
                proposals = [];
                filteredProposals = [];
            }
        } catch (error) {
            console.error('Error:', error);
            proposals = [];
            filteredProposals = [];
        } finally {
            isLoading = false;
        }
    };

    const applyFilters = () => {
        let filtered = [...proposals];

        if (currentFilter !== 'all') {
            filtered = filtered.filter(p => p.status === currentFilter);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(p => 
                (p.paper_trail_no && p.paper_trail_no.toLowerCase().includes(term)) ||
                (p.title && p.title.toLowerCase().includes(term)) ||
                (p.authors && p.authors.toLowerCase().includes(term)) ||
                (p.presenter && p.presenter.toLowerCase().includes(term))
            );
        }

        filteredProposals = filtered;
        renderTable();
    };

    const updateStats = () => {
        const statsContainer = document.getElementById('inhouse-stats');
        if (!statsContainer) return;

        statsContainer.innerHTML = '';
        
        const statItems = [
            { label: 'Total', value: stats.total, color: '#4361ee', icon: 'fa-file-lines' },
            { label: 'Pending', value: stats.pending, color: '#f59f00', icon: 'fa-clock' },
            { label: 'Presented', value: stats.presented, color: '#2b8a3e', icon: 'fa-check-circle' },
            { label: 'Not Presented', value: stats.not_presented, color: '#e03131', icon: 'fa-times-circle' }
        ];

        statItems.forEach(stat => {
            const statEl = $({
                tag: 'div',
                style: {
                    padding: '14px 24px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flex: '1',
                    minWidth: '100px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }
                },
                event2: {
                    type: 'mouseleave',
                    method: (e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: '0'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: `fa-solid ${stat.icon}` },
                                style: {
                                    fontSize: '20px',
                                    color: stat.color
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexDirection: 'column'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: stat.value,
                                style: {
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#1a1a2e',
                                    lineHeight: '1.2'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '11px',
                                    color: '#868e96',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: '500'
                                }
                            })
                        ]
                    })
                ]
            });
            statsContainer.appendChild(statEl);
        });
    };

    const getStatusBadge = (status) => {
        const configs = {
            'proposal_presented': { 
                label: 'Presented', 
                color: '#2b8a3e', 
                bg: '#d3f9d8',
                border: '#8ce99a'
            },
            'proposal_not_presented': { 
                label: 'Not Presented', 
                color: '#e03131', 
                bg: '#ffe3e3',
                border: '#ffa8a8'
            },
            'pending_confirmation': { 
                label: 'Pending', 
                color: '#e67700', 
                bg: '#fff3bf',
                border: '#ffd43b'
            }
        };

        const config = configs[status] || configs['pending_confirmation'];
        
        return $({
            tag: 'span',
            text: config.label,
            style: {
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: '20px',
                backgroundColor: config.bg,
                color: config.color,
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.3px',
                border: `1px solid ${config.border}`,
                transition: 'all 0.2s ease'
            }
        });
    };

    const handleConfirm = async (proposal, status) => {
        if (!proposal || !status) return;

        const isPresented = status === 'proposal_presented';

        const confirmMsg = isPresented
            ? 'Are you sure you want to mark this proposal as PRESENTED? This will update the proposal status to indicate that it has already been formally presented.'
            : 'Are you sure you want to mark this proposal as NOT PRESENTED? This will update the proposal status to indicate that it has not yet been formally presented.';
            
        const { closeModal } = ConfirmationModal({
            title: isPresented ? 'Confirm Presentation' : 'Confirm Not Presented',
            message: confirmMsg,
            confirmText: isPresented ? 'Yes, Presented' : 'Yes, Not Presented',
            cancelText: 'Cancel',
            type: isPresented ? 'success' : 'warning',
            onConfirm: async () => {
                // Close the confirmation modal immediately
                if (closeModal) closeModal();
                
                // Show loading overlay
                const loader = Waiting();
                document.body.appendChild(loader);
                
                try {
                    const response = await fetch('/proposedresearch', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            action: 'update_presentation',
                            research_id: proposal.id,
                            status: status
                        })
                    });

                    const result = await response.json();
                    
                    if (result.status) {
                        await fetchProposals(currentFilter);
                        
                        // Use different toast types based on status
                        if (isPresented) {
                            // Presented - Green success toast
                            showToast(
                                `Status updated to PRESENTED`,
                                'success',
                                3000
                            );
                        } else {
                            // Not Presented - Warning/Orange toast
                            showToast(
                                `Status updated to NOT PRESENTED`,
                                'warning',
                                3000
                            );
                        }
                    } else {
                        // Use showToast with correct signature: (message, type, duration)
                        showToast(
                            result.message || 'Update failed',
                            'error',
                            4000
                        );
                    }
                } catch (error) {
                    console.error('Error updating status:', error);
                    
                    // Use showToast with correct signature: (message, type, duration)
                    showToast(
                        error.message || 'An error occurred while updating the status. Please try again.',
                        'error',
                        4000
                    );
                } finally {
                    // Always remove loading overlay
                    if (loader && loader.parentNode) {
                        loader.remove();
                    }
                }
            },
            onCancel: () => {
                console.log('Action cancelled');
            }
        });
    };

    const renderTable = () => {
        const tableBody = document.getElementById('inhouse-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (filteredProposals.length === 0) {
            // ... empty state code ...
            return;
        }

        filteredProposals.forEach(proposal => {
            const isPending = proposal.status === 'pending_confirmation' || !proposal.status;
            
            const row = $({
                tag: 'tr',
                style: {
                    borderBottom: '1px solid #f1f3f5',
                    transition: 'background 0.2s ease'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.target.style.backgroundColor = '#f8f9fa';
                    }
                },
                event2: {
                    type: 'mouseleave',
                    method: (e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }
                },
                child: [
                    // Paper Trail No
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            fontSize: '13px',
                            color: '#1a1a2e',
                            fontWeight: '600'
                        },
                        text: proposal.paper_trail_no || 'N/A'
                    }),
                    // Title
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            fontSize: '13px',
                            color: '#1a1a2e',
                            maxWidth: '200px',
                            wordBreak: 'break-word',
                            fontWeight: '500'
                        },
                        text: proposal.title || 'Untitled'
                    }),
                    // Authors
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            fontSize: '12px',
                            color: '#495057',
                            maxWidth: '150px',
                            wordBreak: 'break-word'
                        },
                        text: proposal.authors || 'N/A'
                    }),
                    // Presenter
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            fontSize: '13px',
                            color: '#1a1a2e',
                            fontWeight: '500'
                        },
                        text: proposal.presenter || 'N/A'
                    }),
                    // Status
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            textAlign: 'center'
                        },
                        child: [getStatusBadge(proposal.status)]
                    }),
                    // Date
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            textAlign: 'center',
                            fontSize: '11px',
                            color: '#868e96'
                        },
                        text: proposal.endorsement_date ? new Date(proposal.endorsement_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'N/A'
                    }),
                    // Actions
                    $({
                        tag: 'td',
                        style: {
                            padding: '14px 8px',
                            textAlign: 'center'
                        },
                        child: isPending ? [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    gap: '6px',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                },
                                child: [
                                    // Presented Button with Check Icon
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '6px 16px',
                                            backgroundColor: '#2b8a3e',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 8px rgba(43, 138, 62, 0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-check' },
                                                style: {
                                                    fontSize: '11px',
                                                    fontWeight: '700'
                                                }
                                            }),
                                            $({
                                                tag: 'span',
                                                text: 'Presented'
                                            })
                                        ],
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                e.stopPropagation();
                                                handleConfirm(proposal, 'proposal_presented');
                                            }
                                        },
                                        event2: {
                                            type: 'mouseenter',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#237032';
                                                e.target.style.transform = 'translateY(-1px)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(43, 138, 62, 0.35)';
                                            }
                                        },
                                        event3: {
                                            type: 'mouseleave',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#2b8a3e';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 2px 8px rgba(43, 138, 62, 0.25)';
                                            }
                                        }
                                    }),
                                    // Not Presented Button with X Icon
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '6px 16px',
                                            backgroundColor: '#e03131',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 8px rgba(224, 49, 49, 0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-xmark' },
                                                style: {
                                                    fontSize: '14px',
                                                    fontWeight: '700'
                                                }
                                            }),
                                            $({
                                                tag: 'span',
                                                text: 'Not Presented'
                                            })
                                        ],
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                e.stopPropagation();
                                                handleConfirm(proposal, 'proposal_not_presented');
                                            }
                                        },
                                        event2: {
                                            type: 'mouseenter',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#c92a2a';
                                                e.target.style.transform = 'translateY(-1px)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(224, 49, 49, 0.35)';
                                            }
                                        },
                                        event3: {
                                            type: 'mouseleave',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#e03131';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 2px 8px rgba(224, 49, 49, 0.25)';
                                            }
                                        }
                                    })
                                ]
                            })
                        ] : [
                            $({
                                tag: 'span',
                                style: {
                                    fontSize: '12px',
                                    color: '#868e96',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    justifyContent: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-check-circle' },
                                        style: {
                                            color: '#2b8a3e',
                                            fontSize: '14px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: proposal.confirm_by_display ? `Confirmed by ${proposal.confirm_by_display}` : 'Confirmed'
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });

            tableBody.appendChild(row);
        });

        const countEl = document.getElementById('inhouse-count');
        if (countEl) {
            countEl.textContent = `Showing ${filteredProposals.length} of ${proposals.length} records`;
        }
    };

    const buildModalContent = () => {
        return $({
            tag: 'div',
            att: { id: 'inhouse-modal-content' },
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '4px 0'
            },
            child: [
                // Stats row
                $({
                    tag: 'div',
                    att: { id: 'inhouse-stats' },
                    style: {
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        padding: '4px 0'
                    }
                }),
                // Filter and search bar
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '14px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #e9ecef'
                    },
                    child: [
                        // Filter buttons
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '6px',
                                flexWrap: 'wrap'
                            },
                            child: [
                                { value: 'all', label: 'All' },
                                { value: 'pending_confirmation', label: 'Pending' },
                                { value: 'proposal_presented', label: 'Presented' },
                                { value: 'proposal_not_presented', label: 'Not Presented' }
                            ].map(opt => {
                                const isActive = opt.value === currentFilter;
                                return $({
                                    tag: 'button',
                                    text: opt.label,
                                    att: { 'data-filter': opt.value },
                                    style: {
                                        padding: '7px 18px',
                                        border: isActive ? '1px solid #4361ee' : '1px solid #dee2e6',
                                        borderRadius: '20px',
                                        backgroundColor: isActive ? '#4361ee' : 'transparent',
                                        color: isActive ? '#ffffff' : '#495057',
                                        fontSize: '13px',
                                        fontWeight: isActive ? '600' : '400',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isActive ? '0 2px 8px rgba(67, 97, 238, 0.25)' : 'none'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            currentFilter = opt.value;
                                            applyFilters();
                                            // Update all filter buttons
                                            document.querySelectorAll('#inhouse-modal-content [data-filter]').forEach(b => {
                                                const val = b.dataset.filter;
                                                const active = val === currentFilter;
                                                b.style.backgroundColor = active ? '#4361ee' : 'transparent';
                                                b.style.color = active ? '#ffffff' : '#495057';
                                                b.style.borderColor = active ? '#4361ee' : '#dee2e6';
                                                b.style.fontWeight = active ? '600' : '400';
                                                b.style.boxShadow = active ? '0 2px 8px rgba(67, 97, 238, 0.25)' : 'none';
                                            });
                                        }
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            if (!e.target.style.backgroundColor.includes('4361ee')) {
                                                e.target.style.backgroundColor = '#f1f3f5';
                                            }
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            if (!e.target.style.backgroundColor.includes('4361ee')) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }
                                    }
                                });
                            })
                        }),
                        // Search input
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative',
                                flex: '1',
                                minWidth: '200px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-magnifying-glass' },
                                    style: {
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#adb5bd',
                                        fontSize: '14px'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search by title, author, paper trail...'
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '9px 16px 9px 40px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '24px',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: '#ffffff',
                                        color: '#1a1a2e'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            searchTerm = e.target.value;
                                            applyFilters();
                                        }
                                    },
                                    event2: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.target.style.borderColor = '#4361ee';
                                            e.target.style.boxShadow = '0 0 0 4px rgba(67, 97, 238, 0.1)';
                                        }
                                    },
                                    event3: {
                                        type: 'blur',
                                        method: (e) => {
                                            e.target.style.borderColor = '#dee2e6';
                                            e.target.style.boxShadow = 'none';
                                        }
                                    }
                                })
                            ]
                        }),
                        // Count
                        $({
                            tag: 'span',
                            att: { id: 'inhouse-count' },
                            style: {
                                fontSize: '12px',
                                color: '#868e96',
                                marginLeft: 'auto',
                                whiteSpace: 'nowrap',
                                fontWeight: '500'
                            },
                            text: 'Loading...'
                        })
                    ]
                }),
                // Table
                $({
                    tag: 'div',
                    style: {
                        overflow: 'auto',
                        maxHeight: '460px',
                        border: '1px solid #e9ecef',
                        borderRadius: '14px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    },
                    child: [
                        $({
                            tag: 'table',
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px',
                                minWidth: '700px'
                            },
                            child: [
                                // Table header
                                $({
                                    tag: 'thead',
                                    style: {
                                        background: '#f8f9fa',
                                        position: 'sticky',
                                        top: '0',
                                        zIndex: '5'
                                    },
                                    child: [
                                        $({
                                            tag: 'tr',
                                            child: [
                                                $({
                                                    tag: 'th',
                                                    text: 'Paper Trail',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'left',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }
                                                }),
                                                $({
                                                    tag: 'th',
                                                    text: 'Title',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'left',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6',
                                                        minWidth: '150px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'th',
                                                    text: 'Authors',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'left',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6',
                                                        minWidth: '210px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'th',
                                                    text: 'Presenter',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'left',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }
                                                }),
                                                $({
                                                    tag: 'th',
                                                    text: 'Status',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'center',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }
                                                }),
                                                $({
                                                    tag: 'th',
                                                    text: 'Date',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'center',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }
                                                }),
                                                $({
                                                    tag: 'th',
                                                    text: 'Actions',
                                                    style: {
                                                        padding: '14px 8px',
                                                        textAlign: 'center',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#495057',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderBottom: '2px solid #dee2e6'
                                                    }
                                                })                                            ]
                                        })
                                    ]
                                }),
                                // Table body
                                $({
                                    tag: 'tbody',
                                    att: { id: 'inhouse-table-body' }
                                })
                            ]
                        })
                    ]
                }),
                // Refresh button
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingTop: '8px'
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                padding: '9px 22px',
                                backgroundColor: '#4361ee',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(67, 97, 238, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-rotate' },
                                    style: { fontSize: '13px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Refresh'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    fetchProposals(currentFilter);
                                }
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#364fc7';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 16px rgba(67, 97, 238, 0.35)';
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#4361ee';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(67, 97, 238, 0.25)';
                                }
                            }
                        })
                    ]
                })
            ]
        });
    };

    const openModal = () => {
        const { closeModal } = CustomModal({
            title: 'In-House Review Proposal Confirmation',
            size: 'full',
            content: (props) => {
                const content = buildModalContent();
                setTimeout(() => {
                    fetchProposals(currentFilter);
                }, 150);
                return content;
            },
            footer: (props) => {
                return $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        width: '100%'
                    },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Close',
                            style: {
                                padding: '10px 28px',
                                backgroundColor: '#f1f3f5',
                                border: '1px solid #dee2e6',
                                borderRadius: '10px',
                                color: '#495057',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    if (props && props.closeModal) props.closeModal();
                                }
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#e9ecef';
                                    e.target.style.borderColor = '#ced4da';
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#f1f3f5';
                                    e.target.style.borderColor = '#dee2e6';
                                }
                            }
                        })
                    ]
                });
            },
            closeOnOverlayClick: true,
            showCloseButton: true
        });

        modalCloseFn = closeModal;
        return closeModal;
    };

    return { openModal };
};
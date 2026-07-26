import { $ } from '../../../lib/lib.js'
import { EntryView } from "./entryview.js";

// Modern Status Labels Component with Font Awesome
const StatusLabels = ({ hasScore, hasComment }) => {
    return $({
        tag: 'div',
        style: {
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            flexShrink: 0,
        },
        child: [
            // Comment Status Label
            $({
                tag: 'span',
                style: {
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    backgroundColor: hasComment ? '#dcfce7' : '#f1f5f9',
                    color: hasComment ? '#166534' : '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: hasComment ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: hasComment ? 'fa-solid fa-comment' : 'fa-regular fa-comment'
                        },
                        style: {
                            fontSize: '11px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: hasComment ? 'Commented' : 'No Comments'
                    })
                ]
            }),

            // Score Status Label
            $({
                tag: 'span',
                style: {
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    backgroundColor: hasScore ? '#ede9fe' : '#f1f5f9',
                    color: hasScore ? '#5b21b6' : '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: hasScore ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: hasScore ? 'fa-solid fa-star' : 'fa-regular fa-star'
                        },
                        style: {
                            fontSize: '11px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: hasScore ? 'Scored' : 'Not Scored'
                    })
                ]
            })
        ]
    });
};

export const EntryList = ({
    title,
    presenter,
    author,
    coAuthors,
    docId,
    index,
    center,
    status,
    eventId,
    catId,
    hasScore,
    hasComment,
    userType,
    categoryName
}) => {
    const base = window.location.href
    const url = base.replace(window.location.origin, '').split('/')

    if (url[2] === 'viewdocs') {
        document.getElementById('root').appendChild(EntryView({
            docId: url[3],
            title: title,
            eventId: eventId,
            catId: catId
        }))
    }

    const getCardStyle = () => {
        if (status === false) {
            return {
                borderLeft: '4px solid #f59e0b',
                background: '#fffbeb'
            }
        }
        if (hasScore && hasComment) {
            return {
                borderLeft: '4px solid #10b981',
                background: '#f0fdf4'
            }
        }
        if (hasScore) {
            return {
                borderLeft: '4px solid #8b5cf6',
                background: '#f5f3ff'
            }
        }
        if (hasComment) {
            return {
                borderLeft: '4px solid #3b82f6',
                background: '#eff6ff'
            }
        }
        return {
            borderLeft: '4px solid #e2e8f0',
            background: '#ffffff'
        }
    }

    const cardStyle = getCardStyle()

    const searchText = `${title} ${presenter} ${author} ${coAuthors || ''}`.toLowerCase()

    return ($({
        tag: 'div',
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            marginBottom: '10px',
            borderRadius: '10px',
            border: '1px solid #e8ecf1',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            background: cardStyle.background,
            borderLeft: cardStyle.borderLeft,
            position: 'relative',
            gap: '12px',
            flexWrap: 'wrap',
        },
        att: {
            className: 'entry-card',
            'data-search': searchText,
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: status === false ? '#f59e0b'
                        : (hasScore && hasComment) ? '#10b981'
                            : hasScore ? '#8b5cf6'
                                : hasComment ? '#3b82f6'
                                    : '#94a3b8',
                    boxShadow: `0 0 8px ${status === false ? 'rgba(245,158,11,0.4)'
                        : (hasScore && hasComment) ? 'rgba(16,185,129,0.4)'
                            : hasScore ? 'rgba(139,92,246,0.4)'
                                : hasComment ? 'rgba(59,130,246,0.4)'
                                    : 'rgba(148,163,184,0.2)'}`,
                    alignSelf: 'flex-start',
                    marginTop: '4px',
                }
            }),

            // Content section
            $({
                tag: 'div',
                style: {
                    flex: '1',
                    minWidth: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                },
                child: [
                    // Title
                    $({
                        tag: 'div',
                        text: title || 'Untitled Document',
                        style: {
                            fontSize: '15px',
                            fontWeight: '600',
                            color: status === false ? '#b45309' : '#0f172a',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            lineHeight: '1.3',
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px 20px',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#64748b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        },
                        child: [
                            // Presenter
                            presenter ? $({
                                tag: 'span',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#eff6ff',
                                    padding: '2px 10px 2px 6px',
                                    borderRadius: '12px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-user-tie'
                                        },
                                        style: {
                                            fontSize: '12px',
                                            color: '#3b82f6'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: presenter,
                                        style: {
                                            color: '#1e293b',
                                            fontWeight: '500',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: '(Presenter)',
                                        style: {
                                            color: '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '400',
                                        }
                                    })
                                ]
                            }) : null,

                            // Separator between Presenter and Author
                            presenter && author ? $({
                                tag: 'span',
                                text: '|',
                                style: {
                                    color: '#cbd5e1',
                                    fontSize: '14px',
                                }
                            }) : null,

                            // Author
                            author ? $({
                                tag: 'span',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#f0fdf4',
                                    padding: '2px 10px 2px 6px',
                                    borderRadius: '12px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-user-pen'
                                        },
                                        style: {
                                            fontSize: '12px',
                                            color: '#22c55e'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: author,
                                        style: {
                                            color: '#1e293b',
                                            fontWeight: '500',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: '(Author)',
                                        style: {
                                            color: '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '400',
                                        }
                                    })
                                ]
                            }) : null,

                            // Separator between Author and Co-authors
                            (presenter || author) && coAuthors ? $({
                                tag: 'span',
                                text: '|',
                                style: {
                                    color: '#cbd5e1',
                                    fontSize: '14px',
                                }
                            }) : null,

                            // Co-authors (comma-separated string without brackets or quotes)
                            coAuthors ? $({
                                tag: 'span',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#f5f3ff',
                                    padding: '2px 10px 2px 6px',
                                    borderRadius: '12px',
                                    maxWidth: '300px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-users'
                                        },
                                        style: {
                                            fontSize: '12px',
                                            color: '#8b5cf6',
                                            flexShrink: 0,
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: coAuthors,
                                        style: {
                                            color: '#475569',
                                            fontSize: '12px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: '(Co-authors)',
                                        style: {
                                            color: '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '400',
                                            flexShrink: 0,
                                        }
                                    })
                                ]
                            }) : null,

                            // Status label (if pending review)
                            status === false ? $({
                                tag: 'span',
                                style: {
                                    padding: '2px 10px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-clock'
                                        },
                                        style: {
                                            fontSize: '11px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Pending Review'
                                    })
                                ]
                            }) : null
                        ]
                    }),
                    categoryName ? $({
                        tag: 'span',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f0f9ff',
                            padding: '2px 10px 2px 6px',
                            borderRadius: '12px',
                            border: '1px solid #bae6fd',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-tag'
                                },
                                style: {
                                    fontSize: '11px',
                                    color: '#0284c7'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: categoryName,
                                style: {
                                    color: '#0369a1',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                }
                            })
                        ]
                    }) : null,
                ]
            }),

            // Status Labels and Action
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexShrink: 0,
                },
                child: [
                    StatusLabels({
                        hasScore: hasScore || false,
                        hasComment: hasComment || false
                    }),

                    // View action button
                    $({
                        tag: 'button',
                        style: {
                            padding: '6px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        },
                        att: {
                            className: 'view-btn'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-eye'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'View'
                            })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                window.location.assign('/evaluator/viewdocs/' + docId)
                            }
                        },
                        elementHandler: (el) => {
                            el.addEventListener('mouseenter', () => {
                                el.style.background = '#2563eb'
                                el.style.transform = 'translateY(-1px)'
                                el.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)'
                            })
                            el.addEventListener('mouseleave', () => {
                                el.style.background = '#3b82f6'
                                el.style.transform = 'translateY(0)'
                                el.style.boxShadow = 'none'
                            })
                        }
                    })
                ]
            })
        ],
        event: {
            type: 'click',
            method: () => {
                const existingContainer = document.getElementById('entry-view-container');
                if (existingContainer) {
                    existingContainer.remove();
                }
                // Remove any existing modals
                document.querySelectorAll('.custom-modal-overlay').forEach(el => el.remove());
                window.location.assign('/evaluator/viewdocs/' + docId)
            }
        }
    }))
}
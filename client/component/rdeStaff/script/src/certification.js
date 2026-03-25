import { $ } from "../../../../lib/lib.js";

function highlightName(text, name) {
    if (!name || !text) return text;

    // Clean name and split into parts, converted to lower case
    const cleanName = name.replace(/[,.]/g, '');
    const nameParts = cleanName.trim().split(/\s+/).filter(p => p.length > 0)
        .map(p => p.toLowerCase());

    if (nameParts.length === 0) return text;

    // Split text into tokens (words and non-words)
    const tokens = text.split(/(\b[\w-]+\b)/);

    // Identify words
    const words = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] && /^[\w-]+$/.test(tokens[i])) {
            words.push({
                text: tokens[i],
                index: i,
                isMatch: nameParts.includes(tokens[i].toLowerCase())
            });
        }
    }

    const clusters = [];
    let currentCluster = [];

    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (w.isMatch) {
            if (currentCluster.length === 0) {
                currentCluster.push(w);
            } else {
                const lastW = currentCluster[currentCluster.length - 1];
                let canJoin = true;

                for (let j = lastW.index + 1; j < w.index; j++) {
                    const t = tokens[j];
                    if (/^[\w-]+$/.test(t)) {
                        if (t.length > 3 || t.toLowerCase() === 'and') {
                            canJoin = false;
                            break;
                        }
                    } else {
                        if (t.includes(',') || t.includes('&')) {
                            canJoin = false;
                            break;
                        }
                    }
                }

                if (canJoin) {
                    currentCluster.push(w);
                } else {
                    clusters.push(currentCluster);
                    currentCluster = [w];
                }
            }
        }
    }
    if (currentCluster.length > 0) {
        clusters.push(currentCluster);
    }

    const validClusters = clusters.filter(c => {
        const hasLongWord = c.some(w => w.text.length > 2);
        return (c.length >= 2 && hasLongWord) || (c.length === 1 && nameParts.length === 1);
    });

    if (validClusters.length === 0) return text;

    const highlightTarget = new Array(tokens.length).fill(false);
    for (const c of validClusters) {
        const startIndex = c[0].index;
        const endIndex = c[c.length - 1].index;
        for (let j = startIndex; j <= endIndex; j++) {
            highlightTarget[j] = true;
        }
    }

    let result = '';
    let isHighlighting = false;

    for (let i = 0; i < tokens.length; i++) {
        if (!tokens[i]) continue;

        if (highlightTarget[i]) {
            if (!isHighlighting) {
                result += '<span style="text-decoration:underline; font-weight:700; color:#000;">';
                isHighlighting = true;
            }
            result += tokens[i];
        } else {
            if (isHighlighting) {
                result += '</span>';
                isHighlighting = false;
            }
            result += tokens[i];
        }
    }

    if (isHighlighting) {
        result += '</span>';
    }

    return result;
}

// Certificate Modal Component
export const CertificateModal = ({ onGenerate, onCancel }) => {
    let modalElement;
    let researchFields = [];

    const getModal = (el) => {
        modalElement = el;
    };

    const closeModal = (e) => {
        if (e) e.stopPropagation();
        if (modalElement && modalElement.remove) {
            modalElement.remove();
        }
        if (onCancel) onCancel();
    };

    // Add new research field
    const addResearchField = (container) => {
        const researchIndex = researchFields.length + 1;

        const researchGroup = $({
            tag: 'div',
            att: { className: 'research-group' },
            style: {
                backgroundColor: '#3a3a3a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #444',
                position: 'relative'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                    },
                    child: [
                        $({
                            tag: 'h4',
                            text: `Research ${researchIndex}`,
                            style: {
                                color: 'deepskyblue',
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0'
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#f44336',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '0 8px',
                                display: researchIndex === 1 ? 'none' : 'block'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-times-circle' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.stopPropagation();
                                    researchGroup.remove();
                                    researchFields = researchFields.filter(f => f !== researchGroup);
                                }
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: { marginBottom: '12px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Research Title',
                            style: {
                                display: 'block',
                                color: '#aaa',
                                fontSize: '13px',
                                marginBottom: '6px',
                                fontWeight: '500'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'text',
                                placeholder: 'e.g., Grade Inquiry System: Its Impact to Students',
                                className: 'research-title-input'
                            },
                            style: {
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'input',
                                method: (e) => {
                                    // Store value
                                }
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    child: [
                        $({
                            tag: 'label',
                            text: 'Authors',
                            style: {
                                display: 'block',
                                color: '#aaa',
                                fontSize: '13px',
                                marginBottom: '6px',
                                fontWeight: '500'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'text',
                                placeholder: 'e.g., Maria Aurora G. Victoriano, Meschel L. Marcos, et al.',
                                className: 'authors-input'
                            },
                            style: {
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'input',
                                method: (e) => {
                                    // Store value
                                }
                            }
                        })
                    ]
                })
            ]
        });

        researchFields.push(researchGroup);
        container.appendChild(researchGroup);
    };

    // Form content
    const FormContent = () => {
        let researchContainer;

        const getResearchContainer = (el) => {
            researchContainer = el;
            // Add first research field by default
            addResearchField(el);
        };

        return $({
            tag: 'div',
            style: {
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '0 4px'
            },
            child: [
                // Control No.
                $({
                    tag: 'div',
                    style: { marginBottom: '20px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'RDE Control No.',
                            style: {
                                display: 'block',
                                color: '#aaa',
                                fontSize: '14px',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'RES',
                                    style: {
                                        backgroundColor: '#3a3a3a',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        color: 'deepskyblue',
                                        fontWeight: '600',
                                        border: '1px solid #444'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: '027-26',
                                        id: 'control-number',
                                        value: '027-26'
                                    },
                                    style: {
                                        flex: '1',
                                        padding: '10px 12px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }
                                })
                            ]
                        })
                    ]
                }),

                // Faculty Search and Full Name
                $({
                    tag: 'div',
                    style: { marginBottom: '20px', position: 'relative' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Search Faculty / Requestor Name',
                            style: {
                                display: 'block',
                                color: '#aaa',
                                fontSize: '14px',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: { position: 'relative' },
                            child: [
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search name...',
                                        id: 'full-name',
                                        autocomplete: 'off'
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none',
                                        textTransform: 'uppercase'
                                    },
                                    event: {
                                        type: 'input',
                                        method: async (e) => {
                                            const val = e.target.value.trim();
                                            const resultsContainer = document.getElementById('search-results');

                                            if (!resultsContainer) return;

                                            if (val.length < 2) {
                                                resultsContainer.style.display = 'none';
                                                resultsContainer.innerHTML = '';
                                                return;
                                            }

                                            try {
                                                const res = await fetch(`/server/rde/certification.php?action=searchFaculty&query=${encodeURIComponent(val)}`);
                                                const names = await res.json();

                                                resultsContainer.innerHTML = '';
                                                if (names.length > 0) {
                                                    resultsContainer.style.display = 'block';
                                                    names.forEach(name => {
                                                        const item = document.createElement('div');
                                                        item.className = 'search-item';
                                                        item.style.padding = '12px 16px';
                                                        item.style.cursor = 'pointer';
                                                        item.style.borderBottom = '1px solid #444';
                                                        item.style.color = '#fff';
                                                        item.style.fontSize = '14px';
                                                        item.style.transition = 'all 0.2s ease';

                                                        // Highlight the matched parts
                                                        const regex = new RegExp(`(${val})`, 'gi');
                                                        item.innerHTML = name.replace(regex, '<span style="color: deepskyblue; font-weight: 700;">$1</span>');

                                                        item.onmouseenter = () => {
                                                            item.style.backgroundColor = '#444';
                                                            item.style.paddingLeft = '20px';
                                                        };
                                                        item.onmouseleave = () => {
                                                            item.style.backgroundColor = 'transparent';
                                                            item.style.paddingLeft = '16px';
                                                        };

                                                        item.onclick = async (event) => {
                                                            event.stopPropagation();
                                                            e.target.value = name;
                                                            resultsContainer.style.display = 'none';

                                                            // Show loading state in research container if possible
                                                            if (researchContainer) {
                                                                researchContainer.innerHTML = '<div style="color: deepskyblue; padding: 20px; text-align: center;"><span class="fa-solid fa-circle-notch fa-spin"></span> Fetching research data...</div>';
                                                            }

                                                            // Fetch research for this faculty
                                                            try {
                                                                const researchRes = await fetch(`/server/rde/certification.php?action=getFacultyResearch&name=${encodeURIComponent(name)}`);
                                                                const researches = await researchRes.json();

                                                                if (researchContainer) {
                                                                    researchContainer.innerHTML = '';
                                                                    researchFields = [];

                                                                    if (researches.length > 0) {
                                                                        // Populate campus from first result
                                                                        const campusSelect = document.getElementById('campus');
                                                                        if (campusSelect && researches[0].campus && researches[0].campus !== '—') {
                                                                            campusSelect.value = researches[0].campus;
                                                                        }

                                                                        // Populate research fields
                                                                        researches.forEach(r => {
                                                                            addResearchField(researchContainer);
                                                                            const latestGroup = researchFields[researchFields.length - 1];
                                                                            const titleInp = latestGroup.querySelector('.research-title-input');
                                                                            const authorsInp = latestGroup.querySelector('.authors-input');
                                                                            if (titleInp) titleInp.value = r.title;
                                                                            if (authorsInp) authorsInp.value = r.authors;
                                                                        });
                                                                    } else {
                                                                        addResearchField(researchContainer);
                                                                        researchContainer.insertAdjacentHTML('afterbegin', '<div style="color: #ff9800; padding: 10px; font-size: 13px;"><i class="fa-solid fa-triangle-exclamation"></i> No completed research found for this faculty.</div>');
                                                                    }
                                                                }
                                                            } catch (researchErr) {
                                                                console.error('Research fetch error:', researchErr);
                                                            }
                                                        };
                                                        resultsContainer.appendChild(item);
                                                    });
                                                } else {
                                                    resultsContainer.style.display = 'none';
                                                }
                                            } catch (err) {
                                                console.error('Search error:', err);
                                            }
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    att: { id: 'search-results' },
                                    style: {
                                        position: 'absolute',
                                        top: '100%',
                                        left: '0',
                                        width: '100%',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '0 0 12px 12px',
                                        zIndex: '1000',
                                        display: 'none',
                                        maxHeight: '250px',
                                        overflowY: 'auto',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                        marginTop: '2px'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => e.stopPropagation()
                                    }
                                })
                            ]
                        })
                    ]
                }),

                // Campus
                $({
                    tag: 'div',
                    style: { marginBottom: '20px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Campus / Center',
                            style: {
                                display: 'block',
                                color: '#aaa',
                                fontSize: '14px',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }
                        }),
                        $({
                            tag: 'select',
                            att: {
                                id: 'campus'
                            },
                            style: {
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'Select Campus/Center' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Roxas City Main Campus', selected: true }, text: 'Capiz State University - Roxas City Main Campus' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Pilar Campus' }, text: 'Capiz State University - Pilar Campus' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Pontevedra Campus' }, text: 'Capiz State University - Pontevedra Campus' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Mambusao Satellite College' }, text: 'Capiz State University - Mambusao Satellite College' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Dumarao Satellite College' }, text: 'Capiz State University - Dumarao Satellite College' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Sigma Satellite College' }, text: 'Capiz State University - Sigma Satellite College' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Tapaz Satellite College' }, text: 'Capiz State University - Tapaz Satellite College' }),
                                $({ tag: 'option', att: { value: 'Capiz State University - Dayao Satellite College' }, text: 'Capiz State University - Dayao Satellite College' })
                            ]
                        })
                    ]
                }),

                // Research List Header
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                        marginTop: '8px'
                    },
                    child: [
                        $({
                            tag: 'h3',
                            text: 'Completed Research Initiatives',
                            style: {
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '600',
                                margin: '0'
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid deepskyblue',
                                borderRadius: '20px',
                                padding: '6px 16px',
                                color: 'deepskyblue',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-plus' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add Research'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    if (researchContainer) {
                                        addResearchField(researchContainer);
                                    }
                                }
                            }
                        })
                    ]
                }),

                // Research Fields Container
                $({
                    tag: 'div',
                    att: { className: 'research-fields-container' },
                    elementHandler: getResearchContainer
                }),

                // Date
                $({
                    tag: 'div',
                    style: { marginTop: '24px', marginBottom: '20px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Date of Issuance',
                            style: {
                                display: 'block',
                                color: '#aaa',
                                fontSize: '14px',
                                marginBottom: '8px',
                                fontWeight: '600'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'date',
                                id: 'issue-date',
                                value: new Date().toISOString().split('T')[0]
                            },
                            style: {
                                width: '100%',
                                padding: '10px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }
                        })
                    ]
                })
            ]
        });
    };

    // Modal
    return $({
        tag: 'div',
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            backdropFilter: 'blur(5px)'
        },
        elementHandler: getModal,
        child: [
            $({
                tag: 'div',
                style: {
                    width: '600px',
                    maxWidth: '90%',
                    maxHeight: '90vh',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    border: '1px solid #444',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease'
                },
                child: [
                    // Header
                    $({
                        tag: 'div',
                        style: {
                            padding: '20px 24px',
                            backgroundColor: '#333',
                            borderBottom: '1px solid #444',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        },
                        child: [
                            $({
                                tag: 'h3',
                                text: 'Generate Research Certificate',
                                style: {
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    margin: '0'
                                }
                            }),
                            $({
                                tag: 'button',
                                style: {
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#aaa',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '0 8px',
                                    transition: 'color 0.2s ease'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-times' }
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: closeModal
                                }
                            })
                        ]
                    }),

                    // Body
                    $({
                        tag: 'div',
                        style: {
                            padding: '24px',
                            overflowY: 'auto',
                            maxHeight: 'calc(90vh - 140px)'
                        },
                        child: [FormContent()]
                    }),

                    // Footer
                    $({
                        tag: 'div',
                        style: {
                            padding: '20px 24px',
                            backgroundColor: '#333',
                            borderTop: '1px solid #444',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        },
                        child: [
                            $({
                                tag: 'button',
                                text: 'Cancel',
                                style: {
                                    backgroundColor: 'transparent',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    color: '#aaa',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: closeModal
                                }
                            }),
                            $({
                                tag: 'button',
                                text: 'Generate Certificate',
                                style: {
                                    backgroundColor: 'deepskyblue',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 24px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-certificate' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Generate'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: () => {
                                        // Collect form data
                                        const controlNo = document.getElementById('control-number')?.value || '';
                                        const fullNameInput = document.getElementById('full-name')?.value || '';
                                        const fullName = fullNameInput.replace(/\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
                                        const campus = document.getElementById('campus')?.value || '';
                                        const issueDate = document.getElementById('issue-date')?.value || '';

                                        // Collect research data
                                        const researchGroups = document.querySelectorAll('.research-group');
                                        const researches = [];

                                        researchGroups.forEach((group, index) => {
                                            const titleInput = group.querySelector('.research-title-input');
                                            const authorsInput = group.querySelector('.authors-input');

                                            if (titleInput && authorsInput && titleInput.value) {
                                                researches.push({
                                                    title: titleInput.value,
                                                    authors: authorsInput.value
                                                });
                                            }
                                        });

                                        const certificateData = {
                                            controlNo: `RES${controlNo}`,
                                            fullName: fullName,
                                            campus: campus,
                                            researches: researches,
                                            issueDate: issueDate
                                        };

                                        onGenerate(certificateData);
                                    }
                                }
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

// Certificate HTML Renderer
export const renderCertificateHTML = (data, controlNo) => {

    const formattedDate = data.issueDate ? (() => {
        const d = new Date(data.issueDate + 'T00:00:00');
        const day = d.getDate();
        const suffix = day === 1 || day === 21 || day === 31 ? 'st'
            : day === 2 || day === 22 ? 'nd'
                : day === 3 || day === 23 ? 'rd'
                    : 'th';
        const month = d.toLocaleDateString('en-US', { month: 'long' });
        const year = d.getFullYear();
        return `${day}${suffix} day of ${month} ${year}`;
    })() : '______';

    // ─── Shared CSS (same as before, injected once) ───────────────────────────
    const sharedCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
 
        * { box-sizing: border-box; }
 
        body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            background: #525659;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
 
        /* ── Page shell ─────────────────────────────── */
        .certificate-container {
            width: 210mm;
            min-height: 297mm;
            height: 297mm;
            margin: 0 auto 30px auto;
            position: relative;
            background-color: white;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
 
        .print-bg {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 1;
            background-image: url('/client/images/header.png') !important;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            pointer-events: none;
        }
 
        /*
         * Content area = A4 minus margins
         *   top/left/right : 2.54 cm  →  ~96 px each  (@ 96 dpi screen)
         *   bottom         : 3.40 cm  →  ~129 px
         *
         * Available height for content
         *   297mm - 2.54cm - 3.4cm = 291.06mm usable page height
         *   In pixels @ 96dpi: 297mm≈1122px  2.54cm≈96px  3.4cm≈129px
         *   usable ≈ 1122 - 96 - 129 = 897px  (screen)
         *
         * We use CSS to hard-clip and JS to measure before building pages.
         */
        .certificate-content {
            position: absolute;
            z-index: 2;
            /* exact margins */
            top:    2.54cm;
            left:   2.54cm;
            right:  2.54cm;
            bottom: 3.4cm;          /* ← respects footer */
            overflow: hidden;       /* clips anything that overshoots */
            display: flex;
            flex-direction: column;
        }
 
        /* ── Typography ─────────────────────────────── */
        .office-header {
            text-align: center;
            color: #1a237e;
            font-size: 26px;
            font-family: 'Arial', sans-serif;
            margin-top: 125px;
            margin-bottom: 25px;
        }
 
        .control-no {
            font-size: 19px;
            margin-bottom: 15px;
            font-weight: bold;
        }
 
        .control-no span.blue {
            color: blue;
            font-weight: bold;
        }
 
        .title-certification {
            text-align: center;
            font-size: 30px;
            letter-spacing: 20px;
            margin: 10px 0;
            text-transform: uppercase;
        }
 
        .cert-text {
            font-size: 20px;
            line-height: 1.8;
            margin-top: 20px;
            width: 100%;
        }
 
        .full-line-value {
            border-bottom: 1px solid black;
            font-weight: bold;
            display: inline-block;
        }
 
        .label-unit {
            text-align: center;
            font-size: 16px;
            margin-top: 5px;
            margin-bottom: 30px;
        }
 
        .research-list {
            margin-left: 60px;
            margin-top: 15px;
            margin-bottom: 0;
            line-height: 1.0;
        }
 
        .research-item {
            margin-bottom: 20px;
        }
        .research-item:last-child {
            margin-bottom: 0;
        }
        .closing-paragraph {
            text-align: justify;
            text-justify: inter-word;
            font-size: 19px;
            line-height: 1.6;
            margin-top: 10px;
            margin-bottom: 30px;
        }
 
        .date-line {
            font-size: 19px;
            margin-bottom: 20px;
            font-weight: normal;
        }
 
        .signature-section {
            align-self: center;
            text-align: center;
            width: 350px;
            margin-top: 30px;
            padding-bottom: 20px;
        }
 
        .vp-name {
            font-weight: bold;
            font-size: 20px;
            margin-bottom: 2px;
            text-transform: uppercase;
        }
 
        .vp-title { font-size: 18px; }
 
        @media print {
            @page {
                size: A4;
                margin: 0;        
            }
 
            body {
                background: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
 
            .certificate-container {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                box-shadow: none !important;
                page-break-after: always;
                break-after: page;
            }
 
            .certificate-container:last-child {
                page-break-after: avoid;
                break-after: avoid;
            }
 
            .print-bg {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                z-index: 0;
                background-image: url('/client/images/header.png') !important;
                background-size: cover;
                background-repeat: no-repeat;
            }
        }
 
        /* ── Measurement sandbox (invisible, off-screen) ─ */
        #measure-sandbox {
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: 165mm;          /* content width = 210mm - 2×2.54cm ≈ 165mm */
            visibility: hidden;
            pointer-events: none;
            font-family: 'Times New Roman', serif;
            font-size: 20px;
            line-height: 1.8;
            color: #000;
        }
    `;

    // ─── Research item HTML snippet (reused in both sandbox & final output) ──
    const itemHTML = (r, globalIdx) => `
        <div class="research-item" data-idx="${globalIdx}">
            <div style="font-weight:600; margin-bottom:5px; font-style:italic;">
                ${globalIdx + 1}. ${r.title}
            </div>
            <div style="margin-left:30px; color:#555; font-style:italic;">
                Author/s: ${r.authors}
            </div>
        </div>`;

    // ─── Signature block HTML ─────────────────────────────────────────────────
    const sigHTML = `
        <div class="closing-paragraph">
            After verification and evaluation by this Office, the above completed research
            study is/are hereby recognized as official output of Capiz State University.
            As such, this may be credited and used as a reference for purposes of the
            Merit Selection Plan (MSP) and/or Joint Circular (JC) Classification, subject
            to the rules and policies of the University.
        </div>
        <div class="date-line">
            Issued this ${formattedDate} at Capiz State University,
            Roxas City, Capiz.
        </div>
        <div class="signature-section">
            <div class="vp-name">LEO ANDREW B. BICLAR, PhD</div>
            <div class="vp-title">VP for RDE</div>
        </div>`;

    // ─── Page-1 fixed header HTML ─────────────────────────────────────────────
    const page1HeaderHTML = `
        <div class="office-header">
            OFFICE OF THE VICE PRESIDENT FOR RDE
        </div>
        <div class="control-no">
            RDE Control No.
            <span class="blue">${(data.controlNo).slice(0, 3)}</span>
            <span class="blue">${(data.controlNo).slice(3)}</span>
        </div>
        <div class="title-certification">CERTIFICATION</div>
        <div class="cert-text">
            <div style="display:flex; align-items:baseline; margin-bottom:10px;">
                <span style="white-space:nowrap; margin-right:10px;">This is to certify that</span>
                <div class="full-line-value" style="flex-grow:1; text-align:center;">
                    ${data.fullName}
                </div>
            </div>
            <div style="display:flex; align-items:baseline;">
                <span style="white-space:nowrap; margin-right:10px;">of the</span>
                <div class="full-line-value" style="flex-grow:1; text-align:center;">
                    ${data.campus}
                </div>
            </div>
            <div class="label-unit">(Unit/College/Department)</div>
            <div>has undertaken the following <strong>Completed Research initiative(s):</strong></div>
            <div class="research-list" id="page-1-list"></div>
        </div>`;

    // ─── Continuation page header HTML ───────────────────────────────────────
    const contHeaderHTML = `
        <div class="cert-text" style="margin-top:0;">
            <div class="research-list" id="page-N-list" style="margin-top:50px;"></div>
        </div>`;

    const highlightedResearches = (data.researches || []).map(r => ({
        ...r,
        authors: highlightName(r.authors, data.fullName)
    }));
    const researchJSON = JSON.stringify(highlightedResearches);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Research Certificate - ${data.controlNo || controlNo}</title>
    <style>${sharedCSS}</style>
</head>
<body>
 
<!-- Measurement sandbox — populated by JS before layout -->
<div id="measure-sandbox"></div>
 
<!-- Page container — pages injected by JS -->
<div id="pages-root"></div>
 
<script>
(function () {
    const researches  = ${researchJSON};
    const sigHTML     = ${JSON.stringify(sigHTML)};
    const page1Header = ${JSON.stringify(page1HeaderHTML)};
    const contHeader  = ${JSON.stringify(contHeaderHTML)};
 
    /* ── px per mm at screen resolution ──────────────────────────────────── */
    const PX_PER_MM   = 96 / 25.4;                       // ≈ 3.7795
    const PAGE_H_MM   = 297;
    const TOP_MM      = 25.4;                             // 2.54 cm
    const BOT_MM      = 34.0;                             // 3.40 cm
    const AVAIL_MM    = PAGE_H_MM - TOP_MM - BOT_MM;     // 237.6 mm
    const AVAIL_PX    = AVAIL_MM * PX_PER_MM;            // ≈ 897 px (screen)
 
    /* Page 1 has extra fixed header content (~460 px measured below). */
    const SANDBOX   = document.getElementById('measure-sandbox');
    const ROOT      = document.getElementById('pages-root');
 
    /* ── Measure a chunk of HTML and return its offsetHeight ─────────────── */
    function measure(html) {
        SANDBOX.innerHTML = html;
        // Force layout
        void SANDBOX.offsetHeight;
        const h = SANDBOX.scrollHeight;
        SANDBOX.innerHTML = '';
        return h;
    }
 
    /* ── Measure the fixed page-1 header (everything above the list) ─────── */
    /* We strip the empty research-list div so we only get the header cost.   */
    const p1HeaderCost = measure(
        page1Header.replace('<div class="research-list" id="page-1-list"></div>', '')
    );
 
    /* ── Measure the signature block ─────────────────────────────────────── */
    const sigCost = measure(sigHTML);
 
    /* ── Measure each research item individually ─────────────────────────── */
    const itemHeights = researches.map((r, i) => {
        return measure(\`
            <div class="research-item">
                <div style="font-weight:600; margin-bottom:5px; font-style:italic;">
                    \${i + 1}. \${r.title}
                </div>
                <div style="margin-left:30px; color:#555; font-style:italic;">
                    Author/s: \${r.authors}
                </div>
            </div>
        \`);
    });
 
    /* ── Distribute items across pages ───────────────────────────────────── */
    const pages = [];          // each element: { items: [indices], isFirst, hasSig }
    let pageItems  = [];
    let usedHeight = p1HeaderCost;
    let isFirst    = true;
 
    for (let i = 0; i < researches.length; i++) {
        const itemH = itemHeights[i];
        const remaining = researches.length - i;        // items still to place (incl. this)
        const isLast    = (i === researches.length - 1);
 
        /* Does the current item + (sig if last) fit? */
        const needSig   = isLast;
        const testH     = usedHeight + itemH + (needSig ? sigCost : 0);
 
        if (testH > AVAIL_PX && pageItems.length > 0) {
            /* Flush current page WITHOUT sig, start new page */
            pages.push({ items: [...pageItems], isFirst, hasSig: false });
            pageItems  = [];
            usedHeight = 0;      // continuation pages have no fixed header cost
            isFirst    = false;
        }
 
        pageItems.push(i);
        usedHeight += itemH;
 
        /* After adding, check if sig fits on this same page (for last item) */
        if (isLast) {
            if (usedHeight + sigCost <= AVAIL_PX) {
                pages.push({ items: [...pageItems], isFirst, hasSig: true });
            } else {
                /* Sig doesn't fit — flush items, new page for sig only */
                pages.push({ items: [...pageItems], isFirst, hasSig: false });
                pages.push({ items: [], isFirst: false, hasSig: true });
            }
            pageItems = [];
        }
    }
 
    /* Edge case: no researches at all */
    if (researches.length === 0) {
        pages.push({ items: [], isFirst: true, hasSig: true });
    }
 
    /* ── Build HTML for each page ─────────────────────────────────────────── */
    let globalIdx = 0;
 
    pages.forEach(function (page, pIdx) {
        const isLastPage = (pIdx === pages.length - 1);
 
        /* Item markup */
        const listHTML = page.items.map(function (idx) {
            const r = researches[idx];
            return \`<div class="research-item">
                <div style="font-weight:600; margin-bottom:5px; font-style:italic;">
                    \${idx + 1}. \${r.title}
                </div>
                <div style="margin-left:30px; color:#555; font-style:italic;">
                    Author/s: \${r.authors}
                </div>
            </div>\`;
        }).join('');
 
        /* Inject list into appropriate header template */
        let contentHTML;
        if (page.isFirst) {
            contentHTML = page1Header.replace(
                '<div class="research-list" id="page-1-list"></div>',
                \`<div class="research-list">\${listHTML}</div>\`
            );
            /* Close .cert-text opened in page1Header */
            contentHTML += '</div>';
        } else {
            contentHTML = contHeader.replace(
                '<div class="research-list" id="page-N-list" style="margin-top:50px;"></div>',
                \`<div class="research-list" style="margin-top:50px;">\${listHTML}</div>\`
            );
        }
 
        if (page.hasSig) {
            contentHTML += sigHTML;
        }
 
        const pageBreak = isLastPage ? '' : 'page-break-after:always; break-after:page;';
 
        ROOT.insertAdjacentHTML('beforeend', \`
            <div class="certificate-container" style="\${pageBreak}">
                <div class="print-bg"></div>
                <div class="certificate-content">
                    \${contentHTML}
                </div>
            </div>
        \`);
    });
 
    /* ── Auto-print after fonts load ─────────────────────────────────────── */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            setTimeout(function () { window.print(); }, 400);
        });
    } else {
        window.onload = function () {
            setTimeout(function () { window.print(); }, 600);
        };
    }
})();
</script>
</body>
</html>`;
};

// Export utility function to generate certificate
export const generateCertificate = (data) => {
    const controlNo = data.controlNo || `RES${new Date().getFullYear().toString().slice(-2)}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;

    // Open in new window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(renderCertificateHTML(data, controlNo));
    printWindow.document.close();

    return controlNo;
};
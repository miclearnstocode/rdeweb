import { $ } from "../../../lib/lib.js";
import { CertificateModal, renderCertificateHTML, generateCertificate, CertificatePreviewModal } from "./src/certification.js";

export const CertificationResearch = () => {
    let mainContainer;
    let tableBody;
    let modalContainer;
    let statsData = {
        total: 0,
        thisMonth: 0,
        thisYear: 0,
        uniqueFaculty: 0
    };

    // Columns for certification log table
    const columns = [
        { field: 'date', header: 'Date', width: '120px' },
        { field: 'controlNo', header: 'Control No.', width: '150px' },
        { field: 'requestingFaculty', header: 'Requesting Faculty', width: '250px' },
        { field: 'campus', header: 'Campus/Center', width: '180px' },
        { field: 'dateTimeRelease', header: 'Date/Time of Release', width: '200px' },
        { field: 'actions', header: 'Actions', width: '120px' }
    ];

    const getMainContainer = (el) => {
        mainContainer = el;
        loadStats();
        loadReports();
    };


    const getTableBody = (el) => {
        tableBody = el;
    };

    // Function to load statistics
    const loadStats = async () => {
        try {
            const res = await fetch('/certification?action=getStats');
            const stats = await res.json();

            if (stats.success) {
                statsData = {
                    total: stats.total,
                    thisMonth: stats.thisMonth,
                    thisYear: stats.thisYear,
                    uniqueFaculty: stats.uniqueFaculty
                };

                // Update the stats cards if they're already rendered
                updateStatsCards();
            }
        } catch (err) {
            console.error('Failed to load statistics:', err);
        }
    };

    // Function to update stats cards dynamically
    const updateStatsCards = () => {
        const statValues = document.querySelectorAll('.stat-value');
        const statSubtitles = document.querySelectorAll('.stat-subtitle');

        if (statValues.length >= 4) {
            statValues[0].textContent = statsData.total;
            statValues[1].textContent = statsData.thisMonth;
            statValues[2].textContent = statsData.thisYear;
            statValues[3].textContent = statsData.uniqueFaculty;
        }
    };

    const createLogRow = (record) => {
        return $({
            tag: 'tr',
            style: {
                borderBottom: '1px solid #333',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent'
            },
            child: [
                $({ tag: 'td', text: record.date, style: { padding: '16px 12px', color: '#ccc', fontSize: '13px' } }),
                $({
                    tag: 'td',
                    style: { padding: '16px 12px' },
                    child: [
                        $({
                            tag: 'span',
                            text: record.controlNo,
                            style: {
                                padding: '4px 8px',
                                backgroundColor: '#1e3a5f',
                                color: 'deepskyblue',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }
                        })
                    ]
                }),
                $({ tag: 'td', text: record.requestingFaculty, style: { padding: '16px 12px', color: '#fff', fontSize: '14px', fontWeight: '500' } }),
                $({ tag: 'td', text: record.campus, style: { padding: '16px 12px', color: '#aaa', fontSize: '13px' } }),
                $({ tag: 'td', text: record.dateTimeRelease, style: { padding: '16px 12px', color: '#888', fontSize: '13px' } }),
                $({
                    tag: 'td',
                    style: { padding: '16px 12px', textAlign: 'center' },
                    child: [
                        $({
                            tag: 'button',
                            att: {
                                title: 'Print Certificate',
                                className: 'print-btn'
                            },
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#aaa',
                                cursor: 'pointer',
                                padding: '8px',
                                transition: 'all 0.2s ease',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                            },
                            child: [$({
                                tag: 'img',
                                att: {
                                    src: '/client/images/icon/certificatePrint/printer.png',
                                    alt: 'Print'
                                },
                                style: {
                                    width: '18px',
                                    height: '18px',
                                    objectFit: 'contain'
                                }
                            })],
                            event: {
                                type: 'click',
                                method: () => showCertificatePreview(record.certificateData, record.controlNo)
                            }
                        }),
                        record.fileUrl ? $({
                            tag: 'button',
                            att: {
                                title: 'View in Google Drive',
                                className: 'drive-btn'
                            },
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#aaa',
                                cursor: 'pointer',
                                padding: '8px',
                                transition: 'all 0.2s ease',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                            },
                            child: [$({
                                tag: 'span',
                                att: { className: 'fa-brands fa-google-drive' },
                                style: {
                                    fontSize: '18px',
                                    color: '#4caf50'
                                }
                            })],
                            event: {
                                type: 'click',
                                method: () => window.open(record.fileUrl, '_blank')
                            }
                        }) : null
                    ]
                })
            ],
            event: {
                type: 'mouseenter',
                method: (e) => e.currentTarget.style.backgroundColor = '#333'
            },
            event2: {
                type: 'mouseleave',
                method: (e) => e.currentTarget.style.backgroundColor = 'transparent'
            }
        });
    };

    const loadReports = async () => {
        try {
            const res = await fetch('/certification?action=getReports');
            const logs = await res.json();

            if (tableBody) {
                tableBody.innerHTML = '';
                if (logs && logs.length > 0) {
                    logs.forEach(log => {
                        tableBody.appendChild(createLogRow(log));
                    });
                } else {
                    tableBody.innerHTML = `<tr><td colspan="6" style="padding: 100px; text-align: center; color: #666; font-size: 16px;">
                        <div style="font-size: 40px; margin-bottom: 20px; color: #333;"><i class="fa-solid fa-certificate"></i></div>
                        No Certification Records Found<br>
                        <small style="font-size: 12px; margin-top: 10px; display: block;">Generate certificates to see them in the log</small>
                    </td></tr>`;
                }
            }

            // Update the record count in filter bar
            const recordCountSpan = document.querySelector('.record-count');
            if (recordCountSpan && logs) {
                recordCountSpan.textContent = `${logs.length} records`;
            }
        } catch (err) {
            console.error('Failed to load certification logs:', err);
        }
    };

    // Function to show certificate generation modal
    const showGenerateModal = () => {
        if (modalContainer) {
            modalContainer.remove();
        }

        const modal = CertificateModal({
            onGenerate: async (data, pdfBlob) => {
                // Save to server
                try {
                    const res = await fetch('/certification?action=saveCertificate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await res.json();

                    if (result.success) {
                        // --- GDrive Upload (Synchronous) ---
                        if (pdfBlob) {
                            try {
                                const formData = new FormData();
                                formData.append('control_no', data.controlNo);
                                formData.append('faculty', data.fullName);
                                formData.append('date', data.issueDate);
                                formData.append('pdf', pdfBlob, 'certificate.pdf');

                                const driveRes = await fetch('/saveCertificationDrive', {
                                    method: 'POST',
                                    body: formData
                                });
                            } catch (uploadErr) {
                                console.error('GDrive upload error:', uploadErr);
                            }
                        }

                        // Show preview
                        generateCertificate(data);

                        await loadReports();
                        await loadStats();
                        modalContainer.remove();
                    } else {
                        alert('Error saving certificate: ' + result.message);
                    }
                } catch (err) {
                    console.error('Save error:', err);
                    alert('Communication error with server. Please try again.');
                }
            },
            onCancel: () => {
                modalContainer.remove();
            }
        });

        modalContainer = modal;
        document.body.appendChild(modal);
    };

    // Function to show certificate preview
    const showCertificatePreview = (data, controlNo) => {
        const preview = CertificatePreviewModal(data, controlNo);
        document.body.appendChild(preview);
    };

    // Search and filter bar
    const FilterBar = () => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444',
                flexWrap: 'wrap',
                gap: '15px'
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
                            att: { className: 'fa-solid fa-certificate' },
                            style: { color: 'deepskyblue', fontSize: '22px' }
                        }),
                        $({
                            tag: 'h2',
                            text: 'Research Certification Log',
                            style: {
                                color: '#fff',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '22px',
                                fontWeight: '600',
                                margin: '0'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'record-count' },
                            style: {
                                backgroundColor: '#333',
                                color: '#aaa',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                border: '1px solid #444'
                            },
                            text: '0 records'
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    },
                    child: [
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
                                        color: '#666',
                                        fontSize: '14px',
                                        zIndex: '1'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search certificates...',
                                        className: 'cert-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '250px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            // Implement search
                                            console.log('Searching:', e.target.value);
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'button',
                            style: {
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '10px 24px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0, 191, 255, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-plus-circle' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Generate Certificate'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: showGenerateModal
                            }
                        })
                    ]
                })
            ]
        });
    };

    // Statistics cards
    const StatsCards = () => {
        const stats = [
            {
                label: 'Total Certificates',
                value: statsData.total,
                icon: 'fa-certificate',
                color: 'deepskyblue',
                subtext: 'All time'
            },
            {
                label: 'This Month',
                value: statsData.thisMonth,
                icon: 'fa-calendar-alt',
                color: '#4caf50',
                subtext: new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
            },
            {
                label: 'This Year',
                value: statsData.thisYear,
                icon: 'fa-calendar-check',
                color: '#ff9800',
                subtext: new Date().getFullYear().toString()
            },
            {
                label: 'Unique Faculty',
                value: statsData.uniqueFaculty,
                icon: 'fa-users',
                color: '#e91e63',
                subtext: 'Recipients'
            }
        ];

        const statCards = stats.map(stat => {
            return $({
                tag: 'div',
                att: { className: 'stat-card' },
                style: {
                    backgroundColor: '#2d2d2d',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: '1',
                    minWidth: '180px',
                    border: '1px solid #444',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '80px',
                            height: '80px',
                            background: `radial-gradient(circle at top right, ${stat.color}20, transparent 70%)`,
                            borderRadius: '50%',
                            zIndex: '0'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '54px',
                            height: '54px',
                            borderRadius: '16px',
                            backgroundColor: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${stat.color}30`,
                            position: 'relative',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: `fa-solid ${stat.icon}` },
                                style: { color: stat.color, fontSize: '26px' }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '8px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'stat-value' },
                                        text: stat.value.toString(),
                                        style: {
                                            fontSize: '30px',
                                            fontWeight: '700',
                                            color: '#fff',
                                            lineHeight: '1.2',
                                            letterSpacing: '-1px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        att: { className: 'stat-subtitle' },
                                        text: stat.subtext,
                                        style: {
                                            fontSize: '11px',
                                            color: '#666',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '13px',
                                    color: '#aaa',
                                    fontWeight: '500'
                                }
                            })
                        ]
                    })
                ]
            });
        });

        return $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            },
            child: statCards
        });
    };

    // Table header
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#aaa',
                    backgroundColor: '#2d2d2d',
                    borderBottom: '2px solid #444',
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
                            cursor: 'pointer'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-sort' },
                                style: { fontSize: '10px', color: '#555' }
                            })
                        ]
                    })
                ]
            });
        });

        return $({
            tag: 'thead',
            child: [
                $({
                    tag: 'tr',
                    child: headerCells
                })
            ]
        });
    };

    // Main table
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 180px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0',
                        minWidth: 'max-content'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            elementHandler: getTableBody
                        })
                    ]
                })
            ]
        });
    };

    return $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif',
            position: 'relative'
        },
        externalStyle: '/client/component/rdeStaff/style/certificationResearch.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    });
};
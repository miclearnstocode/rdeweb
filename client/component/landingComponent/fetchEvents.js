import { $, CustomModal } from '../../lib/lib.js';

// Fetch announcements from the database
export const fetchEvents = async (statusFilter = null) => {
    const formData = new FormData();
    formData.append('action', 'getAll');

    const res = await fetch('/announcements', { method: 'POST', body: formData });
    const json = await res.json();

    if (json.status) {
        let data = json.data;
        if (statusFilter) {
            data = data.filter(item => item.status === statusFilter);
        }
        return data;
    }
    return [];
};

// Modern Event Card component
export const eventCard = (data) => $({
    tag: 'div',
    style: {
        background: 'var(--white)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: '1px solid #f1f5f9',
        position: 'relative',
        width: '100%',
        maxWidth: '400px', 
        margin: '0 auto' 
    },
    event: {
        type: 'mouseenter',
        method: (e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
        }
    },
    event2: {
        type: 'mouseleave',
        method: (e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
        }
    },
    event3: {
        type: 'click',
        method: () => openEventModal(data)
    },
    child: [
        // Image Section with Status Badge
        $({
            tag: 'div',
            style: {
                height: '220px',
                background: '#f1f5f9',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            },
            child: [
                // Show first image from gallery using preview iframe
                (data.gallery_images && data.gallery_images.length > 0)
                    ? (() => {
                        let fileUrl = data.gallery_images[0].viewUrl || data.gallery_images[0].downloadUrl || '';
                        let previewSrc = fileUrl;

                        if (fileUrl && fileUrl.includes('drive.google.com')) {
                            let fileId = null;
                            const patterns = [
                                /\/d\/([a-zA-Z0-9_-]+)/,
                                /id=([a-zA-Z0-9_-]+)/,
                                /open\?id=([a-zA-Z0-9_-]+)/,
                                /\/file\/d\/([a-zA-Z0-9_-]+)/,
                                /([a-zA-Z0-9_-]{25,})/
                            ];
                            for (let pattern of patterns) {
                                const match = fileUrl.match(pattern);
                                if (match && match[1]) {
                                    fileId = match[1];
                                    break;
                                }
                            }
                            if (fileId) {
                                fileId = fileId.split('?')[0].split('&')[0];
                                previewSrc = `https://drive.google.com/file/d/${fileId}/preview`;
                            }
                        }

                        return $({
                            tag: 'iframe',
                            att: {
                                src: previewSrc,
                                frameborder: '0',
                                allowfullscreen: true,
                                loading: 'lazy'
                            },
                            style: {
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }
                        });
                    })()
                    : $({
                        tag: 'div',
                        style: {
                            fontSize: '48px',
                            color: '#cbd5e1',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: '700'
                        },
                        text: '📢'
                    }),
                // Status Badge
                $({
                    tag: 'span',
                    text: data.status === 'Ongoing' ? 'LIVE' : 'UPCOMING',
                    style: {
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: data.status === 'Ongoing' ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }
                })
            ]
        }),
        // Content Section
        $({
            tag: 'div',
            style: { padding: '20px 24px 24px' },
            child: [
                $({
                    tag: 'h3',
                    text: data.title,
                    style: {
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#1a2a3a',
                        lineHeight: '1.4'
                    }
                }),
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-regular fa-calendar' },
                            style: { color: '#94a3b8', fontSize: '13px' }
                        }),
                        $({
                            tag: 'span',
                            text: data.event_date,
                            style: { fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }
                        }),
                        $({
                            tag: 'span',
                            text: '•',
                            style: { color: '#cbd5e1' }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-location-dot' },
                            style: { color: '#94a3b8', fontSize: '13px' }
                        }),
                        $({
                            tag: 'span',
                            text: data.venue,
                            style: { fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }
                        })
                    ]
                }),
                $({
                    tag: 'p',
                    text: data.short_description || 'Click to view full details...',
                    style: {
                        color: '#94a3b8',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }
                })
            ]
        })
    ]
});

export const openEventModal = (data) => {
    const modalContent = $({
        tag: 'div',
        style: { maxWidth: '800px', width: '100%', margin: '0 auto' },
        child: [
            // Carousel for Images
            $({
                tag: 'div',
                style: {
                    position: 'relative',
                    width: '100%',
                    height: '350px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    marginBottom: '24px'
                },
                elementHandler: (el) => {
                    const images = data.gallery_images || [];
                    if (images.length === 0) {
                        el.innerHTML = `
                            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:48px;">
                                📢 No Images
                            </div>
                        `;
                        return;
                    }

                    let currentIndex = 0;
                    const slideContainer = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }
                    });

                    // --- LOOP THROUGH IMAGES USING viewUrl ---
                    images.forEach((img) => {
                        // Handle viewUrl or downloadUrl fallback exactly like mainResearch.js
                        let fileUrl = img.viewUrl || img.downloadUrl || '';

                        // If it's a Google Drive URL, ensure we use the embed-friendly format
                        if (fileUrl && fileUrl.includes('drive.google.com')) {
                            let fileId = null;
                            const patterns = [
                                /\/d\/([a-zA-Z0-9_-]+)/,
                                /id=([a-zA-Z0-9_-]+)/,
                                /open\?id=([a-zA-Z0-9_-]+)/,
                                /\/file\/d\/([a-zA-Z0-9_-]+)/,
                                /([a-zA-Z0-9_-]{25,})/
                            ];
                            
                            for (let pattern of patterns) {
                                const match = fileUrl.match(pattern);
                                if (match && match[1]) {
                                    fileId = match[1];
                                    break;
                                }
                            }
                            
                            if (fileId) {
                                fileId = fileId.split('?')[0].split('&')[0];
                                // DIRECTLY USE THE PREVIEW URL (exactly how mainResearch.js does it)
                                fileUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                            }
                        }

                        const slide = $({
                            tag: 'div',
                            style: {
                                flex: '0 0 100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f1f5f9'
                            },
                            child: [
                                // Use an iframe for the preview (just like mainResearch.js)
                                $({
                                    tag: 'iframe',
                                    att: {
                                        src: fileUrl,
                                        frameborder: '0',
                                        allowfullscreen: true,
                                        loading: 'lazy'
                                    },
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }
                                })
                            ]
                        });
                        slideContainer.appendChild(slide);
                    });

                    el.appendChild(slideContainer);

                    // Navigation Buttons (only if more than 1 image)
                    if (images.length > 1) {
                        const prevBtn = $({
                            tag: 'button',
                            html: '‹',
                            style: {
                                position: 'absolute',
                                top: '50%',
                                left: '16px',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                fontSize: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                zIndex: '10'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    currentIndex = (currentIndex - 1 + images.length) % images.length;
                                    slideContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                                },
                                type2: 'mouseenter',
                                method2: (e) => e.target.style.background = 'rgba(0,0,0,0.8)',
                                type3: 'mouseleave',
                                method3: (e) => e.target.style.background = 'rgba(0,0,0,0.5)'
                            }
                        });

                        const nextBtn = $({
                            tag: 'button',
                            html: '›',
                            style: {
                                position: 'absolute',
                                top: '50%',
                                right: '16px',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                fontSize: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                zIndex: '10'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    currentIndex = (currentIndex + 1) % images.length;
                                    slideContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                                },
                                type2: 'mouseenter',
                                method2: (e) => e.target.style.background = 'rgba(0,0,0,0.8)',
                                type3: 'mouseleave',
                                method3: (e) => e.target.style.background = 'rgba(0,0,0,0.5)'
                            }
                        });

                        el.appendChild(prevBtn);
                        el.appendChild(nextBtn);

                        // Dot Indicators
                        const dotsContainer = $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                bottom: '16px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '8px',
                                zIndex: '10'
                            }
                        });

                        images.forEach((_, i) => {
                            const dot = $({
                                tag: 'div',
                                style: {
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: i === 0 ? 'white' : 'rgba(255,255,255,0.5)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        currentIndex = i;
                                        slideContainer.style.transform = `translateX(-${i * 100}%)`;
                                        // Update dots
                                        const dots = dotsContainer.children;
                                        for (let j = 0; j < dots.length; j++) {
                                            dots[j].style.backgroundColor = j === i ? 'white' : 'rgba(255,255,255,0.5)';
                                        }
                                    }
                                }
                            });
                            dotsContainer.appendChild(dot);
                        });
                        el.appendChild(dotsContainer);

                        // Auto-play
                        let autoPlay = setInterval(() => {
                            currentIndex = (currentIndex + 1) % images.length;
                            slideContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                            // Update dots
                            const dots = dotsContainer.children;
                            for (let j = 0; j < dots.length; j++) {
                                dots[j].style.backgroundColor = j === currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
                            }
                        }, 4500);

                        // Pause on hover
                        el.addEventListener('mouseenter', () => clearInterval(autoPlay));
                        el.addEventListener('mouseleave', () => {
                            autoPlay = setInterval(() => {
                                currentIndex = (currentIndex + 1) % images.length;
                                slideContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
                                const dots = dotsContainer.children;
                                for (let j = 0; j < dots.length; j++) {
                                    dots[j].style.backgroundColor = j === currentIndex ? 'white' : 'rgba(255,255,255,0.5)';
                                }
                            }, 4500);
                        });
                    }
                }
            }),
            // Event Details
            $({
                tag: 'div',
                style: { padding: '0 4px' },
                child: [
                    $({ tag: 'h2', text: data.title, style: { fontSize: '1.4rem', fontWeight: '700', color: '#1a2a3a', marginBottom: '8px' } }),
                    $({
                        tag: 'div',
                        style: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', color: '#64748b', fontSize: '0.9rem' },
                        child: [
                            $({ tag: 'span', text: `📅 ${data.event_date}` }),
                            $({ tag: 'span', text: `📍 ${data.venue}` }),
                            data.facebook_link ? $({
                                tag: 'a',
                                att: { href: data.facebook_link, target: '_blank', rel: 'noopener' },
                                style: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
                                text: '🔗 Facebook Event'
                            }) : null
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { color: '#334155', lineHeight: '1.8', fontSize: '0.95rem' },
                        child: [
                            $({ tag: 'p', text: data.body || data.short_description || 'No detailed description available.' })
                        ]
                    }),
                    data.hashtags ? $({
                        tag: 'div',
                        style: { marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' },
                        child: data.hashtags.split(',').map(tag =>
                            $({
                                tag: 'span',
                                text: tag.trim(),
                                style: {
                                    background: '#e8f0fe',
                                    color: '#1a73e8',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                }
                            })
                        )
                    }) : null
                ]
            })
        ]
    });

    CustomModal({
        title: 'Event Details',
        content: modalContent,
        size: 'large',
        closeOnOverlayClick: true
    });
};
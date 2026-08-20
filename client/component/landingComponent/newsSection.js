import { $, CustomModal } from '../../lib/lib.js'

// Fetch news from the database
const fetchNews = async () => {
    const formData = new FormData()
    formData.append('action', 'getAll')
    formData.append('type', 'news') // <--- Fetch only News

    const res = await fetch('/announcements', { method: 'POST', body: formData })
    const json = await res.json()

    if (json.status) {
        return json.data
    }
    return []
}

export const NewsSection = () => {
    let containerEl

    const renderGrid = async () => {
        const newsData = await fetchNews()
        containerEl.innerHTML = ''
        
        if (newsData.length === 0) {
            containerEl.appendChild($({
                tag: 'div',
                style: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
                text: 'No news or updates available at the moment.'
            }))
            return
        }

        const grid = $({
            tag: 'div',
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
            child: newsData.map(article => newsCard(article, renderDetail))
        })
        containerEl.appendChild(grid)
    }

    const renderDetail = (id) => {
        // Fetch fresh data to ensure the modal has the latest details
        fetchNews().then(newsData => {
            const article = newsData.find(n => n.id === id)
            if(!article) return
            openNewsModal(article, renderGrid)
        })
    }

    // Main Container Setup
    return $({
        tag: 'section',
        att: { id: 'news' },
        style: { padding: '80px 0', backgroundColor: 'var(--light-bg)' },
        child: [
            $({
                tag: 'div',
                att: { className: 'container' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'section-header' },
                        child: [
                            $({ tag: 'h2', text: 'News & Updates', att: { className: 'section-title' } }),
                            $({ tag: 'p', text: 'Latest headlines from CAPSU RDE', style: { color: 'var(--text-gray)', marginTop: '15px' } })
                        ]
                    }),
                    $({
                        tag: 'div',
                        elementHandler: (el) => { containerEl = el; renderGrid() }
                    })
                ]
            })
        ]
    })
}

const getCleanPreviewUrl = (url) => {
    if (!url) return ''
    let previewSrc = url
    if (url.includes('drive.google.com')) {
        let fileId = null
        const patterns = [
            /\/d\/([a-zA-Z0-9_-]+)/,
            /id=([a-zA-Z0-9_-]+)/,
            /open\?id=([a-zA-Z0-9_-]+)/,
            /\/file\/d\/([a-zA-Z0-9_-]+)/,
            /([a-zA-Z0-9_-]{25,})/
        ]
        for (let pattern of patterns) {
            const match = url.match(pattern)
            if (match && match[1]) {
                fileId = match[1]
                break
            }
        }
        if (fileId) {
            fileId = fileId.split('?')[0].split('&')[0]
            previewSrc = `https://drive.google.com/file/d/${fileId}/preview`
        }
    }
    return previewSrc
}

const newsCard = (article, onClick) => $({
    tag: 'div',
    style: { background: 'var(--white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' },
    event: { type: 'click', method: () => onClick(article.id) },
    child: [
        // --- UPDATED: Use an iframe for the thumbnail instead of background-image ---
        $({ 
            tag: 'div', 
            style: { 
                height: '200px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9'
            },
            child: article.gallery_images && article.gallery_images.length > 0
                ? [
                    (() => {
                        let fileUrl = article.gallery_images[0].viewUrl || article.gallery_images[0].downloadUrl || ''
                        let previewSrc = getCleanPreviewUrl(fileUrl)
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
                        })
                    })()
                ]
                : [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            fontSize: '48px',
                            color: '#94a3b8',
                            fontFamily: '"Plus Jakarta Sans", sans-serif'
                        },
                        text: '📢 No Image'
                    })
                ]
        }),
        $({
            tag: 'div',
            style: { padding: '20px' },
            child: [
                $({ tag: 'span', text: article.event_date || 'N/A', style: { fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: '500' } }),
                $({ tag: 'h3', text: article.title, style: { fontSize: '1.1rem', fontWeight: '600', margin: '8px 0' } }),
                $({ tag: 'p', text: article.body ? article.body.substring(0, 100) + '...' : 'Click to read more...', style: { color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '12px' } }),
                $({ tag: 'span', text: 'Read More →', style: { color: 'var(--primary-blue)', fontWeight: '500', fontSize: '0.9rem' } })
            ]
        })
    ]
})

// --- OPEN NEWS MODAL (Copied the exact logic from fetchEvents.js) ---
const openNewsModal = (data, onClose) => {
    const modalContent = $({
        tag: 'div',
        style: { maxWidth: '800px', width: '100%', margin: '0 auto', fontFamily: '"Inter", sans-serif' },
        child: [
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
                child: [
                    (data.gallery_images && data.gallery_images.length > 0)
                    ? (() => {
                        let fileUrl = data.gallery_images[0].viewUrl || data.gallery_images[0].downloadUrl || ''
                        let previewSrc = getCleanPreviewUrl(fileUrl)
                        
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
                        })
                    })()
                    : $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#94a3b8',
                            fontSize: '48px',
                            fontFamily: '"Plus Jakarta Sans", sans-serif'
                        },
                        text: '📢 No Image'
                    })
                ]
            }),
            $({
                tag: 'div',
                style: { padding: '0 4px' },
                child: [
                    $({ 
                        tag: 'h2', 
                        text: data.title, 
                        style: { 
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: '1.4rem', 
                            fontWeight: '700', 
                            color: '#1a2a3a', 
                            marginBottom: '8px' 
                        } 
                    }),
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
                                text: '🔗 Facebook Link'
                            }) : null
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { 
                            color: '#334155', 
                            lineHeight: '1.8', 
                            fontSize: '0.95rem',
                            textAlign: 'justify'
                        },
                        child: (data.body || 'No detailed description available.')
                            .split(/\r?\n/)
                            .filter(paragraph => paragraph.trim() !== '')
                            .map(paragraphText => 
                                $({ 
                                    tag: 'p', 
                                    text: paragraphText,
                                    style: { 
                                        fontFamily: '"Inter", sans-serif',
                                        marginBottom: '16px' 
                                    } 
                                })
                            )
                    }),
                    (data.hashtags && data.hashtags.trim() !== '') 
                    ? $({
                        tag: 'div',
                        style: { marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' },
                        child: data.hashtags.split(',').map(tag =>
                            $({
                                tag: 'span',
                                text: tag.trim(),
                                style: {
                                    fontFamily: '"Inter", sans-serif',
                                    background: '#e8f0fe',
                                    color: '#1a73e8',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                }
                            })
                        )
                    })
                    : null
                ]
            })
        ]
    })

    CustomModal({
        title: 'News Details',
        content: modalContent,
        size: 'large',
        closeOnOverlayClick: true,
        onClose: () => {
            if (typeof onClose === 'function') onClose()
        }
    })
}
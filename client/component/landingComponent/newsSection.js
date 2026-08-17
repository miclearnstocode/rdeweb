import { $ } from '../../lib/lib.js';

const newsData = [
  { id: 1, title: 'CAPSU RDE Launches New Research Grant Cycle', excerpt: 'The office is pleased to announce the opening of its latest funding cycle.', date: 'Sept 15, 2026', author: 'Dr. Santos', body: 'Full body text goes here... This is a detailed article about the new grant cycle.', img: 'https://placehold.co/800x500/e2e8f0/475569?text=Grant+Cycle' },
  { id: 2, title: 'Extension Program Wins National Award', excerpt: 'The community-based project received recognition for its impact.', date: 'Sept 10, 2026', author: 'Dr. Reyes', body: 'Full body text for the award...', img: 'https://placehold.co/800x500/e2e8f0/475569?text=Award+Win' },
  { id: 3, title: 'New Partnership with Local Government Unit', excerpt: 'Collaboration signed to boost agricultural support.', date: 'Sept 5, 2026', author: 'Dr. Cruz', body: 'Details about the MOA signing...', img: 'https://placehold.co/800x500/e2e8f0/475569?text=LGU+Partnership' }
];

export const NewsSection = () => {
  // State elements
  let containerEl;

  const renderGrid = () => {
    containerEl.innerHTML = '';
    const grid = $({
      tag: 'div',
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
      child: newsData.map(article => newsCard(article, renderDetail))
    });
    containerEl.appendChild(grid);
  };

  const renderDetail = (id) => {
    const article = newsData.find(n => n.id === id);
    if(!article) return;
    containerEl.innerHTML = '';
    
    const detail = $({
      tag: 'div',
      style: { display: 'flex', flexDirection: 'column', gap: '30px' },
      child: [
        // Back Button
        $({
          tag: 'button',
          text: '← Back to all news',
          style: { background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', alignSelf: 'flex-start' },
          event: { type: 'click', method: renderGrid }
        }),
        // Main Detail Area with Sidebar
        $({
          tag: 'div',
          style: { display: 'flex', flexDirection: 'column', gap: '30px', '@media (min-width: 992px)': { flexDirection: 'row' } },
          child: [
            // Article Body
            $({
              tag: 'div',
              style: { flex: '2' },
              child: [
                $({ tag: 'img', att: { src: article.img }, style: { width: '100%', borderRadius: 'var(--radius)', marginBottom: '20px' } }),
                $({ tag: 'h1', text: article.title, style: { fontSize: '2rem', fontWeight: '700', marginBottom: '12px' } }),
                $({ tag: 'p', text: `${article.date} • ${article.author}`, style: { color: 'var(--text-gray)', marginBottom: '20px' } }),
                $({ tag: 'p', text: article.body, style: { lineHeight: '1.8', fontSize: '1.05rem' } })
              ]
            }),
            // Recent News Sidebar
            $({
              tag: 'div',
              style: { flex: '1', borderLeft: '1px solid #e2e8f0', paddingLeft: '30px', '@media (max-width: 991px)': { borderLeft: 'none', paddingLeft: '0' } },
              child: [
                $({ tag: 'h4', text: 'Recent News', style: { marginBottom: '15px', color: 'var(--primary-navy)' } }),
                ...newsData.filter(n => n.id !== id).map(n => $({
                  tag: 'div',
                  style: { padding: '10px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' },
                  child: [
                    $({ tag: 'span', text: n.title, style: { fontWeight: '500', display: 'block', marginBottom: '4px' } }),
                    $({ tag: 'span', text: n.date, style: { fontSize: '0.8rem', color: 'var(--text-gray)' } })
                  ],
                  event: { type: 'click', method: () => renderDetail(n.id) }
                }))
              ]
            })
          ]
        })
      ]
    });
    containerEl.appendChild(detail);
  };

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
            elementHandler: (el) => { containerEl = el; renderGrid(); }
          })
        ]
      })
    ]
  });
};

const newsCard = (article, onClick) => $({
  tag: 'div',
  style: { background: 'var(--white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' },
  event: { type: 'click', method: () => onClick(article.id) },
  child: [
    $({ tag: 'div', style: { height: '200px', backgroundImage: `url(${article.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } }),
    $({
      tag: 'div',
      style: { padding: '20px' },
      child: [
        $({ tag: 'span', text: article.date, style: { fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: '500' } }),
        $({ tag: 'h3', text: article.title, style: { fontSize: '1.1rem', fontWeight: '600', margin: '8px 0' } }),
        $({ tag: 'p', text: article.excerpt, style: { color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '12px' } }),
        $({ tag: 'span', text: 'Read More →', style: { color: 'var(--primary-blue)', fontWeight: '500', fontSize: '0.9rem' } })
      ]
    })
  ]
});
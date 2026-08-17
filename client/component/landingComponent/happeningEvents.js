import { $ } from '../../lib/lib.js';

const mockEvents = [
  { id: 1, title: 'Community Training on Sustainable Agriculture', date: 'Oct 5-10, 2026', location: 'Pontevedra, Capiz', desc: 'Empowering local farmers with modern techniques.', img: 'https://placehold.co/600x400/e2e8f0/475569?text=Agri+Training' },
  { id: 2, title: 'Research Colloquium 2026', date: 'Oct 15, 2026', location: 'Roxas City', desc: 'Annual presentation of funded research projects.', img: 'https://placehold.co/600x400/e2e8f0/475569?text=Colloquium' },
  { id: 3, title: 'Coastal Clean-up & Mangrove Planting', date: 'Oct 20, 2026', location: 'Burias, Capiz', desc: 'Environmental stewardship in coastal communities.', img: 'https://placehold.co/600x400/e2e8f0/475569?text=Coastal+Cleanup' }
];

export const HappeningEvents = () => {
  return $({
    tag: 'section',
    att: { id: 'events' },
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
              $({ tag: 'h2', text: 'Happening Now', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'Current activities and events hosted by the RDE Office', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          $({
            tag: 'div',
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
            child: mockEvents.map(e => eventCard(e, true))
          })
        ]
      })
    ]
  });
};

const eventCard = (data, isHappening) => $({
  tag: 'div',
  style: {
    background: 'var(--white)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
    transition: 'var(--transition)'
  },
  child: [
    $({
      tag: 'div',
      style: { height: '200px', backgroundImage: `url(${data.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
      // FIXED: Wrap the conditional in an array, or use [] for false
      child: isHappening ? [
        $({
          tag: 'span',
          text: 'LIVE',
          style: { position: 'absolute', top: '15px', left: '15px', background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }
        })
      ] : [] // <--- RETURN AN EMPTY ARRAY IF FALSE
    }),
    $({
      tag: 'div',
      style: { padding: '20px' },
      child: [
        $({ tag: 'h3', text: data.title, style: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' } }),
        $({ tag: 'p', text: `${data.date} • ${data.location}`, style: { fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: '500', marginBottom: '12px' } }),
        $({ tag: 'p', text: data.desc, style: { color: 'var(--text-gray)', fontSize: '0.95rem' } })
      ]
    })
  ]
});
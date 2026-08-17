import { $ } from '../../lib/lib.js';


const mockUpcoming = [
  { id: 4, title: 'International Research Conference 2027', date: 'Feb 20-22, 2027', location: 'Convention Center, Iloilo', desc: 'Global collaboration in sustainability.', img: 'https://placehold.co/600x400/e2e8f0/475569?text=Intl+Conf' },
  { id: 5, title: 'Extension Service Training for New Staff', date: 'Nov 5-8, 2026', location: 'CAPSU Main Campus', desc: 'Orientation for new RDE personnel.', img: 'https://placehold.co/600x400/e2e8f0/475569?text=Staff+Training' }
];

export const UpcomingEvents = () => {
  return $({
    tag: 'section',
    style: { padding: '80px 0', backgroundColor: 'var(--white)' },
    child: [
      $({
        tag: 'div',
        att: { className: 'container' },
        child: [
          $({
            tag: 'div',
            att: { className: 'section-header' },
            child: [
              $({ tag: 'h2', text: 'Mark Your Calendar', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'Upcoming events and conferences', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          $({
            tag: 'div',
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
            child: mockUpcoming.map(e => eventCard(e, false))
          })
        ]
      })
    ]
  });
};


const eventCard = (data, isHappening) => $({
  tag: 'div',
  style: { background: 'var(--white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'var(--transition)' },
  child: [
    $({
      tag: 'div',
      style: { height: '200px', backgroundImage: `url(${data.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
      child: !isHappening ? [
        $({
          tag: 'span',
          text: 'UPCOMING',
          style: { position: 'absolute', top: '15px', left: '15px', background: 'var(--primary-blue)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }
        })
      ] : [] // <--- RETURN AN EMPTY ARRAY IF FALSE
    }),
    $({
      tag: 'div',
      style: { padding: '20px' },
      child: [
        $({ tag: 'h3', text: data.title, style: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' } }),
        $({ tag: 'p', text: `${data.date} • ${data.location}`, style: { fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: '500', marginBottom: '12px' } }),
        $({ tag: 'p', text: data.desc, style: { color: 'var(--text-gray)', fontSize: '0.95rem' } })
      ]
    })
  ]
});
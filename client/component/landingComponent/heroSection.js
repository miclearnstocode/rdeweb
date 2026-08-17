import { $ } from '../../lib/lib.js';

export const HeroSection = () => {
  return $({
    tag: 'section',
    att: { id: 'home', className: 'hero-section' },
    style: {
      padding: '100px 0',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-blue) 100%)',
      color: 'var(--white)',
      position: 'relative',
      overflow: 'hidden'
    },
    child: [
      // Decorative Background Pattern
      $({
        tag: 'div',
        style: {
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '50%',
          height: '80%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none'
        }
      }),
      $({
        tag: 'div',
        att: { className: 'container' },
        style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '30px', zIndex: 2, position: 'relative' },
        child: [
          $({
            tag: 'h1',
            text: 'Empowering Communities Through Research and Innovation',
            style: { fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', lineHeight: '1.2', maxWidth: '800px' }
          }),
          $({
            tag: 'p',
            text: 'The Research, Development, and Extension Office of Capiz State University is dedicated to generating knowledge, driving sustainable development, and serving the people of Panay and beyond.',
            style: { fontSize: '1.2rem', maxWidth: '600px', opacity: 0.9, lineHeight: '1.6' }
          }),
          // Stats Row
          $({
            tag: 'div',
            style: { display: 'flex', gap: '40px', flexWrap: 'wrap', marginTop: '10px' },
            child: [
              statItem('150+', 'Research Studies'),
              statItem('40+', 'Extension Programs'),
              statItem('12', 'Partner Communities')
            ]
          }),
          // CTA
          $({
            tag: 'a',
            att: { href: '#centers' },
            text: 'Explore Our Programs',
            style: {
              marginTop: '20px',
              padding: '14px 36px',
              background: 'var(--accent-orange)',
              color: 'var(--white)',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'var(--transition)',
              boxShadow: '0 4px 15px rgba(245, 166, 35, 0.4)'
            },
            event: {
              type: 'mouseenter',
              method: (e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(245, 166, 35, 0.6)'; }
            },
            event2: {
              type: 'mouseleave',
              method: (e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(245, 166, 35, 0.4)'; }
            }
          })
        ]
      })
    ]
  });
};

// Helper for stat items
const statItem = (number, label) => $({
  tag: 'div',
  style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  child: [
    $({ tag: 'span', text: number, style: { fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-orange)' } }),
    $({ tag: 'span', text: label, style: { fontSize: '0.95rem', opacity: 0.8 } })
  ]
});
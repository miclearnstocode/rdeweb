import { $ } from '../../lib/lib.js';

export const Navbar = () => {
  const links = ['Home', 'About Us', 'News', 'Events', 'Centers', 'Contact Us'];
  
  return $({
    tag: 'header',
    style: {
      position: 'sticky',
      top: '0',
      zIndex: '1000',
      backgroundColor: 'var(--white)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      padding: '16px 0',
      width: '100%'
    },
    child: [
      $({
        tag: 'div',
        att: { className: 'container' },
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        },
        child: [
          // Logo + Wordmark
          $({
            tag: 'a',
            att: { href: '#', className: 'brand-logo' },
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none'
            },
            child: [
              $({
                tag: 'img',
                att: { src: '/client/images/cap.png', alt: 'CAPSU Logo', width: 50, height: 50 },
                style: { borderRadius: '50%', objectFit: 'contain', backgroundColor: '#fff' }
              }),
              $({
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', lineHeight: '1.1' },
                child: [
                  $({ tag: 'span', text: 'CAPSU', style: { fontWeight: '800', fontSize: '18px', color: 'var(--primary-navy)' } }),
                  $({ tag: 'span', text: 'Research Development & Extension', style: { fontWeight: '400', fontSize: '11px', color: 'var(--text-gray)' } })
                ]
              })
            ]
          }),
          // Navigation Links + Hamburger
          $({
            tag: 'nav',
            style: { display: 'flex', alignItems: 'center', gap: '24px' },
            child: [
              // Desktop Links
              ...links.map(link => $({
                tag: 'a',
                att: { href: `#${link.toLowerCase().replace(' ', '-')}` },
                text: link,
                style: {
                  textDecoration: 'none',
                  color: 'var(--text-dark)',
                  fontWeight: '500',
                  fontSize: '15px',
                  transition: 'var(--transition)',
                  display: 'none', // hidden on mobile
                  '@media (min-width: 992px)': { display: 'block' }
                },
                event: {
                  type: 'mouseenter',
                  method: (e) => e.target.style.color = 'var(--primary-blue)'
                },
                event2: {
                  type: 'mouseleave',
                  method: (e) => e.target.style.color = 'var(--text-dark)'
                }
              })),
              // Mobile Hamburger Icon
              $({
                tag: 'button',
                att: { className: 'hamburger', 'aria-label': 'Toggle Menu' },
                style: {
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--primary-navy)',
                  display: 'block',
                  '@media (min-width: 992px)': { display: 'none' }
                },
                html: '&#9776;' // Unicode hamburger
              })
            ]
          })
        ]
      })
    ]
  });
};
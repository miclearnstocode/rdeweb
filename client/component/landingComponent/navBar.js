import { $ } from '../../lib/lib.js';

export const Navbar = () => {
  const links = ['Home', 'About Us', 'News', 'Events', 'Centers', 'Contact Us'];

  // We limit the burger menu to only show specific links
  const burgerLinks = ['Home', 'About Us', 'Events', 'Contact Us'];

  let menuOpen = false;
  let mobileMenuEl = null;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
    if (mobileMenuEl) {
      if (menuOpen) {
        mobileMenuEl.style.display = 'flex';
        // Small delay for the DOM to register display:flex before animating
        setTimeout(() => {
          mobileMenuEl.style.opacity = '1';
          mobileMenuEl.style.transform = 'translateY(0)';
        }, 10);
      } else {
        mobileMenuEl.style.opacity = '0';
        mobileMenuEl.style.transform = 'translateY(-15px)';
        setTimeout(() => {
          mobileMenuEl.style.display = 'none';
        }, 300);
      }
    }
  };

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
          width: '100%',
          position: 'relative'
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
                style: { borderRadius: '10%', objectFit: 'contain', backgroundColor: '#fff' }
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
            style: { display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' },
            child: [
              // Desktop Links (Hidden on Mobile)
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
                  display: 'none',
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
              // Mobile Dropdown Menu (Hidden by default)
              $({
                tag: 'div',
                elementHandler: (el) => { mobileMenuEl = el; },
                style: {
                  display: 'none',
                  flexDirection: 'column',
                  position: 'absolute',
                  top: '60px',
                  right: '0',
                  backgroundColor: 'var(--white)',
                  minWidth: '200px',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px 0',
                  opacity: '0',
                  transform: 'translateY(-15px)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  zIndex: '999',
                  '@media (min-width: 992px)': { display: 'none !important' }
                },
                child: burgerLinks.map(link => $({
                  tag: 'a',
                  att: { href: `#${link.toLowerCase().replace(' ', '-')}` },
                  text: link,
                  style: {
                    textDecoration: 'none',
                    color: 'var(--text-dark)',
                    fontWeight: '500',
                    fontSize: '15px',
                    padding: '12px 24px',
                    transition: 'var(--transition)',
                    display: 'block'
                  },
                  event: {
                    type: 'mouseenter',
                    method: (e) => e.target.style.backgroundColor = 'var(--light-bg)'
                  },
                  event2: {
                    type: 'mouseleave',
                    method: (e) => e.target.style.backgroundColor = 'transparent'
                  },
                  event3: {
                    type: 'click',
                    method: () => { toggleMenu(); } // Close menu after clicking a link
                  }
                }))
              }),
              // Mobile Hamburger Icon (Replaced with an actual button to trigger menu)
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
                html: '&#9776;',
                event: {
                  type: 'click',
                  method: toggleMenu
                }
              })
            ]
          })
        ]
      })
    ]
  });
};
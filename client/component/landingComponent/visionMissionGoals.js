import { $ } from '../../lib/lib.js';

export const VisionMissionGoals = () => {
  const sections = [
    { 
      icon: 'fa-solid fa-eye', 
      title: 'Vision', 
      text: 'Center of Academic Excellence Delivering Quality Service to All.' 
    },
    { 
      icon: 'fa-solid fa-bullseye', 
      title: 'Mission', 
      text: 'Capiz State University is committed to provide advance knowledge and innovation; develop skills, talents and values; undertake relevant research, development and extension services; promote entrepreneurship and environmental consciousness; and enhance industry collaboration and linkages with partner agencies.' 
    },
    { 
      icon: 'fa-solid fa-list-check', 
      title: 'Goals', 
      text: [
        'Globally competitive graduates',
        'Institutionalized research culture',
        'Responsive and sustainable extension services',
        'Maximized profit of viable agro-industrial business ventures',
        'Effective and efficient administration'
      ]
    }
  ];

  // Create a root element to hold the section and attach the observer
  const sectionRoot = $({
    tag: 'section',
    att: { id: 'about-us', className: 'vmg-section' },
    style: { 
      padding: '100px 0', 
      backgroundColor: 'var(--light-bg)',
      position: 'relative',
      overflow: 'hidden'
    },
    child: [
      // Decorative background blob
      $({
        tag: 'div',
        style: {
          position: 'absolute',
          top: '-20%',
          right: '-15%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'var(--primary-blue)',
          opacity: '0.04',
          pointerEvents: 'none'
        }
      }),
      $({
        tag: 'div',
        att: { className: 'container' },
        child: [
          $({
            tag: 'div',
            att: { className: 'section-header' },
            child: [
              $({ tag: 'h2', text: 'Vision, Mission & Goals', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'The guiding principles of Capiz State University', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          $({
            tag: 'div',
            att: { className: 'vmg-grid' },
            style: { 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '30px' 
            },
            child: sections.map((s, index) => {
              // Create individual card with animation class
              const card = $({
                tag: 'div',
                att: { className: `vmg-card vmg-card-${index}` },
                style: { 
                  background: 'var(--white)', 
                  padding: '40px 35px', 
                  borderRadius: 'var(--radius)', 
                  boxShadow: 'var(--shadow)',
                  textAlign: 'left',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  opacity: '0',
                  transform: 'translateY(40px)',
                  position: 'relative',
                  borderBottom: '4px solid var(--primary-blue)'
                },
                child: [
                  // Title section with centered icon
                  $({ 
                    tag: 'div', 
                    style: { textAlign: 'center', marginBottom: '25px' },
                    child: [
                      $({ 
                        tag: 'div', 
                        style: { 
                          width: '70px', 
                          height: '70px', 
                          margin: '0 auto 15px', 
                          background: 'var(--primary-blue)', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.8rem'
                        },
                        child: [ $({ tag: 'i', att: { className: s.icon } }) ]
                      }),
                      $({ tag: 'h3', text: s.title, style: { fontSize: '1.6rem', fontWeight: '700', color: 'var(--primary-navy)' } })
                    ]
                  }),
                  // Content Section
                  Array.isArray(s.text) 
                    ? $({
                        tag: 'ul',
                        style: {
                          paddingLeft: '20px',
                          margin: '0',
                          listStyleType: 'circle',
                          lineHeight: '2',
                          color: 'var(--text-gray)',
                          fontSize: '0.95rem'
                        },
                        child: s.text.map(item => $({
                          tag: 'li',
                          text: item,
                          style: { marginBottom: '6px' }
                        }))
                      })
                    : $({ 
                        tag: 'p', 
                        text: s.text, 
                        style: { 
                          color: 'var(--text-gray)', 
                          lineHeight: '1.8',
                          margin: '0',
                          fontSize: '0.95rem'
                        } 
                      })
                ]
              });

              // Add hover effect
              card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
                card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
              });
              card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0px)';
                card.style.boxShadow = 'var(--shadow)';
              });

              return card;
            })
          })
        ]
      })
    ]
  });

  // === INTERSECTION OBSERVER ANIMATION ===
  // Wait for the DOM to be fully ready before observing
  setTimeout(() => {
    const cards = sectionRoot.querySelectorAll('.vmg-card');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add a slight delay to each card for a cascading effect
            const delay = parseInt(entry.target.className.split('-')[2]) * 150;
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, delay);
            
            // Stop observing after it animates in
            observer.unobserve(entry.target);
          }
        });
      }, { 
        threshold: 0.15, // Trigger when 15% of the card is visible
        rootMargin: '0px 0px -50px 0px' // Slight offset for better timing
      });

      cards.forEach(card => observer.observe(card));
    } else {
      // Fallback for older browsers: show everything immediately
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  }, 100);

  return sectionRoot;
};
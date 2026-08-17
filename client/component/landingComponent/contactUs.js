import { $ } from '../../lib/lib.js';

export const ContactUs = () => {
  return $({
    tag: 'section',
    att: { id: 'contact-us' },
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
              $({ tag: 'h2', text: 'Get in Touch', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'We\'d love to hear from you', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          $({
            tag: 'div',
            style: { display: 'flex', flexWrap: 'wrap', gap: '40px' },
            child: [
              // Contact Info
              $({
                tag: 'div',
                style: { flex: '1 1 300px', background: 'var(--white)', padding: '40px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' },
                child: [
                  contactItem('fa-solid fa-location-dot', 'Fuentes Drive Roxas City, Roxas City Main Campus, Capiz State University'),
                  contactItem('fa-solid fa-envelope', 'rde@capsu.edu.ph'),
                  contactItem('fa-solid fa-phone', '(036) 522 9756'),

                  $({ 
                    tag: 'div', 
                    style: { marginTop: '20px' }, 
                    child: [
                      $({ 
                        tag: 'span', 
                        text: 'Follow us:',
                        style: {
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: 'var(--text-gray)',
                          marginBottom: '10px'
                        }
                      }),
                      $({ 
                        tag: 'div', 
                        style: { display: 'flex', gap: '12px' },
                        child: [
                          socialIcon('facebook', '#1877F2'),
                          socialIcon('x-twitter', '#000000'), // <-- CHANGED TO X
                          socialIcon('youtube', '#FF0000')
                        ]
                      })
                    ] 
                  }),
                  $({
                    tag: 'div',
                    style: { 
                      marginTop: '25px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      justifyContent: 'flex-start'
                    },
                    child: [
                      hashtagBadge('#RDELeads'),
                      hashtagBadge('#RiseCAPSURISECapiz'),
                      hashtagBadge('#ThinkNEXT')
                    ]
                  })
                ]
              }),
              // Form
              $({
                tag: 'form',
                style: { flex: '2 1 400px', background: 'var(--white)', padding: '40px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' },
                child: [
                  strictInput('text', 'Your Name', /^[a-zA-Z\s.'-]+$/),
                  strictInput('email', 'Your Email', /^[a-zA-Z0-9@.]+$/),
                  strictInput('text', 'Subject', /^[a-zA-Z0-9\s.,!?'-]+$/),
                  $({
                    tag: 'textarea',
                    att: { placeholder: 'Message', rows: 5 },
                    style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' },
                    event: { type: 'focus', method: (e) => e.target.style.borderColor = 'var(--primary-blue)' },
                    event2: { type: 'blur', method: (e) => e.target.style.borderColor = '#e2e8f0' },
                    event3: { 
                      type: 'keydown', 
                      method: (e) => {
                        const forbiddenChars = /[<>'"();*%\\-]/; 
                        if (forbiddenChars.test(e.key)) {
                          e.preventDefault();
                          alert('Special characters ( < > " \' ; ( ) * % \\ - ) are not allowed for security reasons.');
                        }
                      }
                    }
                  }),
                  $({
                    tag: 'button',
                    text: 'Send Message',
                    style: { width: '100%', padding: '14px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', transition: 'var(--transition)' },
                    event: {
                      type: 'click',
                      method: (e) => { e.preventDefault(); alert('Mock submission: Message sent successfully!'); }
                    }
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};

const contactItem = (icon, text) => $({
  tag: 'div',
  style: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  child: [
    $({ tag: 'i', att: { className: icon }, style: { fontSize: '1.2rem', color: 'var(--accent-orange)', width: '24px' } }),
    $({ tag: 'span', text: text, style: { color: 'var(--text-gray)' } })
  ]
});

const socialIcon = (platform, color) => {
  return $({
    tag: 'a',
    att: { 
      href: '#', 
      className: `fa-brands fa-${platform}`,
      'aria-label': platform
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      color: color,
      fontSize: '1.2rem',
      borderRadius: '50%',
      backgroundColor: '#f8fafc',
      border: '1px solid #e8ecf0',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    event: {
      type: 'mouseenter',
      method: (e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.backgroundColor = color;
        e.target.style.color = '#ffffff';
        e.target.style.borderColor = color;
        e.target.style.boxShadow = `0 4px 12px ${color}33`;
      }
    },
    event2: {
      type: 'mouseleave',
      method: (e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = '#f8fafc';
        e.target.style.color = color;
        e.target.style.borderColor = '#e8ecf0';
        e.target.style.boxShadow = 'none';
      }
    }
  });
};


const hashtagBadge = (tag) => {
  return $({
    tag: 'span',
    text: tag,
    style: {
      display: 'inline-block',
      padding: '6px 16px',
      backgroundColor: '#eef2ff',
      color: 'var(--primary-blue)',
      fontWeight: '600',
      fontSize: '0.85rem',
      borderRadius: '50px',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'default',
      boxShadow: '0 2px 8px rgba(2, 101, 211, 0.08)',
      border: '1px solid rgba(2, 101, 211, 0.1)'
    },
    event: {
      type: 'mouseenter',
      method: (e) => {
        e.target.style.transform = 'scale(1.08)';
        e.target.style.backgroundColor = 'var(--primary-blue)';
        e.target.style.color = '#ffffff';
        e.target.style.boxShadow = '0 4px 14px rgba(2, 101, 211, 0.25)';
      }
    },
    event2: {
      type: 'mouseleave',
      method: (e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.backgroundColor = '#eef2ff';
        e.target.style.color = 'var(--primary-blue)';
        e.target.style.boxShadow = '0 2px 8px rgba(2, 101, 211, 0.08)';
      }
    }
  });
};

const strictInput = (type, placeholder, allowedRegex) => {
  return $({
    tag: 'input',
    att: { type: type, placeholder: placeholder, required: true },
    style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' },
    event: { 
      type: 'focus', 
      method: (e) => e.target.style.borderColor = 'var(--primary-blue)' 
    },
    event2: { 
      type: 'blur', 
      method: (e) => e.target.style.borderColor = '#e2e8f0' 
    },
    event3: { 
      type: 'keydown', 
      method: (e) => {
        const key = e.key;
        if (type === 'email') {
          if (!/^[a-zA-Z0-9@.]$/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
            e.preventDefault();
            alert('Email can only contain letters, numbers, @, and dots.');
          }
        } else {
          if (!allowedRegex.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
            e.preventDefault();
            alert('Special characters are not allowed in this field.');
          }
        }
      }
    },
    event4: {
      type: 'paste',
      method: (e) => {
        e.preventDefault();
        alert('Pasting is not allowed for security reasons. Please type manually.');
      }
    }
  });
};
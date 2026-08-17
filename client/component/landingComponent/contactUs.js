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
                  contactItem('fa-solid fa-location-dot', 'Roxas City Main Campus, Capiz State University'),
                  contactItem('fa-solid fa-envelope', 'rdeoffice@capsu.edu.ph'),
                  contactItem('fa-solid fa-phone', '(+63) 36 123 4567'),
                  $({ 
                    tag: 'div', 
                    style: { marginTop: '20px' }, 
                    child: [
                      $({ tag: 'span', text: 'Follow us:' }),
                      ...['facebook', 'twitter', 'youtube'].map(s => 
                        $({ tag: 'a', att: { href: '#', className: `fa-brands fa-${s}` }, style: { margin: '0 10px', fontSize: '1.2rem', color: 'var(--primary-navy)' } })
                      )
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
                  // 4. Textarea (Fixed with `keydown` and proper blocking)
                  $({
                    tag: 'textarea',
                    att: { placeholder: 'Message', rows: 5 },
                    style: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', fontFamily: 'inherit', fontSize: '1rem', outline: 'none' },
                    event: { type: 'focus', method: (e) => e.target.style.borderColor = 'var(--primary-blue)' },
                    event2: { type: 'blur', method: (e) => e.target.style.borderColor = '#e2e8f0' },
                    event3: { 
                      type: 'keydown', 
                      method: (e) => {
                        // Disallow `<`, `>`, `"`, `'`, `(`, `)`, `;`, `-`, `*`, `%`
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

// ==========================================
// FIXED STRICT INPUT VALIDATION
// ==========================================
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
      type: 'keydown',  // <--- Changed from keypress to keydown!
      method: (e) => {
        const key = e.key;
        // Special block for the Email field: ONLY allow @ and .
        if (type === 'email') {
          // Allow letters, numbers, @, ., and Backspace/Delete
          if (!/^[a-zA-Z0-9@.]$/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
            e.preventDefault();
            alert('Email can only contain letters, numbers, @, and dots.');
          }
        } else {
          // For Name and Subject
          if (!allowedRegex.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
            e.preventDefault();
            alert('Special characters are not allowed in this field.');
          }
        }
      }
    },
    // Block pasting entirely
    event4: {
      type: 'paste',
      method: (e) => {
        e.preventDefault();
        alert('Pasting is not allowed for security reasons. Please type manually.');
      }
    }
  });
};
import { $ } from '../../lib/lib.js';

export const VpMessage = () => {
  return $({
    tag: 'section',
    att: { id: 'about-us', className: 'vp-message' },
    style: { padding: '80px 0', backgroundColor: 'var(--white)' },
    child: [
      $({
        tag: 'div',
        att: { className: 'container' },
        style: { display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center', justifyContent: 'center' },
        child: [
          // VP Image
          $({
            tag: 'div',
            style: {
              flex: '0 1 320px',
              maxWidth: '400px',
              height: 'auto',
              aspectRatio: '3/4', 
              backgroundImage: 'url("/client/images/Vp_RDE.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center 25%', 
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              backgroundColor: '#f8f9fa'
            }
          }),
          // Quote Block
          $({
            tag: 'div',
            style: { flex: '1 1 400px', position: 'relative' },
            child: [
              $({
                tag: 'span',
                text: '"',
                style: { fontSize: '6rem', color: 'var(--primary-blue)', opacity: 0.2, position: 'absolute', top: '-30px', left: '-20px', fontFamily: 'serif' }
              }),
              $({
                tag: 'blockquote',
                text: 'Research is a contribution to human knowledge. Knowledge is social; society is the only institution that makes our academic work useful. - Biclar 2022',
                style: { fontSize: '1.5rem', fontWeight: '500', lineHeight: '1.6', color: 'var(--text-dark)', marginBottom: '20px', position: 'relative', zIndex: 1 }
              }),
              $({
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                child: [
                  $({ tag: 'strong', text: 'Dr. Leo Andrew B. Biclar', style: { fontSize: '1.1rem', color: 'var(--primary-navy)' } }),
                  $({ tag: 'span', text: 'Vice President for Research, Development & Extension', style: { color: 'var(--text-gray)' } })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};
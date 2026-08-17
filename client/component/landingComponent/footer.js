import { $ } from '../../lib/lib.js';

export const Footer = () => {
    let footerEl = null;

    // The Floating CTA Button HTML
    const createFloatingCta = () => {
        return $({
            tag: 'div',
            att: { id: 'landing-cta-btn' },
            style: {
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                background: 'var(--primary-blue)',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: '50px',
                boxShadow: '0 10px 40px rgba(2, 101, 211, 0.4)',
                fontWeight: '700',
                fontSize: '1.1rem',
                cursor: 'pointer',
                zIndex: '9999',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transform: 'translateY(100px) scale(0.8)',
                opacity: '0',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontFamily: 'Inter, Segoe UI, sans-serif'
            },
            child: [
                $({ tag: 'span', text: '🚀 Login / Sign Up' })
            ],
            event: {
                type: 'click',
                method: () => {
                    // Navigate directly to the Login page
                    window.location.assign('/account/Login?');
                }
            }
        });
    };

    // Intersection Observer to trigger the button animation
    const attachObserver = (footerEl) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const btn = document.getElementById('landing-cta-btn');
                if (entry.isIntersecting && btn) {
                    btn.style.transform = 'translateY(0) scale(1)';
                    btn.style.opacity = '1';
                } else if (btn) {
                    // Optional: Hide if user scrolls back up
                    btn.style.transform = 'translateY(100px) scale(0.8)';
                    btn.style.opacity = '0';
                }
            });
        }, { threshold: 0.5 }); // Triggers when 50% of footer is visible

        if (footerEl) observer.observe(footerEl);
    };

    // Main Footer UI
    const footerUI = $({
        tag: 'footer',
        style: { background: 'var(--primary-navy)', color: 'white', padding: '40px 0 20px', position: 'relative' },
        elementHandler: (el) => {
            footerEl = el;
            // Append the floating button to the body so it sits on top of everything
            document.body.appendChild(createFloatingCta());
            setTimeout(() => attachObserver(footerEl), 100);
        },
        child: [
            $({
                tag: 'div',
                att: { className: 'container' },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '30px' },
                        child: [
                            // ==========================================
                            // COLUMN 1: UPDATED CONTACT DETAILS
                            // ==========================================
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h4', text: 'CAPSU RDE Office', style: { marginBottom: '15px' } }),
                                    // Updated address
                                    $({ tag: 'p', text: 'Fuentes Drive Roxas City, Roxas City Main Campus, Capiz State University', style: { fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.8' } }),
                                    // Updated email and phone
                                    $({ tag: 'p', text: 'rde@capsu.edu.ph | (036) 522 9756', style: { fontSize: '0.9rem', opacity: 0.8 } })
                                ]
                            }),
                            // ==========================================
                            // COLUMN 2: QUICK LINKS
                            // ==========================================
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h4', text: 'Quick Links', style: { marginBottom: '15px' } }),
                                    ...['Home', 'About Us', 'Events', 'Contact'].map(l => $({ tag: 'a', att: { href: `#${l.toLowerCase().replace(' ', '-')}` }, text: l, style: { display: 'block', color: 'white', opacity: 0.8, textDecoration: 'none', marginBottom: '8px', transition: 'var(--transition)' }, event: { type: 'mouseenter', method: (e) => e.target.style.opacity = '1' }, event2: { type: 'mouseleave', method: (e) => e.target.style.opacity = '0.8' } }))
                                ]
                            }),
                            // ==========================================
                            // COLUMN 3: UPDATED FOLLOW US WITH BRAND COLORS
                            // ==========================================
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h4', text: 'Follow Us', style: { marginBottom: '15px' } }),
                                    $({
                                        tag: 'div',
                                        style: { display: 'flex', gap: '15px' },
                                        child: [
                                            socialIconFooter('facebook', '#1877F2'),
                                            socialIconFooter('x-twitter', '#000000'), // Changed to X
                                            socialIconFooter('instagram', '#E1306C')
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem', opacity: 0.7 },
                        text: '© 2026 Capiz State University - Research, Development & Extension Office. All rights reserved.'
                    })
                ]
            })
        ]
    });

    return footerUI;
};

// ==========================================
// FOOTER SOCIAL MEDIA ICON HELPER
// ==========================================
const socialIconFooter = (platform, color) => {
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
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
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
                e.target.style.boxShadow = `0 4px 12px ${color}66`;
            }
        },
        event2: {
            type: 'mouseleave',
            method: (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = color;
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
            }
        }
    });
};
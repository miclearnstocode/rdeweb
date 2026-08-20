import { $ } from '../../lib/lib.js';

export const Footer = () => {
    let footerEl = null;
    let floatingCtaEl = null;

    // The Floating CTA Button HTML - Modern & Premium Design
    const createFloatingCta = () => {
        floatingCtaEl = $({
            tag: 'div',
            att: { id: 'floating-cta' },
            style: {
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: '9999',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, var(--primary-blue) 0%, #0047a3 100%)',
                color: '#fff',
                padding: '16px 28px',
                borderRadius: '50px',
                boxShadow: '0 8px 32px rgba(2, 101, 211, 0.45), 0 0 0 1px rgba(255,255,255,0.1) inset',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                transform: 'translateY(120px) scale(0.85)',
                opacity: '0',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                fontFamily: '"Inter", "Segoe UI", sans-serif',
                letterSpacing: '0.3px',
                userSelect: 'none',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
            },
            child: [
                // Icon
                $({
                    tag: 'span',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                    },
                    html: '🔐'
                }),
                // Text
                $({
                    tag: 'span',
                    text: 'Login / Sign Up',
                    style: {
                        whiteSpace: 'nowrap'
                    }
                }),
                // Arrow indicator
                $({
                    tag: 'span',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1rem',
                        transition: 'transform 0.3s ease'
                    },
                    html: '→'
                })
            ],
            event: {
                type: 'click',
                method: () => {
                    window.location.assign('/account/Login?');
                }
            },
            event2: {
                type: 'mouseenter',
                method: (e) => {
                    const arrow = e.currentTarget.querySelector('span:last-child');
                    if (arrow) arrow.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(2, 101, 211, 0.55), 0 0 0 2px rgba(255,255,255,0.15) inset';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }
            },
            event3: {
                type: 'mouseleave',
                method: (e) => {
                    const arrow = e.currentTarget.querySelector('span:last-child');
                    if (arrow) arrow.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(2, 101, 211, 0.45), 0 0 0 1px rgba(255,255,255,0.1) inset';
                    e.currentTarget.style.transform = 'scale(1)';
                }
            }
        });

        // Add pulse animation ring
        const pulseRing = $({
            tag: 'div',
            style: {
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50px',
                border: '2px solid var(--primary-blue)',
                opacity: '0',
                animation: 'ctaPulse 2s ease-out infinite',
                pointerEvents: 'none'
            }
        });
        floatingCtaEl.prepend(pulseRing);

        // Inject keyframes for pulse animation
        if (!document.getElementById('cta-pulse-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'cta-pulse-styles';
            styleEl.textContent = `
                @keyframes ctaPulse {
                    0% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }
                @keyframes ctaFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `;
            document.head.appendChild(styleEl);
        }

        return floatingCtaEl;
    };

    // Intersection Observer to trigger the button animation
    const attachObserver = (footerEl) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const btn = document.getElementById('floating-cta');
                if (!btn) return;

                if (entry.isIntersecting) {
                    // Footer is visible - show CTA with animation
                    btn.style.transform = 'translateY(0) scale(1)';
                    btn.style.opacity = '1';
                    btn.style.animation = 'ctaFloat 3s ease-in-out infinite';
                } else if (entry.boundingClientRect.top < 0) {
                    // User has scrolled past footer - keep visible
                    btn.style.transform = 'translateY(0) scale(1)';
                    btn.style.opacity = '1';
                } else {
                    // User scrolled up - show CTA
                    btn.style.transform = 'translateY(0) scale(1)';
                    btn.style.opacity = '1';
                }
            });
        }, { 
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        if (footerEl) observer.observe(footerEl);
    };

    // Function to show CTA immediately on page load
    const showCtaImmediately = () => {
        const btn = document.getElementById('floating-cta');
        if (btn) {
            setTimeout(() => {
                btn.style.transform = 'translateY(0) scale(1)';
                btn.style.opacity = '1';
                btn.style.animation = 'ctaFloat 3s ease-in-out infinite';
            }, 500);
        }
    };

    // Main Footer UI
    const footerUI = $({
        tag: 'footer',
        style: { 
            background: 'var(--primary-navy)', 
            color: 'white', 
            padding: '40px 0 20px', 
            position: 'relative' 
        },
        elementHandler: (el) => {
            footerEl = el;
            // Append the floating button to the body
            document.body.appendChild(createFloatingCta());
            
            // Show CTA immediately on page load (don't wait for footer)
            showCtaImmediately();
            
            // Also observe footer for additional animation triggers
            setTimeout(() => attachObserver(footerEl), 100);
        },
        child: [
            $({
                tag: 'div',
                att: { className: 'container' },
                child: [
                    $({
                        tag: 'div',
                        style: { 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '40px', 
                            marginBottom: '30px' 
                        },
                        child: [
                            // COLUMN 1: UPDATED CONTACT DETAILS
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h4', text: 'CAPSU RDE Office', style: { marginBottom: '15px', fontFamily: '"Plus Jakarta Sans", sans-serif' } }),
                                    $({ tag: 'p', text: 'Fuentes Drive Roxas City, Roxas City Main Campus, Capiz State University', style: { fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.8' } }),
                                    $({ tag: 'p', text: 'rde@capsu.edu.ph | (036) 522 9756', style: { fontSize: '0.9rem', opacity: 0.8 } })
                                ]
                            }),
                            // COLUMN 2: QUICK LINKS
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h4', text: 'Quick Links', style: { marginBottom: '15px', fontFamily: '"Plus Jakarta Sans", sans-serif' } }),
                                    ...['Home', 'About Us', 'Events', 'Contact'].map(l => $({ 
                                        tag: 'a', 
                                        att: { href: `#${l.toLowerCase().replace(' ', '-')}` }, 
                                        text: l, 
                                        style: { 
                                            display: 'block', 
                                            color: 'white', 
                                            opacity: 0.8, 
                                            textDecoration: 'none', 
                                            marginBottom: '8px', 
                                            transition: 'var(--transition)' 
                                        }, 
                                        event: { 
                                            type: 'mouseenter', 
                                            method: (e) => e.target.style.opacity = '1' 
                                        }, 
                                        event2: { 
                                            type: 'mouseleave', 
                                            method: (e) => e.target.style.opacity = '0.8' 
                                        } 
                                    }))
                                ]
                            }),
                            // COLUMN 3: UPDATED FOLLOW US WITH BRAND COLORS
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h4', text: 'Follow Us', style: { marginBottom: '15px', fontFamily: '"Plus Jakarta Sans", sans-serif' } }),
                                    $({
                                        tag: 'div',
                                        style: { display: 'flex', gap: '15px' },
                                        child: [
                                            socialIconFooter('facebook', '#1877F2'),
                                            socialIconFooter('x-twitter', '#000000'),
                                            socialIconFooter('instagram', '#E1306C'),
                                            socialIconFooter('youtube', '#FF0000')
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

// FOOTER SOCIAL MEDIA ICON HELPER
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
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        },
        event: {
            type: 'mouseenter',
            method: (e) => {
                e.target.style.transform = 'scale(1.15)';
                e.target.style.backgroundColor = color;
                e.target.style.color = '#ffffff';
                e.target.style.borderColor = color;
                e.target.style.boxShadow = `0 4px 16px ${color}66`;
            }
        },
        event2: {
            type: 'mouseleave',
            method: (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.target.style.color = color;
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
            }
        }
    });
};
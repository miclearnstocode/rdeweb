import { $ } from '../lib/lib.js';


const ensureSplashStyles = () => {
    if (document.getElementById('splash-screen-styles')) return;

    const styleTag = document.createElement('style');
    styleTag.id = 'splash-screen-styles';
    styleTag.textContent = `
        @keyframes splashRingPulse {
            0%   { transform: scale(0.9);  opacity: 0.55; }
            50%  { transform: scale(1.08); opacity: 0.15; }
            100% { transform: scale(0.9);  opacity: 0.55; }
        }
        @keyframes splashLogoPop {
            0%   { opacity: 0; transform: translateY(16px) scale(0.85); }
            60%  { opacity: 1; transform: translateY(-4px) scale(1.03); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splashDotBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
            40% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(styleTag);
};

export const SplashScreen = (onComplete) => {
    ensureSplashStyles();

    const imagePath = `${window.location.origin}/client/images/rde_logo.png`;

    const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

    const animate = () => {
        const splashWrapper = document.getElementById('splash-screen-root');
        const logoWrapper = document.getElementById('splash-logo-wrapper');
        const glowRing = document.getElementById('splash-glow-ring');
        const rdeText = document.getElementById('splash-rde-text');
        const subtitle = document.getElementById('splash-subtitle');
        const dots = document.getElementById('splash-loading-dots');

        if (!splashWrapper || !logoWrapper || !rdeText) return;

        logoWrapper.style.animation = 'splashLogoPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        if (glowRing) glowRing.style.opacity = '1';

        setTimeout(() => {
            rdeText.style.opacity = '1';
            rdeText.style.transform = 'translateY(0)';
        }, 1100);

        setTimeout(() => {
            if (subtitle) {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }
        }, 1500);

        setTimeout(() => {
            if (dots) dots.style.opacity = '1';
        }, 1900);

        setTimeout(() => {
            if (dots) dots.style.opacity = '0';
        }, 2900);

        setTimeout(() => {
            splashWrapper.style.transform = 'translateY(100%)';
        }, 3100);

        setTimeout(() => {
            if (splashWrapper.parentNode) {
                splashWrapper.parentNode.removeChild(splashWrapper);
            }
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, 3900);
    };

    const splashElement = $({
        tag: 'div',
        att: { id: 'splash-screen-root' },
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100vh',
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at 50% 45%, #f7fafc 0%, #ffffff 65%)',
            zIndex: '99999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `transform 0.8s ${EASE}`,
            transform: 'translateY(0)'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                },
                child: [
                    $({
                        tag: 'div',
                        att: { id: 'splash-logo-wrapper' },
                        style: {
                            position: 'relative',
                            opacity: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '220px',
                            height: '220px',
                            marginBottom: '4px'
                        },
                        child: [
                            // Soft pulsing glow ring behind the seal
                            $({
                                tag: 'div',
                                att: { id: 'splash-glow-ring' },
                                style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '248px',
                                    height: '248px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(2,101,211,0.16) 0%, rgba(2,101,211,0) 72%)',
                                    opacity: '0',
                                    transition: 'opacity 0.5s ease',
                                    animation: 'splashRingPulse 2.6s ease-in-out infinite',
                                    zIndex: '0'
                                }
                            }),
                            $({
                                tag: 'img',
                                att: {
                                    id: 'splash-logo-img',
                                    src: imagePath,
                                    alt: 'RDE Logo'
                                },
                                style: {
                                    position: 'relative',
                                    zIndex: '1',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 10px 24px rgba(2, 101, 211, 0.18))'
                                },
                                event: {
                                    type: 'error',
                                    method: (e) => {
                                        e.target.style.display = 'none';
                                        const fallback = document.getElementById('splash-logo-fallback');
                                        if (fallback) fallback.style.display = 'flex';
                                    }
                                }
                            }),
                            // Fallback text if logo image fails to load
                            $({
                                tag: 'div',
                                att: { id: 'splash-logo-fallback' },
                                style: {
                                    display: 'none',
                                    position: 'absolute',
                                    zIndex: '1',
                                    width: '190px',
                                    height: '190px',
                                    top: '15px',
                                    left: '15px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f8f9fa',
                                    border: '2px solid #e8ecf0',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                                    fontWeight: '800',
                                    fontSize: '40px',
                                    color: '#0265D3'
                                },
                                text: 'RDE Portal'
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { id: 'splash-rde-text' },
                        style: {
                            transition: `all 0.7s ${EASE}`,
                            opacity: '0',
                            transform: 'translateY(20px)',
                            fontFamily: '"Inter", "Segoe UI", sans-serif',
                            fontWeight: '800',
                            fontSize: '56px',
                            letterSpacing: '-1px',
                            lineHeight: '1',
                            color: '#1a2a3a',
                            textAlign: 'center'
                        },
                        text: 'RDE Portal'
                    }),
                    $({
                        tag: 'div',
                        att: { id: 'splash-subtitle' },
                        style: {
                            opacity: '0',
                            transform: 'translateY(16px)',
                            transition: `all 0.6s ${EASE}`,
                            fontFamily: '"Inter", "Segoe UI", sans-serif',
                            fontWeight: '500',
                            fontSize: '14px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            color: '#6c8299',
                            textAlign: 'center'
                        },
                        text: 'Research Development & Extension'
                    }),
                    $({
                        tag: 'div',
                        att: { id: 'splash-loading-dots' },
                        style: {
                            display: 'flex',
                            gap: '6px',
                            marginTop: '14px',
                            opacity: '0',
                            transition: 'opacity 0.3s ease'
                        },
                        child: [0, 1, 2].map((i) =>
                            $({
                                tag: 'span',
                                style: {
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: '#0265D3',
                                    animation: `splashDotBounce 1.1s ease-in-out ${i * 0.15}s infinite`
                                }
                            })
                        )
                    })
                ]
            })
        ]
    });

    setTimeout(animate, 2000);

    return splashElement;
};
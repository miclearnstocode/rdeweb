import { $ } from '../../lib/lib.js';

const centers = [
  { 
    label: 'Crop Science Research & Development Center (CSRDC)', 
    value: 'CSRDC', 
    icon: '🌱',
    tagline: 'Advancing crop productivity and sustainable agriculture.',
    image: '/client/images/centerLogo/CSRDC.png'
  },
  { 
    label: 'Livestock Research & Development Center (LRDC)', 
    value: 'LRDC', 
    icon: '🐄',
    tagline: 'Improving livestock health, genetics, and production systems.',
    image: '/client/images/centerLogo/LRDC.png'
  },
  { 
    label: 'Fisheries Research & Development Center (FRDC)', 
    value: 'FRDC', 
    icon: '🐟',
    tagline: 'Sustainable fisheries and aquatic resource management.',
    image: '/client/images/centerLogo/FRDC.png'
  },
  { 
    label: 'Food and Industrial Technology Research & Development Center (FITRDC)', 
    value: 'FITRDC', 
    icon: '🏭',
    tagline: 'Innovating food safety, processing, and industrial technologies.',
    image: '/client/images/centerLogo/FITRDC.png'
  },
  { 
    label: 'Social Science Research & Development Center (SSRDC)', 
    value: 'SSRDC', 
    icon: '👥',
    tagline: 'Studying social dynamics, governance, and community development.',
    image: '/client/images/centerLogo/SSRDC.png'
  },
  { 
    label: 'Machinery and Agricultural Technology Engineering Center (MATEC)', 
    value: 'MATEC', 
    icon: '⚙️',
    tagline: 'Engineering solutions for agricultural mechanization and efficiency.',
    image: '/client/images/centerLogo/MATEC.png'
  },
  { 
    label: 'Coconut Research and Development Center (Coco RDC)', 
    value: 'Coco RDC', 
    icon: '🥥',
    tagline: 'Maximizing the value of the coconut industry through R&D.',
    image: '/client/images/centerLogo/CocoRDC.png'
  }
];

export const RdeCenters = () => {
  let currentIndex = 0;
  let autoSlideInterval = null;
  let isHovering = false;
  let trackEl = null;
  let dotsContainer = null;

  const AUTO_SLIDE_MS = 4000;

  const getVisibleCount = () => {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const updateTrackWidth = () => {
    if (!trackEl) return;
    const visible = getVisibleCount();
    trackEl.style.width = `${(centers.length / visible) * 100}%`;
  };

  const slideTo = (index, animate = true) => {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, centers.length - visible);

    // Wrap around for infinite loop
    if (index > maxIndex) index = 0;
    if (index < 0) index = maxIndex;

    currentIndex = index;

    if (trackEl) {
      trackEl.style.transition = animate
        ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      const slideWidth = 100 / centers.length;
      trackEl.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
    }

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.style.backgroundColor = 'var(--primary-blue)';
          dot.style.opacity = '1';
        } else {
          dot.style.backgroundColor = '#d1d5db';
          dot.style.opacity = '0.5';
        }
      });
    }
  };

  const nextSlide = () => {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, centers.length - visible);
    if (currentIndex >= maxIndex) {
      slideTo(0);
    } else {
      slideTo(currentIndex + 1);
    }
  };

  const startAutoSlide = () => {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      if (!isHovering) nextSlide();
    }, AUTO_SLIDE_MS);
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  };

  const carouselContainer = $({
    tag: 'div',
    att: { className: 'rde-carousel-wrapper' },
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      overflow: 'hidden',
      padding: '10px 0'
    }
  });

  const track = $({
    tag: 'div',
    style: {
      display: 'flex',
      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      width: `${centers.length * 100}%` // recalculated properly in updateTrackWidth()
    },
    elementHandler: (el) => { trackEl = el; },
    event: {
      type: 'mouseenter',
      method: () => { isHovering = true; }
    },
    event2: {
      type: 'mouseleave',
      method: () => { isHovering = false; }
    },

    event3: {
      type: 'touchstart',
      method: () => { isHovering = true; }
    },
    event4: {
      type: 'touchend',
      method: () => { isHovering = false; }
    }
  });

  // Create cards
  const itemWidthPct = 100 / centers.length;
  
  centers.forEach((center) => {
    const card = $({
      tag: 'div',
      style: {
        width: `${itemWidthPct}%`,
        padding: '10px',
        boxSizing: 'border-box',
        flexShrink: 0
      },
      child: [
        $({
          tag: 'div',
          style: { 
            background: 'var(--light-bg)', 
            borderRadius: 'var(--radius)', 
            padding: '30px 20px', 
            textAlign: 'center', 
            boxShadow: 'var(--shadow)', 
            transition: 'var(--transition)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px'
          },
          child: [
            $({ 
              tag: 'div', 
              style: { 
                width: '100px', 
                height: '100px', 
                margin: '0 auto 20px', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                backgroundColor: '#f0f4f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }, 
              child: [
                $({ 
                  tag: 'img', 
                  att: { src: center.image, alt: center.label }, 
                  style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' },
                  event: {
                    type: 'error',
                    method: (e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.center-icon-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }
                  }
                }),
                $({ 
                  tag: 'span', 
                  text: center.icon,
                  att: { className: 'center-icon-fallback' },
                  style: { 
                    position: 'absolute',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem'
                  } 
                })
              ]
            }),
            $({ tag: 'h4', text: center.label, style: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-dark)' } }),
            $({ tag: 'p', text: center.tagline, style: { fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: '1.5' } })
          ]
        })
      ]
    });
    track.appendChild(card);
  });

  carouselContainer.appendChild(track);

  // Dots
  const dotsWrapper = $({
    tag: 'div',
    style: { 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '8px', 
      marginTop: '25px',
      position: 'relative'
    },
    elementHandler: (el) => { dotsContainer = el; }
  });

  const buildDot = (i, activeIndex) => $({
    tag: 'button',
    att: { className: 'carousel-dot' },
    style: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      backgroundColor: i === activeIndex ? 'var(--primary-blue)' : '#d1d5db',
      opacity: i === activeIndex ? '1' : '0.5',
      transition: 'all 0.2s ease'
    },
    event: {
      type: 'click',
      method: () => {
        stopAutoSlide();
        slideTo(i);
        startAutoSlide();
      }
    }
  });

  // Create dots (only for the number of "pages")
  const visibleCount = getVisibleCount();
  const dotCount = Math.max(1, centers.length - visibleCount + 1);
  
  for (let i = 0; i < dotCount; i++) {
    dotsWrapper.appendChild(buildDot(i, 0));
  }

  carouselContainer.appendChild(dotsWrapper);

  const section = $({
    tag: 'section',
    att: { id: 'centers' },
    style: { padding: '80px 0', backgroundColor: 'var(--white)' },
    child: [
      $({
        tag: 'div',
        att: { className: 'container' },
        child: [
          $({
            tag: 'div',
            att: { className: 'section-header' },
            child: [
              $({ tag: 'h2', text: 'RDE Centers', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'Specialized centers driving research and extension', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          carouselContainer
        ]
      })
    ]
  });

  let resizeTimeout = null;

  const handleResize = () => {
    const visible = getVisibleCount();
    const newDotCount = Math.max(1, centers.length - visible + 1);

    // Rebuild dots if the page count changed
    if (dotsContainer && dotsContainer.children.length !== newDotCount) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < newDotCount; i++) {
        dotsContainer.appendChild(buildDot(i, Math.min(currentIndex, newDotCount - 1)));
      }
    }

    updateTrackWidth();
    // Snap (no animation) so the layout change doesn't produce a visible glitch
    slideTo(Math.min(currentIndex, Math.max(0, centers.length - visible)), false);
  };

  const onResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  };

  // Start the machine
  setTimeout(() => {
    updateTrackWidth();
    slideTo(0, false);
    startAutoSlide();
    window.addEventListener('resize', onResize);
  }, 100);

  const onVisibilityChange = () => {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Cleanup (optional, helps with Hot Reload)
  const origUnload = section.onunload;
  section.onunload = () => {
    stopAutoSlide();
    clearTimeout(resizeTimeout);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (origUnload) origUnload();
  };

  return section;
};
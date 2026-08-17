import { $ } from '../../lib/lib.js';

// Array of your image paths. Update these to match your actual filenames.
const slides = [
  { src: '/client/images/roadmap/roadmap.png', alt: 'RDE Roadmap 2026-2030' },
  { src: '/client/images/roadmap/strategic_pillars.png', alt: 'Strategic Pillars RISE' },
  { src: '/client/images/roadmap/niche_program.png', alt: 'Niche Program for Every Campus' },
  { src: '/client/images/roadmap/1st_trust.png', alt: 'RDE Thrusts SDG 1-6' },
  { src: '/client/images/roadmap/2nd_trust.png', alt: 'RDE Thrusts SDG 7-12' },
  { src: '/client/images/roadmap/3rd_trust.png', alt: 'RDE Thrusts SDG 13-17' }
];

export const RdeRoadmap = () => {
  const carouselId = 'rde-roadmap-carousel';
  let currentIndex = 0;
  let autoSlideInterval = null;
  let isHovering = false;
  let trackEl = null;
  let dotsWrapper = null;

  const getVisibleCount = () => (window.innerWidth < 640 ? 1 : 2);

  const updateTrackWidth = () => {
    if (!trackEl) return;
    const visible = getVisibleCount();
    trackEl.style.width = `${(slides.length / visible) * 100}%`;
  };

  const slideTo = (index, animate = true) => {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, slides.length - visible);

    // Wrap around for infinite loop
    if (index > maxIndex) index = 0;
    if (index < 0) index = maxIndex;
    currentIndex = index;

    if (trackEl) {
      trackEl.style.transition = animate
        ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'none';
      const slideWidth = 100 / slides.length;
      trackEl.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
    }

    // Update dots
    if (dotsWrapper) {
      const dots = dotsWrapper.querySelectorAll('.roadmap-dot');
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.style.backgroundColor = 'var(--primary-blue)';
          dot.style.opacity = '1';
          dot.style.transform = 'scale(1.2)';
        } else {
          dot.style.backgroundColor = '#d1d5db';
          dot.style.opacity = '0.5';
          dot.style.transform = 'scale(1)';
        }
      });
    }
  };

  const nextSlide = () => {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, slides.length - visible);
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
    }, 5000); // 5 seconds per slide
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  };

  const buildDot = (i, activeIndex) => $({
    tag: 'button',
    att: { className: 'roadmap-dot' },
    style: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      backgroundColor: i === activeIndex ? 'var(--primary-blue)' : '#d1d5db',
      opacity: i === activeIndex ? '1' : '0.5',
      transform: i === activeIndex ? 'scale(1.2)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
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

  const buildCarousel = () => {
    const track = $({
      tag: 'div',
      style: {
        display: 'flex',
        width: `${slides.length * 100}%`, // recalculated correctly in updateTrackWidth()
        transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
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

    // Create slide items
    slides.forEach((slide) => {
      const slideItem = $({
        tag: 'div',
        style: {
          width: `${100 / slides.length}%`,
          flexShrink: 0,
          padding: '0 10px',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center'
        },
        child: [
          $({
            tag: 'img',
            att: { src: slide.src, alt: slide.alt, loading: 'lazy' },
            style: {
              width: '100%',
              maxWidth: '1000px', // Ensures images don't stretch on huge monitors
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)'
            },
            event: {
              type: 'error',
              method: (e) => {
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.querySelector('.slide-fallback');
                if (fallback) fallback.style.display = 'flex';
              }
            }
          }),
          $({
            tag: 'div',
            att: { className: 'slide-fallback' },
            style: {
              display: 'none',
              width: '100%',
              maxWidth: '1000px',
              height: '400px',
              background: '#f0f4f8',
              borderRadius: 'var(--radius)',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: 'var(--text-gray)',
              textAlign: 'center',
              padding: '20px'
            },
            text: `Image not found: ${slide.alt}`
          })
        ]
      });
      track.appendChild(slideItem);
    });

    // Dots wrapper
    const dotsWrapperEl = $({
      tag: 'div',
      style: { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '25px' },
      elementHandler: (el) => { dotsWrapper = el; }
    });

    const visible = getVisibleCount();
    const dotCount = Math.max(1, slides.length - visible + 1);
    for (let i = 0; i < dotCount; i++) {
      dotsWrapperEl.appendChild(buildDot(i, 0));
    }

    return { track, dotsWrapperEl };
  };

  const { track, dotsWrapperEl } = buildCarousel();

  const section = $({
    tag: 'section',
    style: { 
      padding: '80px 0', 
      backgroundColor: 'var(--light-bg)',
      position: 'relative'
    },
    child: [
      $({
        tag: 'div',
        att: { className: 'container' },
        child: [
          $({
            tag: 'div',
            att: { className: 'section-header' },
            child: [
              $({ tag: 'h2', text: 'RDE Roadmap & Strategic Thrusts', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'Aligning with global sustainable development goals', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          $({
            tag: 'div',
            style: {
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--radius)',
              width: '100%'
            },
            child: [
              // Carousel Track Container
              $({ tag: 'div', att: { id: carouselId }, style: { overflow: 'hidden' }, child: [ track ] }),
              // Dots
              dotsWrapperEl
            ]
          })
        ]
      })
    ]
  });

  let resizeTimeout = null;

  const handleResize = () => {
    const visible = getVisibleCount();
    const newDotCount = Math.max(1, slides.length - visible + 1);

    if (dotsWrapper && dotsWrapper.children.length !== newDotCount) {
      dotsWrapper.innerHTML = '';
      for (let i = 0; i < newDotCount; i++) {
        dotsWrapper.appendChild(buildDot(i, Math.min(currentIndex, newDotCount - 1)));
      }
    }

    updateTrackWidth();
    // Snap (no animation) so the breakpoint change doesn't produce a visible glitch
    slideTo(Math.min(currentIndex, Math.max(0, slides.length - visible)), false);
  };

  const onResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  };

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
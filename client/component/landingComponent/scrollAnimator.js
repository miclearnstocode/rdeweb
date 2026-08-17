export const initScrollAnimations = () => {
    // Wait for DOM to be ready
    setTimeout(() => {
        const reveals = document.querySelectorAll('.reveal');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        // Optional: Stop observing after it animates to save performance
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15, // Trigger when 15% of element is visible
                rootMargin: '0px 0px -50px 0px'
            });

            reveals.forEach(el => observer.observe(el));
        } else {
            // Fallback for very old browsers: reveal everything immediately
            reveals.forEach(el => el.classList.add('active'));
        }
    }, 200);
};
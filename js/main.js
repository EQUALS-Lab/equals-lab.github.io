document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: this.name.value,
                email: this.email.value,
                subject: this.subject.value,
                message: this.message.value
            };

            // Here you would typically send the form data to a server
            console.log('Form submitted:', formData);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Clear form
            this.reset();
        });
    }

    // Smooth Scrolling for Internal Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation class to elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.highlight-card, .member-card, .project-card, .dataset-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('animate');
            }
        });
    };

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    
    // Initial check for elements in view
    animateOnScroll();

    // News embed modal handling
    const body = document.body;
    // create modal element
    const modal = document.createElement('div');
    modal.className = 'embed-modal';
    modal.innerHTML = `
        <div class="embed-box">
            <div class="embed-header">
                <div class="embed-title">Preview</div>
                <div>
                    <a class="embed-open" href="#" target="_blank" rel="noopener" style="margin-right:12px; color:#2563eb; text-decoration:none;">Open</a>
                    <button class="embed-close" aria-label="Close preview">✕</button>
                </div>
            </div>
            <iframe sandbox="allow-scripts allow-same-origin allow-forms" src="about:blank"></iframe>
        </div>
    `;
    body.appendChild(modal);

    const iframe = modal.querySelector('iframe');
    const embedOpen = modal.querySelector('.embed-open');
    const closeBtn = modal.querySelector('.embed-close');

    function openEmbed(url, sourceUrl, title) {
        // Use a simple embed transformer for Twitter via twitframe when needed
        let embedSrc = url || sourceUrl;
        // set frame src and open modal
        iframe.src = embedSrc;
        embedOpen.href = sourceUrl || url;
        modal.classList.add('open');
        // update title
        const titleEl = modal.querySelector('.embed-title');
        if (title) titleEl.textContent = title;
    }

    function closeEmbed() {
        modal.classList.remove('open');
        // reset iframe src to free resources
        iframe.src = 'about:blank';
    }

    // open when clicking view buttons
    document.querySelectorAll('.news-card .news-view').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.news-card');
            if (!card) return;
            const embedUrl = card.dataset.embedUrl;
            const sourceUrl = card.dataset.sourceUrl;
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : 'Preview';
            openEmbed(embedUrl, sourceUrl, title);
        });
    });

    // close modal
    closeBtn.addEventListener('click', closeEmbed);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeEmbed(); });

    // Shrink header on scroll
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 40) {
            header.classList.add('header-small');
        } else {
            header.classList.remove('header-small');
        }
        lastScrollY = window.scrollY;
    });

    // Dynamically render latest news from latest-news.json
    async function renderLatestNews() {
        const slider = document.querySelector('.news-slider');
        if (!slider) return;
        try {
            const res = await fetch('latest-news.json');
            if (!res.ok) throw new Error('Failed to load news');
            const newsList = await res.json();
            slider.innerHTML = '';
            // Determine visibleSlides for current screen
            let visibleSlides = 3;
            if (window.innerWidth <= 900) visibleSlides = 1;
            // Render each news as a slide (not grouped)
            newsList.forEach(news => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'news-slide-single';
                slideDiv.style.flex = '0 0 ' + (100 / visibleSlides) + '%';
                slideDiv.style.maxWidth = (100 / visibleSlides) + '%';
                slideDiv.innerHTML = `
                    <div class="news-card">
                        <img class="news-teaser" src="${news["Teaser Image"]}" alt="${news["Title"]} teaser">
                        <h3>${news["Title"]}</h3>
                        <p>${news["Description"]}</p>
                        <a class="news-open" href="${news["Link"]}" target="_blank" rel="noopener">Read More →</a>
                    </div>
                `;
                slider.appendChild(slideDiv);
            });
            window.initNewsCarousel && window.initNewsCarousel(newsList.length, visibleSlides);
        } catch (e) {
            slider.innerHTML = '<div style="padding:2rem;text-align:center;color:#888;">Could not load latest news.</div>';
        }
    }
    window.renderLatestNews = renderLatestNews;
    window.addEventListener('resize', renderLatestNews);
    renderLatestNews();

    // Carousel logic for sliding one at a time, always showing 3 (or 1 on mobile), simple and robust
    window.initNewsCarousel = function(totalSlides, visibleSlides) {
        const slider = document.querySelector('.news-slider');
        const slides = slider ? slider.querySelectorAll('.news-slide-single') : [];
        const leftArrow = document.querySelector('.news-arrow-left');
        const rightArrow = document.querySelector('.news-arrow-right');
        let slideIndex = 0;
        let interval;
        function showSlide(idx, animate = true) {
            if (animate) slider.style.transition = 'transform 0.7s cubic-bezier(.4,0,.2,1)';
            slider.style.transform = `translateX(-${idx * (100 / visibleSlides)}%)`;
            slideIndex = idx;
        }
        function nextSlide() {
            let nextIdx = slideIndex + 1;
            if (nextIdx > slides.length - visibleSlides) nextIdx = 0;
            showSlide(nextIdx);
        }
        function prevSlide() {
            let prevIdx = slideIndex - 1;
            if (prevIdx < 0) prevIdx = slides.length - visibleSlides;
            showSlide(prevIdx);
        }
        if (slider && slides.length > visibleSlides) {
            clearInterval(interval);
            interval = setInterval(nextSlide, 4000);
            if (leftArrow && rightArrow) {
                leftArrow.onclick = function() {
                    prevSlide();
                    clearInterval(interval);
                    interval = setInterval(nextSlide, 4000);
                };
                rightArrow.onclick = function() {
                    nextSlide();
                    clearInterval(interval);
                    interval = setInterval(nextSlide, 4000);
                };
            }
        }
        showSlide(slideIndex, false);
    };
});
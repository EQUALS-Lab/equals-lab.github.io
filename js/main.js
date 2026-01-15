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
});
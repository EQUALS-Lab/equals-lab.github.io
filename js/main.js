document.addEventListener('DOMContentLoaded', function () {
  // -----------------------------
  // ACTIVE NAV HIGHLIGHT
  // -----------------------------
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

  function clearActive() {
    navAnchors.forEach(a => a.classList.remove('active'));
  }

  function getFileName(pathname) {
    const p = (pathname || '').split('/').pop();
    return p && p.length ? p : 'index.html';
  }

  function setActiveNav() {
    clearActive();

    const currentFile = getFileName(window.location.pathname);
    const currentHash = window.location.hash || '';

    if (currentFile === 'index.html' && currentHash) {
      const hashLink = navAnchors.find(a => {
        const href = a.getAttribute('href') || '';
        return href === `index.html${currentHash}` || href === currentHash;
      });
      if (hashLink) {
        hashLink.classList.add('active');
        return;
      }
    }

    const pageLink = navAnchors.find(a => {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return false;

      try {
        const url = new URL(href, window.location.href);
        const linkFile = getFileName(url.pathname);
        const linkHash = url.hash || '';
        return linkFile === currentFile && !linkHash;
      } catch {
        return false;
      }
    });

    if (pageLink) {
      pageLink.classList.add('active');
      return;
    }

    const home = navAnchors.find(a => (a.getAttribute('data-nav') || '') === 'home');
    if (home) home.classList.add('active');
  }

  setActiveNav();
  window.addEventListener('hashchange', setActiveNav);

  // -----------------------------
  // Mobile Navigation Toggle
  // -----------------------------
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      document.body.classList.toggle('nav-open', navLinks.classList.contains('active'));
    });
  }

  // -----------------------------
  // Smooth Scrolling for Internal Links
  // -----------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // -----------------------------
  // Add animation class to elements when they come into view
  // -----------------------------
  const animateOnScroll = function () {
    const elements = document.querySelectorAll('.highlight-card, .member-card, .project-card, .dataset-card');

    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;

      if (elementTop < window.innerHeight && elementBottom > 0) {
        element.classList.add('animate');
      }
    });
  };

  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();

  // -----------------------------
  // News embed modal handling (kept)
  // -----------------------------
  const body = document.body;
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
    const embedSrc = url || sourceUrl;
    iframe.src = embedSrc;
    embedOpen.href = sourceUrl || url;
    modal.classList.add('open');
    const titleEl = modal.querySelector('.embed-title');
    if (title) titleEl.textContent = title;
  }

  function closeEmbed() {
    modal.classList.remove('open');
    iframe.src = 'about:blank';
  }

  closeBtn.addEventListener('click', closeEmbed);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeEmbed(); });

  // -----------------------------
  // Shrink header on scroll
  // -----------------------------
  const header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('header-small');
    else header.classList.remove('header-small');
  });

  // -----------------------------
  // Hero background carousel (home page)
  // -----------------------------
  const hero = document.querySelector('.hero[data-hero-images]');
  if (hero) {
    const rawImages = hero.getAttribute('data-hero-images') || '';
    const images = rawImages.split(',').map(s => s.trim()).filter(Boolean);
    const dotsWrap = hero.querySelector('.hero-dots');
    const prevBtn = hero.querySelector('.hero-control[data-direction="prev"]');
    const nextBtn = hero.querySelector('.hero-control[data-direction="next"]');
    let current = 0;
    let timerId = null;

    function setSlide(index) {
      if (!images.length) return;
      current = (index + images.length) % images.length;
      const imageUrl = images[current];
      hero.style.setProperty('--hero-image', `url('${imageUrl}')`);
      hero.style.backgroundImage = `linear-gradient(rgba(12, 22, 38, 0.45), rgba(12, 22, 38, 0.22)), url('${imageUrl}')`;
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, idx) => {
          dot.classList.toggle('active', idx === current);
          dot.setAttribute('aria-selected', idx === current ? 'true' : 'false');
        });
      }
    }

    function startAuto() {
      if (images.length < 2) return;
      timerId = window.setInterval(() => setSlide(current + 1), 6000);
    }

    function stopAuto() {
      if (timerId) window.clearInterval(timerId);
      timerId = null;
    }

    function restartAuto() {
      stopAuto();
      startAuto();
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      images.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          setSlide(idx);
          restartAuto();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        setSlide(current - 1);
        restartAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        setSlide(current + 1);
        restartAuto();
      });
    }

    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    hero.addEventListener('focusin', stopAuto);
    hero.addEventListener('focusout', startAuto);

    setSlide(0);
    startAuto();
  }

  // News/Announcements are now loaded via content-loader.js
});

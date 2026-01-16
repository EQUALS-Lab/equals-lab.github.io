// Unified Content Loader for EQUALS Lab Website
// This script loads JSON data and renders content dynamically

class ContentLoader {
  constructor() {
    this.dataCache = {};
  }

  async loadJSON(path) {
    if (this.dataCache[path]) {
      return this.dataCache[path];
    }
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      const data = await response.json();
      this.dataCache[path] = data;
      return data;
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      return null;
    }
  }

  // Load and render news/announcements
  async loadNews() {
    const data = await this.loadJSON('data/news.json');
    if (!data) return;

    const list = document.querySelector('.announcements-list');
    if (!list) return;

    list.innerHTML = data
      .map(item => `<li><span class="news-date">${item.date}:</span> ${item.text}</li>`)
      .join('');
  }

  // Load and render people (PhD, MS, Visitors)
  async loadPeople(type) {
    const data = await this.loadJSON('data/people.json');
    if (!data || !data[type]) return;

    const container = document.querySelector(`#${type === 'phd' ? 'phd-students' : type === 'ms' ? 'ms-students' : 'visitors'} .member-grid`);
    if (!container) return;

    const people = data[type];
    container.innerHTML = people.map(person => {
      if (type === 'phd' || type === 'ms') {
        const hasMaster = person.master && person.master.university !== '[University Name]';
        const masterText = hasMaster 
          ? `, and ${person.master.degree} from ${person.master.university} in ${person.master.year} respectively`
          : '';
        
        const desc = type === 'phd'
          ? `${person.name} (${person.period}) received ${person.bachelor.degree ? 'his' : 'her'} bachelor's degree in ${person.bachelor.degree} from ${person.bachelor.university}${person.bachelor.year !== '[Year]' ? ` in ${person.bachelor.year}` : ''}${masterText}. ${person.description} His research interests include ${person.research}.`
          : `${person.name} (${person.period}) received ${person.bachelor.degree ? 'his' : 'her'} bachelor's degree in ${person.bachelor.degree} from ${person.bachelor.university}${person.bachelor.year !== '[Year]' ? ` in ${person.bachelor.year}` : ''}. ${person.description} ${person.bachelor.degree ? 'His' : 'Her'} research interests include ${person.research}.`;

        return `
          <div class="member-card">
            <div class="member-image">
              <img src="${person.image}" alt="${person.name}">
            </div>
            <div class="member-info">
              <h3>${person.name}</h3>
              <p class="member-title">${type === 'phd' ? 'Ph.D. Student' : 'M.S. Student'}</p>
              <p class="member-desc">${desc}</p>
              <div class="member-links">
                <a href="${person.links.github}" aria-label="GitHub"><i class="fab fa-github"></i></a>
                <a href="${person.links.linkedin}" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                <a href="mailto:${person.links.email.replace('#', '')}" aria-label="Email"><i class="fas fa-envelope"></i></a>
              </div>
            </div>
          </div>
        `;
      } else {
        // Visitors
        return `
          <div class="member-card">
            <div class="member-image">
              <img src="${person.image}" alt="${person.name}">
            </div>
            <div class="member-info">
              <h3>${person.name}</h3>
              <p class="member-title">Visiting Scholar / Researcher</p>
              <p class="member-desc">
                ${person.name} (${person.period}) is a ${person.title} from ${person.institution}. ${person.description} ${person.title ? 'His' : 'Her'} research interests include ${person.research}. During ${person.title ? 'his' : 'her'} visit, ${person.title ? 'he' : 'she'} will be working on ${person.project}.
              </p>
              <div class="member-links">
                <a href="${person.links.website}" aria-label="Website"><i class="fas fa-globe"></i></a>
                <a href="${person.links.linkedin}" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                <a href="mailto:${person.links.email.replace('#', '')}" aria-label="Email"><i class="fas fa-envelope"></i></a>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  // Load and render publications
  async loadPublications() {
    const data = await this.loadJSON('data/publications.json');
    if (!data) return;

    const container = document.querySelector('.pub-container');
    if (!container) return;

    let html = '<h1>Publications</h1>';

    // Journals
    if (data.journals && data.journals.length > 0) {
      html += `
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #0b4b8a; margin: 2rem 0 1.5rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid rgba(11, 75, 138, 0.2);">
          <i class="fas fa-book" style="color: #3498db; margin-right: 0.5rem;"></i>
          Journal Publications
        </h2>
      `;

      data.journals.forEach(pub => {
        html += this.renderPublication(pub);
      });
    }

    // Conferences
    if (data.conferences && data.conferences.length > 0) {
      html += `
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #0b4b8a; margin: 3rem 0 1.5rem 0; padding-top: 2rem; padding-bottom: 0.5rem; border-top: 2px solid rgba(11, 75, 138, 0.1); border-bottom: 2px solid rgba(11, 75, 138, 0.2);">
          <i class="fas fa-users" style="color: #9b59b6; margin-right: 0.5rem;"></i>
          Conference Publications
        </h2>
      `;

      data.conferences.forEach(pub => {
        html += this.renderPublication(pub);
      });
    }

    container.innerHTML = html;
  }

  renderPublication(pub) {
    const links = pub.links.arxiv 
      ? `<a href="${pub.links.paper}">[Paper (PDF)]</a> <a href="${pub.links.arxiv}">[arXiv]</a>`
      : `<a href="${pub.links.paper}">[Paper (PDF)]</a>`;

    return `
      <div class="pub-row">
        <div class="pub-left"></div>
        <div class="pub-right">
          <a class="pub-title" href="${pub.links.paper}" target="_blank">${pub.title}</a>
          <div class="pub-authors">${pub.authors}</div>
          <div class="pub-venue">${pub.venue}</div>
          <div class="pub-links">${links}</div>
        </div>
      </div>
    `;
  }

  // Load and render gallery
  async loadGallery() {
    const data = await this.loadJSON('data/gallery.json');
    if (!data || !data.sections) return;

    const container = document.querySelector('.gallery-container');
    if (!container) return;

    let html = '';
    data.sections.forEach(section => {
      html += `
        <section class="gallery-section">
          <h2 class="gallery-section-title">
            <i class="${section.icon}" style="color: ${section.color}; margin-right: 0.5rem;"></i>
            ${section.title}
          </h2>
          <div class="gallery-grid">
      `;

      section.items.forEach(item => {
        html += `
          <div class="gallery-item" data-title="${item.title}" data-desc="${item.description}">
            <img src="${item.image}" alt="${item.title}">
            <div class="gallery-item-overlay">
              <div class="gallery-item-title">${item.title}</div>
              <div class="gallery-item-desc">${item.description}</div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </section>
      `;
    });

    container.innerHTML = html;
    
    // Re-initialize lightbox after content is loaded
    setTimeout(() => {
      this.initGalleryLightbox();
    }, 100);
  }

  initGalleryLightbox() {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      const galleryItems = document.querySelectorAll('.gallery-item');
      const allImages = [];

      galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        allImages.push({
          src: img.src,
          alt: img.alt,
          title: item.dataset.title || '',
          desc: item.dataset.desc || ''
        });

        item.addEventListener('click', () => {
          this.openLightbox(index, allImages);
        });
      });

      window.allGalleryImages = allImages;
    }, 100);
  }

  openLightbox(index, allImages) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    if (!lightbox || !lightboxImage) return;

    let currentIndex = index;
    const images = allImages;

    function updateLightbox() {
      const current = images[currentIndex];
      lightboxImage.src = current.src;
      lightboxImage.alt = current.alt;
      lightboxTitle.textContent = current.title;
      lightboxDesc.textContent = current.desc;
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightbox();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightbox();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Set up event listeners
    lightboxClose.onclick = closeLightbox;
    lightboxPrev.onclick = showPrev;
    lightboxNext.onclick = showNext;

    lightbox.onclick = (e) => {
      if (e.target === lightbox) closeLightbox();
    };

    // Keyboard navigation
    const keyHandler = (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };

    document.addEventListener('keydown', keyHandler);

    // Initialize
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Load and render awards
  async loadAwards() {
    const data = await this.loadJSON('data/awards.json');
    if (!data) return;

    const container = document.querySelector('.awards-container');
    if (!container) return;

    let html = '';

    // Awards & Honors
    if (data.awards && data.awards.length > 0) {
      html += this.renderAwardSection('Awards & Honors', 'fas fa-trophy', '#f39c12', data.awards);
    }

    // Grants
    if (data.grants && data.grants.length > 0) {
      html += this.renderAwardSection('Research Grants & Funding', 'fas fa-grant', '#3498db', data.grants);
    }

    // Editorial
    if (data.editorial && data.editorial.length > 0) {
      html += this.renderAwardSection('Editorial Board Positions', 'fas fa-edit', '#9b59b6', data.editorial);
    }

    // Service
    if (data.service && data.service.length > 0) {
      html += this.renderAwardSection('Professional Service & Leadership', 'fas fa-users', '#e74c3c', data.service);
    }

    container.innerHTML = html;
  }

  renderAwardSection(title, icon, color, items) {
    let html = `
      <section class="awards-section">
        <h2 class="awards-section-title">
          <i class="${icon}" style="color: ${color}; margin-right: 0.5rem;"></i>
          ${title}
        </h2>
        <div class="awards-timeline">
    `;

    items.forEach(item => {
      let desc = item.description;
      // Handle links in description
      if (item.link && desc.includes('N2Women Rising Stars')) {
        desc = desc.replace('N2Women Rising Stars', `<a href="${item.link}" target="_blank" rel="noopener" class="award-link">N2Women Rising Stars</a>`);
      } else if (item.link && desc.includes('IEEE CCNC')) {
        desc = desc.replace('IEEE CCNC', `<a href="${item.link}" target="_blank" rel="noopener" class="award-link">IEEE CCNC</a>`);
      }
      
      html += `
        <div class="timeline-item">
          <div class="award-card">
            <span class="award-year">${item.year}</span>
            <h3 class="award-title">${item.title}</h3>
            <p class="award-description">${desc}</p>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </section>
    `;

    return html;
  }
}

// Initialize content loader
const contentLoader = new ContentLoader();

// Auto-load content based on page
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  // Load news on index page
  if (filename === 'index.html') {
    contentLoader.loadNews();
  }

  // Load people pages
  if (filename === 'phd-students.html') {
    contentLoader.loadPeople('phd');
  } else if (filename === 'ms-students.html') {
    contentLoader.loadPeople('ms');
  } else if (filename === 'visitors.html') {
    contentLoader.loadPeople('visitors');
  }

  // Load publications
  if (filename === 'publication.html') {
    contentLoader.loadPublications();
  }

  // Load gallery
  if (filename === 'gallery.html') {
    contentLoader.loadGallery();
  }

  // Load awards
  if (filename === 'awards.html') {
    contentLoader.loadAwards();
  }
});

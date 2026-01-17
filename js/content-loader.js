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
          <div class="visitor-card">
            <div class="visitor-photo">
              <img src="${person.image}" alt="${person.name}">
            </div>
            <div class="visitor-info">
              <div class="visitor-header">
                <h3>${person.name}</h3>
                <span class="visitor-period">${person.period}</span>
              </div>
              <p class="visitor-role">${person.title}${person.institution ? `, ${person.institution}` : ''}</p>
              <p class="visitor-desc">${person.description}</p>
              <div class="visitor-focus">
                <span class="visitor-label">Research:</span>
                <span class="visitor-value">${person.research}</span>
                <span class="visitor-label">Project:</span>
                <span class="visitor-value">${person.project}</span>
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

    const listing = document.querySelector('#pub-listing-inner');
    if (!listing) return;

    const featuredGrid = document.querySelector('#pub-featured-grid');
    const featuredSection = document.querySelector('#pub-featured');
    const yearSelect = document.querySelector('#pub-year');
    const typeSelect = document.querySelector('#pub-type');
    const tagSelect = document.querySelector('#pub-tag');
    const searchInput = document.querySelector('#pub-search');
    const clearBtn = document.querySelector('#pub-clear');
    const resultCount = document.querySelector('#pub-result-count');
    const emptyState = document.querySelector('#pub-empty');

    const pubs = [];
    (data.journals || []).forEach(pub => pubs.push({ ...pub, type: 'Journal' }));
    (data.conferences || []).forEach(pub => pubs.push({ ...pub, type: 'Conference' }));

    pubs.forEach((pub, idx) => {
      pub._index = idx;
      pub._tags = this.deriveTags(pub);
    });

    const years = Array.from(new Set(pubs.map(pub => pub.year).filter(Boolean)))
      .sort((a, b) => b - a);

    if (yearSelect) {
      yearSelect.innerHTML = '<option value="all">All years</option>' + years
        .map(year => `<option value="${year}">${year}</option>`)
        .join('');
    }

    if (tagSelect) {
      const tagSet = new Set();
      pubs.forEach(pub => pub._tags.forEach(tag => tagSet.add(tag)));
      const tags = Array.from(tagSet).sort();
      tagSelect.innerHTML = '<option value="all">All topics</option>' + tags
        .map(tag => `<option value="${tag}">${tag}</option>`)
        .join('');
    }

    const featured = pubs.filter(pub => pub.featured);
    const featuredList = featured.length
      ? featured
      : pubs.slice().sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 4);

    if (featuredSection && featuredGrid) {
      if (featuredList.length === 0) {
        featuredSection.style.display = 'none';
      } else {
        featuredGrid.innerHTML = featuredList.map(pub => this.renderFeaturedCard(pub)).join('');
      }
    }

    const applyFilters = () => {
      const query = (searchInput && searchInput.value || '').trim().toLowerCase();
      const year = yearSelect ? yearSelect.value : 'all';
      const type = typeSelect ? typeSelect.value : 'all';
      const tag = tagSelect ? tagSelect.value : 'all';

      const filtered = pubs.filter(pub => {
        if (year !== 'all' && String(pub.year) !== year) return false;
        if (type !== 'all' && pub.type !== type) return false;
        if (tag !== 'all' && !pub._tags.includes(tag)) return false;

        if (!query) return true;
        const haystack = [
          pub.title,
          pub.authors,
          pub.venue,
          pub._tags.join(' ')
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });

      this.renderPublicationListing(filtered, listing);

      if (resultCount) {
        resultCount.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'} shown`;
      }

      if (emptyState) {
        emptyState.hidden = filtered.length > 0;
      }
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (yearSelect) yearSelect.addEventListener('change', applyFilters);
    if (typeSelect) typeSelect.addEventListener('change', applyFilters);
    if (tagSelect) tagSelect.addEventListener('change', applyFilters);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (yearSelect) yearSelect.value = 'all';
        if (typeSelect) typeSelect.value = 'all';
        if (tagSelect) tagSelect.value = 'all';
        applyFilters();
      });
    }

    applyFilters();

    this.setupPublicationLightbox(pubs, listing, featuredGrid);
    this.setupCitationCopy(listing, featuredGrid);
  }

  renderPublicationListing(items, container) {
    const grouped = new Map();
    items.forEach(pub => {
      const year = pub.year || 'Other';
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year).push(pub);
    });

    const years = Array.from(grouped.keys())
      .sort((a, b) => (b === 'Other' ? -1 : a === 'Other' ? 1 : b - a));

    container.innerHTML = years.map(year => {
      const pubs = grouped.get(year);
      const cards = pubs.map(pub => this.renderPublicationCard(pub)).join('');
      return `
        <div class="pub-year-group" data-year="${year}">
          <div class="pub-year-header">${year}</div>
          <div class="pub-year-grid">${cards}</div>
        </div>
      `;
    }).join('');
  }

  renderPublicationCard(pub) {
    const preview = this.getMediaPreview(pub);
    const authorsHtml = this.formatAuthors(pub.authors, pub.boldAuthors);
    const hasEqual = pub.authors && pub.authors.includes('*');
    const metrics = pub.metrics || {};
    const badges = [
      `<span class="pub-badge">${pub.type}</span>`,
      this.isTopVenue(pub.venue) ? '<span class="pub-badge highlight">Top Venue</span>' : ''
    ].join('');

    const tagsHtml = pub._tags.length
      ? `<div class="pub-tags">${pub._tags.map(tag => `<span class="pub-tag">${tag}</span>`).join('')}</div>`
      : '';

    const metricsHtml = (metrics.citations || metrics.awards)
      ? `<div class="pub-metrics">${metrics.citations ? `Citations: ${metrics.citations}. ` : ''}${metrics.awards ? `Awards: ${metrics.awards}.` : ''}</div>`
      : '';

    const actionLinks = this.buildPublicationLinks(pub);
    const citation = this.buildCitation(pub);

    return `
      <div class="pub-card">
        <button class="pub-media-trigger" type="button" data-pub-index="${pub._index}" aria-label="Open media">
          <div class="pub-teaser-wrap">
            ${preview.url ? `<img class="pub-teaser" src="${preview.url}" alt="Publication preview">` : '<div class="pub-teaser"></div>'}
            ${preview.isVideo ? '<span class="pub-play">▶</span>' : ''}
          </div>
        </button>
        <div class="pub-body">
          <div class="pub-badges">${badges}</div>
          <a class="pub-title" href="${pub.links.paper}" target="_blank" rel="noopener">${pub.title}</a>
          <div class="pub-authors">${authorsHtml}</div>
          ${hasEqual ? '<div class="pub-equal-note">* Equal contribution</div>' : ''}
          <div class="pub-venue">${pub.venue}</div>
          ${tagsHtml}
          ${metricsHtml}
          <div class="pub-actions">
            ${actionLinks}
            <button class="pub-btn pub-btn-outline pub-copy" type="button" data-citation="${this.escapeHtml(citation)}"><i class="fas fa-copy"></i> Copy citation</button>
          </div>
        </div>
      </div>
    `;
  }

  renderFeaturedCard(pub) {
    const preview = this.getMediaPreview(pub);
    const takeaway = pub.takeaway || (pub._tags.length ? `Focus: ${pub._tags.slice(0, 3).join(', ')}.` : '');
    return `
      <div class="pub-featured-card">
        <button class="pub-featured-trigger" type="button" data-pub-index="${pub._index}" aria-label="Open media">
          <div class="pub-featured-media">
            ${preview.url ? `<img src="${preview.url}" alt="Publication preview">` : ''}
            ${preview.isVideo ? '<span class="pub-play">▶</span>' : ''}
          </div>
        </button>
        <a class="pub-featured-title" href="${pub.links.paper}" target="_blank" rel="noopener">${pub.title}</a>
        ${takeaway ? `<div class="pub-featured-takeaway">${takeaway}</div>` : ''}
        <div class="pub-actions">
          ${this.buildPublicationLinks(pub)}
          <button class="pub-btn pub-btn-outline pub-copy" type="button" data-citation="${this.escapeHtml(this.buildCitation(pub))}"><i class="fas fa-copy"></i> Copy citation</button>
        </div>
      </div>
    `;
  }

  buildPublicationLinks(pub) {
    const links = [];
    if (pub.links && pub.links.paper) {
      links.push(`<a class="pub-btn" href="${pub.links.paper}" target="_blank" rel="noopener"><i class="fas fa-file-alt"></i> Paper</a>`);
    }
    const codeLink = (pub.links && pub.links.code) ? pub.links.code : '#';
    const dataLink = (pub.links && pub.links.dataset) ? pub.links.dataset : '#';
    links.push(`<a class="pub-btn pub-btn-outline" href="${codeLink}" target="_blank" rel="noopener"><i class="fas fa-code"></i> Code</a>`);
    links.push(`<a class="pub-btn pub-btn-outline" href="${dataLink}" target="_blank" rel="noopener"><i class="fas fa-database"></i> Dataset</a>`);
    if (pub.links && pub.links.arxiv && pub.links.arxiv !== '#') {
      links.push(`<a class="pub-btn pub-btn-outline" href="${pub.links.arxiv}" target="_blank" rel="noopener"><i class="fas fa-book"></i> arXiv</a>`);
    }
    if (pub.doi) {
      links.push(`<a class="pub-btn pub-btn-outline" href="https://doi.org/${pub.doi}" target="_blank" rel="noopener"><i class="fas fa-link"></i> DOI</a>`);
    }
    if (pub.bibtex || (pub.links && pub.links.bibtex)) {
      const bibtex = pub.bibtex || pub.links.bibtex;
      links.push(`<a class="pub-btn pub-btn-outline" href="${bibtex}" target="_blank" rel="noopener"><i class="fas fa-quote-right"></i> BibTeX</a>`);
    }
    return links.join('');
  }

  buildCitation(pub) {
    const authors = pub.authors ? pub.authors.replace(/\s+/g, ' ').trim() : '';
    const title = pub.title || '';
    const venue = pub.venue || '';
    const year = pub.year ? ` (${pub.year})` : '';
    return `${authors}. ${title}. ${venue}${year}.`;
  }

  getMediaPreview(pub) {
    const mediaUrl = pub.image || pub.gif || pub.media || pub.video;
    if (!mediaUrl) return { url: '', isVideo: false };

    const youtubeId = this.getYoutubeId(mediaUrl);
    if (youtubeId) {
      return { url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`, isVideo: true };
    }

    const isVideo = mediaUrl.match(/\.(mp4|webm)$/i) || pub.video;
    return { url: mediaUrl, isVideo };
  }

  getYoutubeId(url) {
    if (!url) return '';
    if (url.includes('youtube.com')) {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : '';
    }
    if (url.includes('youtu.be')) {
      return url.split('/').pop();
    }
    return '';
  }

  deriveTags(pub) {
    const tags = new Set(Array.isArray(pub.tags) ? pub.tags : []);
    const text = `${pub.title || ''} ${pub.venue || ''}`.toLowerCase();
    const patterns = [
      ['quantum', 'Quantum'],
      ['wireless', 'Wireless'],
      ['spectrum', 'Spectrum Sharing'],
      ['cyber', 'Cybersecurity'],
      ['privacy', 'Privacy'],
      ['federated', 'Federated Learning'],
      ['ml', 'Machine Learning'],
      ['learning', 'Machine Learning'],
      ['rf', 'RF Signals'],
      ['iot', 'IoT'],
      ['edge', 'Edge Computing'],
      ['mimo', 'MIMO'],
      ['radar', 'Radar']
    ];
    patterns.forEach(([key, label]) => {
      if (text.includes(key)) tags.add(label);
    });
    return Array.from(tags).slice(0, 4);
  }

  isTopVenue(venue) {
    if (!venue) return false;
    const upper = venue.toUpperCase();
    const keywords = ['IEEE', 'ACM', 'INFOCOM', 'ICC', 'GLOBECOM', 'MOBICOM', 'TMC', 'TWC'];
    return keywords.some(keyword => upper.includes(keyword));
  }

  setupCitationCopy(listing, featuredGrid) {
    const handler = (event) => {
      const btn = event.target.closest('.pub-copy');
      if (!btn) return;
      const citation = btn.getAttribute('data-citation') || '';
      if (!citation) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(citation);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = citation;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      btn.innerHTML = '<i class="fas fa-check"></i> Copied';
      setTimeout(() => { btn.textContent = 'Copy citation'; }, 1200);
    };

    if (listing) listing.addEventListener('click', handler);
    if (featuredGrid) featuredGrid.addEventListener('click', handler);
  }

  setupPublicationLightbox(pubs, listing, featuredGrid) {
    const lightbox = document.querySelector('#pub-lightbox');
    const media = document.querySelector('#pub-lightbox-media');
    const caption = document.querySelector('#pub-lightbox-caption');
    const closeBtn = document.querySelector('.pub-lightbox-close');
    const prevBtn = document.querySelector('.pub-lightbox-prev');
    const nextBtn = document.querySelector('.pub-lightbox-next');
    if (!lightbox || !media || !caption) return;

    let indices = [];
    let position = 0;
    let startX = 0;

    const render = () => {
      const pub = pubs[indices[position]];
      if (!pub) return;
      media.innerHTML = this.renderPublicationMedia(pub);
      caption.textContent = `${pub.title} — ${pub.venue}`;
    };

    const open = () => {
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      render();
    };

    const close = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      media.innerHTML = '';
    };

    const prev = () => {
      if (indices.length < 2) return;
      position = (position - 1 + indices.length) % indices.length;
      render();
    };

    const next = () => {
      if (indices.length < 2) return;
      position = (position + 1) % indices.length;
      render();
    };

    const openFromContainer = (container, target) => {
      if (!container) return;
      const triggers = Array.from(container.querySelectorAll('[data-pub-index]'));
      indices = triggers.map(el => Number(el.getAttribute('data-pub-index')));
      position = Math.max(0, indices.indexOf(Number(target.getAttribute('data-pub-index'))));
      open();
    };

    if (listing) {
      listing.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-pub-index]');
        if (!trigger) return;
        openFromContainer(listing, trigger);
      });
    }

    if (featuredGrid) {
      featuredGrid.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-pub-index]');
        if (!trigger) return;
        openFromContainer(featuredGrid, trigger);
      });
    }

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    });

    lightbox.addEventListener('touchstart', (event) => {
      startX = event.changedTouches[0].clientX;
    });
    lightbox.addEventListener('touchend', (event) => {
      const endX = event.changedTouches[0].clientX;
      const delta = endX - startX;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) prev();
      else next();
    });
  }

  renderPublicationMedia(pub) {
    const mediaUrl = pub.video || pub.gif || pub.image || pub.media;
    if (!mediaUrl) return '';

    if (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) {
      const videoId = mediaUrl.split('v=')[1] || mediaUrl.split('/').pop();
      return `
        <iframe class="pub-media"
          src="https://www.youtube.com/embed/${videoId}"
          allowfullscreen>
        </iframe>
      `;
    }

    if (mediaUrl.match(/\.(mp4|webm)$/i) || pub.video) {
      return `
        <video class="pub-media" controls>
          <source src="${mediaUrl}">
        </video>
      `;
    }

    if (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || pub.image || pub.gif) {
      return `
        <img class="pub-media" src="${mediaUrl}" alt="Publication media">
      `;
    }

    return `
      <img class="pub-media" src="${mediaUrl}" alt="Publication media">
    `;
  }

  escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatAuthors(authors, boldAuthors) {
    if (!authors) return '';
    const names = Array.isArray(boldAuthors)
      ? boldAuthors
      : boldAuthors
        ? [boldAuthors]
        : [];
    if (names.length === 0) return authors;

    let formatted = authors;
    names.forEach(name => {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'g');
      formatted = formatted.replace(regex, `<strong>${name}</strong>`);
    });
    return formatted;
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

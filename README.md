# EQUALS Lab Website

Official website for the intElligent QUantum And wireLess communication Systems (EQUALS) Lab at Mississippi State University.

## 🚀 Quick Start

This website is designed to be easily maintainable through JSON data files. Simply edit the JSON files in the `data/` directory to update content.

## 📁 Project Structure

```
WIQ-AI.github.io/
├── assets/              # Images and media files
├── css/                 # Stylesheets
├── data/                # JSON data files (EDIT THESE!)
│   ├── news.json        # News/announcements
│   ├── people.json      # PhD, MS students, and visitors
│   ├── publications.json # Journal and conference publications
│   ├── gallery.json     # Gallery images
│   └── awards.json      # Awards, grants, and honors
├── js/                  # JavaScript files
│   ├── main.js          # Core functionality
│   └── content-loader.js # Dynamic content loader
└── *.html               # Page files
```

## ✏️ How to Update Content

### 📰 Adding News/Announcements

Edit `data/news.json`:

```json
[
  {
    "date": "January 2025",
    "text": "Your news text here. Can include <strong>HTML</strong> tags."
  }
]
```

### 👥 Adding People

Edit `data/people.json`:

**For PhD Students:**
```json
{
  "phd": [
    {
      "name": "Student Name",
      "image": "assets/student-photo.png",
      "period": "Fall 2024-",
      "bachelor": {
        "degree": "computer science",
        "university": "University Name",
        "year": "2020"
      },
      "master": {
        "degree": "Master's degree",
        "university": "University Name",
        "year": "2022"
      },
      "description": "Current status description...",
      "research": "research interests here",
      "links": {
        "github": "https://github.com/username",
        "linkedin": "https://linkedin.com/in/username",
        "email": "email@example.com"
      }
    }
  ]
}
```

**For MS Students:**
- Similar structure, add to `"ms"` array
- No `master` field needed if not applicable

**For Visitors:**
- Add to `"visitors"` array
- Use `title`, `institution`, `project` fields

### 📚 Adding Publications

Edit `data/publications.json`:

**For Journals:**
```json
{
  "journals": [
    {
      "year": 2025,
      "title": "Paper Title",
      "authors": "Author1, Author2, ...",
      "venue": "Journal Name Volume (Issue), pages, year",
      "links": {
        "paper": "https://link-to-pdf",
        "arxiv": null
      }
    }
  ]
}
```

**For Conferences:**
- Add to `"conferences"` array
- Set `arxiv` link if available

### 🖼️ Adding Gallery Images

Edit `data/gallery.json`:

```json
{
  "sections": [
    {
      "title": "Section Name",
      "icon": "fas fa-icon-name",
      "color": "#3498db",
      "items": [
        {
          "title": "Image Title",
          "description": "Image description",
          "image": "assets/image.jpg"
        }
      ]
    }
  ]
}
```

### 🏆 Adding Awards

Edit `data/awards.json`:

```json
{
  "awards": [
    {
      "year": 2025,
      "title": "Award Title",
      "description": "Award description",
      "link": "optional-link-url"
    }
  ],
  "grants": [...],
  "editorial": [...],
  "service": [...]
}
```

## 🎨 Customization

### Changing Colors

Edit `css/style.css` - look for CSS variables:
```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  ...
}
```

### Adding New Pages

1. Create new HTML file
2. Copy navigation structure from existing pages
3. Add content
4. If dynamic content needed, extend `content-loader.js`

## 📦 GitHub Pages Deployment

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch (usually `main` or `gh-pages`)
4. Site will be live at `https://username.github.io/repository-name/`

## 🔧 Technical Details

- **Pure HTML/CSS/JavaScript** - No build process required
- **JSON-driven content** - Easy to update without touching HTML
- **Responsive design** - Works on all devices
- **Fast loading** - Optimized for performance

## 📝 Notes

- Always use relative paths for images: `assets/image.jpg`
- JSON files must be valid JSON (use a validator)
- Images should be optimized before uploading
- Test locally before pushing to GitHub

## 🐛 Troubleshooting

**Content not showing?**
- Check browser console for errors
- Verify JSON files are valid
- Ensure `content-loader.js` is loaded

**Images not loading?**
- Check file paths in JSON
- Verify images exist in `assets/` folder
- Use relative paths from root

## 📄 License

© 2025 EQUALS Lab. All rights reserved.

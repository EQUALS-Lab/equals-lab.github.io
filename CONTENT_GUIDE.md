# Content Management Guide

## Quick Reference: How to Update Content

All content is managed through JSON files in the `data/` directory. No HTML editing required!

### 📰 Update News (Home Page)

**File:** `data/news.json`

```json
[
  {
    "date": "January 2025",
    "text": "Your news here. Supports <strong>HTML</strong> tags."
  }
]
```

**To add news:** Just add a new object to the array at the top.

---

### 👥 Add/Update People

**File:** `data/people.json`

#### Add PhD Student:
```json
{
  "phd": [
    {
      "name": "Student Name",
      "image": "assets/photo.jpg",
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
      "description": "Current status...",
      "research": "research interests",
      "links": {
        "github": "https://github.com/username",
        "linkedin": "https://linkedin.com/in/username",
        "email": "email@example.com"
      }
    }
  ]
}
```

#### Add MS Student:
- Same structure, add to `"ms"` array
- Remove `master` field if not applicable

#### Add Visitor:
- Add to `"visitors"` array
- Use `title`, `institution`, `project` fields

---

### 📚 Add Publication

**File:** `data/publications.json`

#### Journal:
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

#### Conference:
- Add to `"conferences"` array
- Set `arxiv` if available, otherwise `null`

**Note:** Publications are automatically sorted by year (newest first).

---

### 🖼️ Add Gallery Image

**File:** `data/gallery.json`

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
          "description": "Description",
          "image": "assets/image.jpg"
        }
      ]
    }
  ]
}
```

**Available icons:** `fas fa-calendar-alt`, `fas fa-users`, `fas fa-building`, etc.
**Colors:** Use hex codes like `#3498db`, `#9b59b6`, `#e74c3c`

---

### 🏆 Add Award

**File:** `data/awards.json`

```json
{
  "awards": [
    {
      "year": 2025,
      "title": "Award Title",
      "description": "Description text",
      "link": "optional-url"
    }
  ],
  "grants": [...],
  "editorial": [...],
  "service": [...]
}
```

**To add:** Just add a new object to the appropriate array.

---

## 📝 Tips

1. **Always validate JSON** - Use a JSON validator before saving
2. **Image paths** - Always use relative paths: `assets/filename.jpg`
3. **Order matters** - For news, newest items should be first in the array
4. **HTML in text** - You can use HTML tags in text fields (news, descriptions)
5. **Links** - Use `#` for placeholder links, replace with real URLs later

---

## 🚀 Publishing to GitHub Pages

1. Edit JSON files
2. Commit changes: `git add . && git commit -m "Update content"`
3. Push: `git push origin main`
4. Site updates automatically!

---

## ⚠️ Common Issues

**Content not showing?**
- Check browser console (F12) for errors
- Verify JSON is valid
- Ensure file paths are correct

**Images not loading?**
- Check file exists in `assets/` folder
- Verify path in JSON matches actual filename
- Use lowercase filenames to avoid issues

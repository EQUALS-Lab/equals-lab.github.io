// Node.js script to generate latest-news.json from all .md files in latest-news/
const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, 'latest-news');
const outFile = path.join(__dirname, 'latest-news.json');

function parseMdFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/---([\s\S]*?)---/);
    if (!match) return null;
    const lines = match[1].split('\n').map(l => l.trim()).filter(Boolean);
    const news = {};
    lines.forEach(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            news[key] = value;
        }
    });
    return news;
}

const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.md'));
const newsList = files.map(f => parseMdFile(path.join(newsDir, f))).filter(Boolean);
fs.writeFileSync(outFile, JSON.stringify(newsList, null, 2));
console.log('Generated latest-news.json with', newsList.length, 'posts.');

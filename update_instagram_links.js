const fs = require('fs');
const path = require('path');

// Find all HTML files in the directory
const dir = '.';
const files = fs.readdirSync(dir).filter(file => file.endsWith('.html'));

const oldUrl = 'https://www.instagram.com/handy_crafts1_/?__pwa=1';
const newUrl = 'https://www.instagram.com/handy_crafts1_/';

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(oldUrl)) {
        const replacedContent = content.replace(new RegExp(oldUrl, 'g'), newUrl);
        fs.writeFileSync(filePath, replacedContent, 'utf8');
        updatedCount++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`\nTotal files updated: ${updatedCount}`);

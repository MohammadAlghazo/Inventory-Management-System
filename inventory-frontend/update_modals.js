const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/Projects/Inventory Management/Inventory-Management/inventory-frontend/src/app/features');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/class=\s*["'](?:[^"']*\s)?custom-modal-overlay(?:\s[^"']*)?["'][^>]*\(click\)="([^"]+)"/g, (match, p1) => {
        return match.replace('(click)="' + p1 + '"', (mousedown)="event.target === event.currentTarget ?  : null");
    });

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});

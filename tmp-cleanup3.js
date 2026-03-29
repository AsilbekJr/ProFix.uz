const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Link href to `to`
    content = content.replace(/<Link\s+([^>]*?)href=/g, '<Link $1to=');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            processFile(fullPath);
        }
    }
}

walkDir('admin-vite/src');
console.log('Cleanup 3 complete!');

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix process.env
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL/g, 'import.meta.env.VITE_API_URL');
    
    // Fix next/link that wasn't caught
    content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?/g, 'import { Link } from "react-router-dom";');
    
    // Clean up duplicate imports of react-router-dom
    const rrdImports = [...content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]react-router-dom['"];?/g)];
    if (rrdImports.length > 1) {
        let allImports = new Set();
        for (let match of rrdImports) {
            match[1].split(',').forEach(i => allImports.add(i.trim()));
            content = content.replace(match[0], ''); // Remove all
        }
        allImports.delete('');
        content = `import { ${Array.from(allImports).join(', ')} } from "react-router-dom";\n` + content;
    }
    
    // Next/Image
    content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"];?/g, '');
    
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
console.log('Cleanup complete!');

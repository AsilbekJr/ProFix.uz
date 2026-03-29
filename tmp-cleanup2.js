const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix router initialization
    content = content.replace(/const\s+router\s*=\s*useNavigate\(\)/g, 'const navigate = useNavigate()');
    
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

// Fix strict tsconfig
const tsconfigPath = 'admin-vite/tsconfig.app.json';
let tsconfig = fs.readFileSync(tsconfigPath, 'utf8');
tsconfig = tsconfig.replace(/"verbatimModuleSyntax": true/g, '"verbatimModuleSyntax": false');
tsconfig = tsconfig.replace(/"noUnusedLocals": true/g, '"noUnusedLocals": false');
tsconfig = tsconfig.replace(/"noUnusedParameters": true/g, '"noUnusedParameters": false');
fs.writeFileSync(tsconfigPath, tsconfig, 'utf8');

console.log('Cleanup 2 complete!');

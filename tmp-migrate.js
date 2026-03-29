const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'admin';
const TARGET_DIR = 'admin-vite/src';

const DIRS_TO_COPY = ['components', 'lib', 'store', 'types'];

function copyDirIterative(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirIterative(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

for (let d of DIRS_TO_COPY) {
    const src = path.join(SOURCE_DIR, d);
    const dst = path.join(TARGET_DIR, d);
    if (fs.existsSync(src)) {
        if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true });
        copyDirIterative(src, dst);
    }
}

const pagesDir = path.join(TARGET_DIR, 'pages');
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

function processContent(content) {
    content = content.replace(/['"]use client['"];?\n?/g, '');
    content = content.replace(/import Image from ['"]next\/image['"];?\n?/g, '');
    content = content.replace(/<Image([^>]+)\/>/g, '<img$1/>');
    content = content.replace(/import {?\\s*Link\\s*}? from ['"]next\/link['"];?/g, 'import { Link } from "react-router-dom";');
    content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]next\/navigation['"];?/g, 'import { useNavigate, useLocation } from "react-router-dom";');
    content = content.replace(/useRouter\(\)/g, 'useNavigate()');
    content = content.replace(/const\s+pathname\s*=\s*usePathname\(\);?/g, 'const { pathname } = useLocation();');
    content = content.replace(/router\.push/g, 'navigate');
    content = content.replace(/router\.replace/g, 'navigate');
    return content;
}

function processDir(directory) {
    if (!fs.existsSync(directory)) return;
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (let entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = processContent(content);
            fs.writeFileSync(fullPath, content, 'utf8');
        }
    }
}

for (let d of DIRS_TO_COPY) {
    processDir(path.join(TARGET_DIR, d));
}

const mapping = [
    ['page.tsx', 'LoginPage.tsx'],
    ['dashboard/page.tsx', 'DashboardPage.tsx'],
    ['dashboard/layout.tsx', 'DashboardLayout.tsx'],
    ['dashboard/categories/page.tsx', 'CategoriesPage.tsx'],
    ['dashboard/orders/page.tsx', 'OrdersPage.tsx'],
    ['dashboard/specialists/page.tsx', 'SpecialistsPage.tsx'],
    ['dashboard/users/page.tsx', 'UsersPage.tsx'],
    ['providers.tsx', 'Providers.tsx']
];

for (let [srcFile, dstName] of mapping) {
    const fullSrc = path.join(SOURCE_DIR, 'app', srcFile);
    const fullDst = path.join(pagesDir, dstName);
    if (fs.existsSync(fullSrc)) {
        let content = fs.readFileSync(fullSrc, 'utf8');
        content = processContent(content);
        fs.writeFileSync(fullDst, content, 'utf8');
    }
}

console.log("Migration complete!");

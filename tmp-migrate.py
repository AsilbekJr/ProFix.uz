import os
import shutil
import re

SOURCE_DIR = 'admin'
TARGET_DIR = 'admin-vite/src'

DIRS_TO_COPY = ['components', 'lib', 'store', 'types']

# Copy top-level folders
for d in DIRS_TO_COPY:
    src = os.path.join(SOURCE_DIR, d)
    dst = os.path.join(TARGET_DIR, d)
    if os.path.isdir(src):
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

# Create pages dir
os.makedirs(os.path.join(TARGET_DIR, 'pages'), exist_ok=True)

# Helper for string replacements
def process_file_content(content):
    # Convert 'use client'
    content = re.sub(r'[\'"]use client[\'"];?\n?', '', content)
    
    # Replace next/image
    content = re.sub(r'import Image from [\'"]next/image[\'"];?\n?', '', content)
    content = re.sub(r'<Image([^>]+)/>', r'<img\1 />', content) # Naive Image replacement
    
    # Replace next/link
    content = re.sub(r'import Link from [\'"]next/link[\'"];?', 'import { Link } from "react-router-dom";', content)
    
    # Replace next/navigation
    content = re.sub(r'import\s+{([^}]+)}\s+from\s+[\'"]next/navigation[\'"];?', 'import { useNavigate, useLocation } from "react-router-dom";', content)
    content = re.sub(r'useRouter\(\)', 'useNavigate()', content)
    content = re.sub(r'const\s+pathname\s*=\s*usePathname\(\);?', 'const { pathname } = useLocation();', content)
    
    # Replace router.push, router.replace
    content = re.sub(r'router\.push', 'navigate', content)
    content = re.sub(r'router\.replace', 'navigate', content) # Note: technically navigate('/path', {replace: true}) but naive is fine for now
    
    # Replace @/ imports
    content = re.sub(r'from [\'"]@/', 'from \'@/', content)
    
    return content

# Recursively process copied files
def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = process_file_content(content)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

for d in DIRS_TO_COPY:
    dst = os.path.join(TARGET_DIR, d)
    if os.path.exists(dst):
        process_dir(dst)

# Extract pages from app/
app_dir = os.path.join(SOURCE_DIR, 'app')
pages_dir = os.path.join(TARGET_DIR, 'pages')

mapping = [
    ('page.tsx', 'LoginPage.tsx'),
    ('dashboard/page.tsx', 'DashboardPage.tsx'),
    ('dashboard/layout.tsx', 'DashboardLayout.tsx'),
    ('dashboard/categories/page.tsx', 'CategoriesPage.tsx'),
    ('dashboard/orders/page.tsx', 'OrdersPage.tsx'),
    ('dashboard/specialists/page.tsx', 'SpecialistsPage.tsx'),
    ('dashboard/users/page.tsx', 'UsersPage.tsx')
]

for src_file, dst_name in mapping:
    full_src = os.path.join(app_dir, src_file)
    full_dst = os.path.join(pages_dir, dst_name)
    if os.path.exists(full_src):
        with open(full_src, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace default export with named export logic or just keeping it
        content = process_file_content(content)
        
        with open(full_dst, 'w', encoding='utf-8') as f:
            f.write(content)

print("Migration script completed base copy!")

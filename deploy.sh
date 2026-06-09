#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "→ Cleaning up any previous git state..."
rm -rf .git

echo "→ Initializing git repo..."
git init
git branch -m main

echo "→ Creating .gitignore..."
cat > .gitignore << 'EOF'
.DS_Store
node_modules/
*.log
EOF

echo "→ Staging all files..."
git add .
git commit -m "Initial commit: Nextwork animation gallery"

echo "→ Creating public GitHub repo..."
# Requires gh CLI: https://cli.github.com
# If you don't have it: brew install gh && gh auth login
gh repo create nextwork-animations --public --source=. --remote=origin --push

echo ""
echo "✓ Pushed to GitHub!"
echo ""
echo "→ Deploying to Vercel..."
# Requires Vercel CLI: npm i -g vercel
# If you don't have it: npm i -g vercel
vercel --prod --yes

echo ""
echo "✓ Done! Your Vercel URL is shown above."

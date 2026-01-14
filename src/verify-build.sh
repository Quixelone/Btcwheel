#!/bin/bash

echo "🚀 Starting Verification Build..."
echo "📂 Current Directory: $(pwd)"
echo "📂 Files in root:"
ls -la

echo "🛠 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️ node_modules missing, running npm install..."
  npm install
fi

echo "🏗 Running Vite Build..."
npm run build

echo "✅ Build Complete."
echo "📂 Files in dist:"
if [ -d "dist" ]; then
  ls -la dist
else
  echo "❌ ERROR: dist directory was not created!"
  exit 1
fi

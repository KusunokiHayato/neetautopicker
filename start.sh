#!/bin/bash
echo "Starting NEET Auto Picker application..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Listing files: $(ls -la)"

# distディレクトリが存在するかチェック
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found!"
    exit 1
fi

# serveを使用してアプリケーションを起動
echo "Starting serve on port 3000..."
npx serve dist -p 3000 -s

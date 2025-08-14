#!/bin/bash

echo "Building Vite assets and SSR..."

# Build the main application
npm run build

echo "SSR build completed successfully!"
echo "New pages (Privacy.jsx and Terms.jsx) should now be included in the SSR manifest."

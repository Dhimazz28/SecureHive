#!/bin/bash
echo "Building HoneyShield for production..."

npm install
npm run build

echo "Build complete! Ready for production deployment."

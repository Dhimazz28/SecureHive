#!/bin/bash
echo "Starting HoneyShield Security Platform..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Set up database
if [ -n "$DATABASE_URL" ]; then
    echo "Setting up database..."
    npm run db:push
else
    echo "WARNING: DATABASE_URL not set. Please configure your database connection."
fi

# Start the application
echo "Starting application..."
npm run dev

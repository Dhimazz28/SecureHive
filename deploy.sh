#!/bin/bash

# HoneyShield Security Platform Deployment Script
echo "🛡️  HoneyShield Security Platform - Creating Deployment Package"
echo "=============================================================="

# Create deployment directory
DEPLOY_DIR="honeypot-security-platform"
ZIP_NAME="honeypot-security-platform-$(date +%Y%m%d-%H%M%S).zip"

echo "Creating deployment package..."

# Clean up existing deployment directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy project files (excluding build artifacts and dependencies)
echo "Copying project files..."
cp -r client "$DEPLOY_DIR/"
cp -r server "$DEPLOY_DIR/"
cp -r shared "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp tsconfig.json "$DEPLOY_DIR/"
cp vite.config.ts "$DEPLOY_DIR/"
cp tailwind.config.ts "$DEPLOY_DIR/"
cp postcss.config.js "$DEPLOY_DIR/"
cp components.json "$DEPLOY_DIR/"
cp drizzle.config.ts "$DEPLOY_DIR/"
cp replit.md "$DEPLOY_DIR/"

# Create environment example
cat > "$DEPLOY_DIR/.env.example" << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI API Configuration (Optional - system works with rule-based fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=production
PORT=5000

# Security Configuration
SESSION_SECRET=your_secure_session_secret_here
EOF

# Create deployment documentation
cat > "$DEPLOY_DIR/DEPLOYMENT.md" << 'EOF'
# HoneyShield Security Platform - Deployment Guide

## Overview
HoneyShield is a comprehensive cybersecurity honeypot monitoring system with AI-powered threat analysis, real-time attack detection, and advanced threat intelligence capabilities.

## Features
- Real-time Traffic Monitoring with filtering and pagination
- AI-Powered Analysis using OpenAI GPT-4o with rule-based fallback
- Threat Intelligence dashboard with geographic and temporal analysis
- Attack Pattern Detection with automatic identification of new threats
- Database Persistence using PostgreSQL for data storage
- Security Settings with comprehensive configuration management

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key (optional, system works with rule-based fallback)

### Installation
1. Extract the deployment package
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Initialize database: `npm run db:push`
5. Start the application: `npm run dev`

### Environment Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

## System Architecture
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- Backend: Node.js + Express + TypeScript + Drizzle ORM
- Database: PostgreSQL with proper indexing and relations
- AI Integration: OpenAI GPT-4o with quota management and fallback
- Real-time Updates: Polling-based live data refresh (30-second intervals)

## Database Schema
The system creates these tables:
- traffic_logs: Security event data with IP tracking and attack classification
- attack_patterns: AI-detected threat patterns with confidence scoring
- ai_analysis_results: Analysis results and security recommendations
- system_metrics: Real-time dashboard metrics
- dataset_stats: Machine learning model statistics

## Dashboard Sections
1. Overview: Real-time metrics and attack distribution
2. Traffic: Filterable security event logs
3. Analysis: AI-powered attack pattern detection
4. Threats: Comprehensive threat intelligence
5. Settings: System configuration and monitoring

## API Endpoints
- `/api/traffic-logs` - Security event data with filtering
- `/api/attack-patterns` - AI-detected threat patterns
- `/api/threat-intelligence` - Threat intelligence data
- `/api/geographic-threats` - Geographic threat distribution
- `/api/system-status` - Real-time system performance
- `/api/export-report` - Security report generation

## Security Features
- Automatic new attack pattern detection (70-95% confidence)
- Multi-vector attack coordination detection
- Geographic and payload anomaly analysis
- Real-time threat monitoring with severity classification
- IOC (Indicators of Compromise) tracking
- Configurable security policies and alert thresholds

## Production Deployment
1. Build: `npm run build`
2. Configure environment variables
3. Set up PostgreSQL connection
4. Configure reverse proxy (nginx recommended)
5. Set up SSL/TLS certificates
6. Use process manager (PM2 recommended)

## Troubleshooting
- Verify database connectivity
- Check OpenAI API key if AI analysis fails
- Monitor system logs for errors
- Use built-in system status dashboard
EOF

# Create startup script
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
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
EOF

chmod +x "$DEPLOY_DIR/start.sh"

# Create production build script
cat > "$DEPLOY_DIR/build.sh" << 'EOF'
#!/bin/bash
echo "Building HoneyShield for production..."

npm install
npm run build

echo "Build complete! Ready for production deployment."
EOF

chmod +x "$DEPLOY_DIR/build.sh"

# Create main README
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# HoneyShield Security Platform

A comprehensive cybersecurity honeypot monitoring system with AI-powered threat analysis and real-time attack detection.

## Quick Start
1. Run `./start.sh` to begin setup and start the application
2. Visit http://localhost:5000 to access the security dashboard
3. Configure your database and API keys in `.env` (see `.env.example`)

## Features
- Real-time security monitoring with AI analysis
- Comprehensive threat intelligence dashboard
- Attack pattern detection and classification
- Geographic threat distribution analysis
- Security configuration management
- Persistent data storage with PostgreSQL

## Documentation
See `DEPLOYMENT.md` for complete setup and configuration instructions.

## System Requirements
- Node.js 18+
- PostgreSQL database
- 2GB+ RAM recommended
- OpenAI API key (optional)
EOF

echo "Creating deployment package..."
tar -czf "${ZIP_NAME%.zip}.tar.gz" "$DEPLOY_DIR" --exclude="*.DS_Store*"

# Clean up
rm -rf "$DEPLOY_DIR"

echo "✅ Deployment package created: ${ZIP_NAME%.zip}.tar.gz"
echo ""
echo "Package Contents:"
echo "- Complete HoneyShield source code"
echo "- Deployment documentation and guides"
echo "- Startup and build scripts"
echo "- Environment configuration templates"
echo "- Database schema and migrations"
echo ""
echo "Ready for deployment!"
echo "Extract the zip file and run './start.sh' to begin"
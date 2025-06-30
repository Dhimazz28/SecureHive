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

# HoneyShield Security Platform

## Overview

HoneyShield is a comprehensive security platform that combines honeypot technology with AI-powered threat analysis. The application provides real-time monitoring of security threats, intelligent pattern recognition, and automated analysis of attack vectors. It's built as a full-stack web application with a modern React frontend and Express.js backend, utilizing PostgreSQL for data persistence and OpenAI for advanced threat analysis.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom cybersecurity theme
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured error handling
- **Real-time Updates**: Polling-based updates for live data

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Storage Strategy**: In-memory storage for development with database fallback

## Key Components

### Data Models
1. **Traffic Logs**: Real-time security event data with IP tracking, attack classification, and payload analysis
2. **Attack Patterns**: AI-identified threat patterns with confidence scoring and status tracking
3. **AI Analysis Results**: OpenAI-powered analysis results with risk assessment and recommendations
4. **System Metrics**: Real-time dashboard metrics for security monitoring
5. **Dataset Stats**: Machine learning dataset statistics and model performance tracking

### Core Services
1. **AI Analyzer Service**: OpenAI GPT-4o integration for intelligent threat analysis
2. **Mock Data Generator**: Realistic security data simulation for development and testing
3. **Real-time Data Processing**: Continuous generation and analysis of security events

### Frontend Components
1. **Dashboard Overview**: Real-time metrics, attack distribution, and threat summaries
2. **Traffic Logs**: Filterable, paginated security event monitoring
3. **AI Analysis**: Attack pattern management and AI-powered insights
4. **Sidebar Navigation**: Intuitive navigation between security modules

## Data Flow

1. **Data Generation**: Mock data service generates realistic security events
2. **AI Processing**: OpenAI analyzes traffic logs for threat patterns and risk assessment
3. **Database Storage**: Structured data storage in PostgreSQL with Drizzle ORM
4. **API Layer**: Express.js serves data through RESTful endpoints
5. **Frontend Updates**: React Query manages real-time data fetching and caching
6. **User Interface**: Responsive dashboard displays security insights and controls

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database (Neon serverless configuration)
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection**: Environment-based DATABASE_URL configuration

### AI & Analytics
- **OpenAI GPT-4o**: Advanced threat analysis and pattern recognition
- **API Integration**: Secure API key management for AI services

### UI & Styling
- **Shadcn/UI**: Modern component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Lucide Icons**: Consistent icon system throughout the application

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code quality and formatting (implied)

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite development server with real-time updates
- **Environment Variables**: DATABASE_URL and OPENAI_API_KEY configuration

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Static Assets**: Express serves built frontend from public directory

### Database Management
- **Migrations**: Drizzle Kit manages schema changes
- **Seeding**: Mock data service initializes development data
- **Connection**: Serverless PostgreSQL with connection pooling

### Monitoring & Updates
- **Real-time Polling**: Automatic data refresh intervals (10-120 seconds)
- **Error Handling**: Structured error responses and user notifications
- **Performance**: Query optimization and efficient data fetching

## Changelog

```
Changelog:
- June 23, 2025. Initial honeypot security platform setup
- June 23, 2025. Enhanced AI analysis with advanced pattern detection:
  * Automatic new attack pattern detection with confidence scoring
  * Enhanced risk assessment with detailed security recommendations
  * Real-time anomaly detection for coordinated attacks
  * Rule-based fallback analysis for reliable operation
  * Geographic and payload-based threat intelligence
  * Multi-vector attack sequence detection
  * AI quota management with graceful degradation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Technical requirements: Complete honeypot system with dual dashboard interface
AI Analysis Features Required:
- Automatic detection of new attack patterns
- Risk scores and security recommendations  
- Confidence levels for threat detection
- Dataset management and updates
```
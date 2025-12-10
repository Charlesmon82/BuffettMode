# Buffett Investment Engine

## Overview

A stock analysis web application that implements Warren Buffett-style value investing metrics. The app allows users to scan individual stocks, screen entire sectors, and build simple portfolios using fundamental analysis calculations like ROE, ROIC, FCF Yield, and Debt-to-Equity ratios. It calculates intrinsic value and margin of safety to provide BUY/HOLD/AVOID ratings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables
- **Animations**: Framer Motion for UI animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Stock Data**: Yahoo Finance API via `yahoo-finance2` package for real-time financial data
- **Development Server**: Vite dev server with HMR proxied through Express

### Key API Endpoints
- `GET /api/scan/:ticker` - Analyze a single stock
- `GET /api/sector/:sectorName` - Screen all stocks in a sector
- `POST /api/portfolio` - Build a portfolio with capital allocation

### Data Flow
1. Frontend makes API requests via TanStack Query
2. Express backend handles requests and calls stock analyzer functions
3. Stock analyzer fetches real-time data from Yahoo Finance
4. Metrics are calculated (ROE, ROIC, FCF Yield, D/E ratio, intrinsic value)
5. Results returned with BUY/HOLD/AVOID ratings based on margin of safety

### Shared Code
- Schema definitions and types in `shared/schema.ts`
- Zod validation for API request validation
- TypeScript interfaces shared between frontend and backend

## External Dependencies

### Data Sources
- **Yahoo Finance** (`yahoo-finance2`): Real-time stock quotes, financial statements, and key statistics

### Database
- **PostgreSQL**: Configured via Drizzle ORM with `DATABASE_URL` environment variable
- **Drizzle ORM**: Database schema management and migrations
- **Note**: Current implementation uses real-time API calls; database available for future persistent storage needs

### UI Framework Dependencies
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library (new-york style)
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool with React plugin
- **esbuild**: Production server bundling
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay
# SmartAid - Medication Tracking Application

## Overview

SmartAid is a medication tracking application designed specifically for elderly users with accessibility-first principles. The application helps users manage their medication schedules, scan pills for identification, track adherence, and maintain a history of medication intake. The system emphasizes large touch targets, high-contrast design, and simple navigation optimized for users with mobility and vision considerations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript running on Vite
- **UI Library**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system optimized for accessibility
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

**Design Philosophy**: Accessibility-first design system with custom guidelines for elderly users
- Minimum font sizes of 18-20pt for body text, 28-32pt for headings
- Touch targets minimum 48x48px, preferably 56-64px
- High contrast color schemes with large spacing (24px padding standard)
- System fonts (Roboto for web, optimized for mobile platforms)

**Page Structure**:
- Home: Dashboard showing today's medications and adherence statistics
- Schedule: Full medication schedule with today/tomorrow tabs
- Scan: Camera interface for pill identification
- History: Log of past medication intake with filtering
- Settings: User preferences and caregiver management

**Component Architecture**: Reusable card-based components (MedicationCard, HistoryEntry, StatCard, PillIdentification) with consistent spacing and typography patterns.

### Backend Architecture

**Framework**: Express.js with TypeScript
- **API Pattern**: RESTful JSON API with `/api` prefix
- **Request Logging**: Custom middleware logging API requests with duration and response data
- **Error Handling**: Centralized error handling with appropriate HTTP status codes

**Storage Layer**: In-memory storage (MemStorage class) implementing IStorage interface
- Designed for easy migration to database-backed storage
- Sample data initialization for development
- CRUD operations for medications and medication logs

**Key Endpoints**:
- `GET /api/medications` - Retrieve all medications
- `GET /api/medications/:id` - Get specific medication
- `POST /api/medications` - Create new medication
- `GET /api/logs` - Get all medication logs
- `GET /api/logs/today` - Get today's logs
- `POST /api/logs` - Create medication log entry
- `POST /api/identify-pill` - Mock pill identification from image
- `GET /api/stats` - Adherence statistics

### Data Storage Solutions

**Current Implementation**: In-memory Map-based storage for rapid prototyping

**Database Schema** (Drizzle ORM definitions for PostgreSQL migration):
- **medications table**: Stores medication details including name, dosage, pill type, image URL, and scheduled times array
- **medication_logs table**: Tracks each medication event with scheduled time, taken time, status (taken/missed/pending), confidence score, and scanned pill type

**Migration Path**: Drizzle ORM configured with PostgreSQL dialect
- Schema defined in `shared/schema.ts` with Zod validation
- Connection via Neon serverless PostgreSQL driver
- Migration scripts in `migrations/` directory

### Authentication and Authorization

**Current State**: No authentication implemented - designed for single-user household deployment
**Future Considerations**: Session-based authentication for multi-user/caregiver access

### External Dependencies

**UI Components**: Radix UI primitives for accessible, unstyled components
- Dialog, Dropdown, Popover, Toast, Switch, Tabs, and form controls
- Ensures keyboard navigation and screen reader compatibility

**Image Assets**: Static pill images stored in `attached_assets/generated_images/`
- Eight pill types: white round tablet, blue oval capsule, yellow circular tablet, pink round pill, red-white capsule, orange oblong tablet, green capsule, beige oval tablet

**Development Tools**:
- Vite with React plugin for fast development
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- PostCSS with Tailwind and Autoprefixer

**Database Provider** (configured but not actively used):
- Neon serverless PostgreSQL via `@neondatabase/serverless`
- Drizzle ORM for type-safe database queries
- Connection pooling via `connect-pg-simple` for session management

**Pill Identification**: Mock implementation using random selection from pill database
- Returns pill name, type, image, confidence score (70-99%), and common usage
- Designed to be replaced with actual image recognition API (e.g., computer vision service)

**Date/Time Utilities**: `date-fns` for consistent date formatting and manipulation across the application

**Build System**:
- Production build: Vite for client bundle, esbuild for server bundle
- ESM module format throughout
- TypeScript strict mode with path aliases (`@/`, `@shared/`, `@assets/`)
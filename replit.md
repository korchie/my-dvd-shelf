# My DVD Shelf

## Overview

My DVD Shelf is a full-stack DVD collection management application built with React, Express.js, and PostgreSQL. The application allows users to manage their DVD collections with comprehensive features including barcode scanning, automatic movie data lookup via OMDB API, advanced filtering, search capabilities, and categorizing movies as either "owned" or "wishlist" items.

## Recent Changes (January 2025)

✓ Integrated OMDB API for automatic movie data lookup
✓ Implemented real barcode scanning using ZXing library
✓ Added dual-mode movie entry: barcode scan OR title search
✓ Enhanced UI with side-by-side scanning and search options
✓ Improved error handling for API key validation
✓ Added Google authentication using Replit Auth
✓ Migrated to PostgreSQL database with user-specific DVD collections
✓ Added landing page for unauthenticated users
✓ Implemented user profiles with authentication state management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Development**: Hot reload with Vite middleware integration

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Schema**: Three main entities - users (for Replit Auth), sessions (for auth sessions), and dvds (user-specific collections)
- **Storage Interface**: DatabaseStorage implementation with user-scoped operations
- **Authentication**: Replit Auth for Google OAuth integration

## Key Components

### Database Schema
- **Users**: Google user profiles with email, names, profile images (via Replit Auth)
- **Sessions**: PostgreSQL-backed session storage for authentication
- **DVDs**: User-specific movie collections with title, year, genre, director, status (owned/wishlist), poster URL, and barcode

### Frontend Components
- **Collection Management**: Main dashboard with grid/list views
- **Search & Filtering**: Real-time search with genre and status filters
- **Add/Edit Modal**: Form for creating and updating DVD records
- **Barcode Scanner**: Camera-based barcode scanning functionality
- **Statistics Dashboard**: Collection overview with counts and metrics

### Backend API Endpoints
- `GET /api/dvds` - Retrieve all DVDs with optional search/filter parameters
- `GET /api/dvds/:id` - Get single DVD by ID
- `POST /api/dvds` - Create new DVD record
- `PUT /api/dvds/:id` - Update existing DVD
- `DELETE /api/dvds/:id` - Remove DVD from collection

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Layer**: Express routes handle HTTP requests with proper error handling
3. **Data Validation**: Zod schemas validate incoming data on both client and server
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Response Handling**: Standardized JSON responses with error handling

## External Dependencies

### UI & Styling
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component styling variants

### Data & Forms
- TanStack Query for server state management
- React Hook Form for form handling
- Zod for schema validation and type safety
- Date-fns for date manipulation

### Database & Backend
- Drizzle ORM for database operations
- Neon serverless PostgreSQL driver
- Connect-pg-simple for session management

### Development Tools
- Vite with React plugin for development
- ESBuild for production bundling
- TypeScript for type safety
- Replit-specific plugins for development environment

## Deployment Strategy

### Development
- Vite dev server with HMR (Hot Module Replacement)
- Express server with middleware integration
- Environment-based configuration
- In-memory storage option for quick development

### Production Build
- Vite builds React client to `dist/public`
- ESBuild bundles Express server to `dist/index.js`
- Static file serving from built assets
- Database migrations handled via Drizzle Kit

### Environment Configuration
- Database URL configuration for PostgreSQL connection
- Session management with PostgreSQL backend
- CORS and security middleware setup
- Error handling with development-friendly error pages

The application follows a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The architecture supports both development flexibility and production scalability.
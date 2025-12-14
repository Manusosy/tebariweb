# Tebari - Plastic Hotspot Tracking System

A comprehensive web platform for tracking, monitoring, and managing plastic waste collection in coastal regions of Kenya. Built to enable field officers, operations teams, and recycling partners to collaborate on identifying and clearing plastic hotspots.

## Overview

Tebari is a full-stack application that connects field officers collecting plastic waste data with administrative teams for verification and partners for recycling operations. The system uses GPS coordinates, photo evidence, and material classification to track plastic accumulation zones.

## Features

- **Field Collection**: Mobile-friendly interface for field officers to report plastic findings with GPS coordinates and photo evidence
- **Hotspot Management**: Admin dashboard to create, monitor, and assign collection zones across coastal regions
- **Collection Verification**: Review and approve/reject field submissions with detailed inspection workflows
- **Officer Assignment**: Assign field officers to specific hotspots and monitor their activities
- **Analytics & Reporting**: Super admin dashboard with metrics, trends, and collection reports
- **Partner Portal**: View collection data and analytics for recycling operations
- **Role-Based Access**: Four distinct user roles with customized interfaces and permissions

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components (Shadcn UI)
- **State Management**: React Query (TanStack) for server state
- **Routing**: Wouter (lightweight SPA router)
- **Maps**: React Leaflet with OpenStreetMap
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives

### Backend
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy
- **Session Management**: express-session (memory/PostgreSQL store)
- **File Handling**: Multer for photo uploads (10MB limit)
- **ORM**: Drizzle ORM with type-safe queries
- **Database**: PostgreSQL (via Supabase)

### Database Schema
- **users**: System users with four roles (super_admin, admin, field_officer, partner)
- **hotspots**: Plastic concentration zones with GPS coordinates and status
- **collections**: Field submission records with metadata
- **collection_items**: Individual plastic material entries with weight data

## Project Structure

```
tebariweb/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Role-specific page components
│   │   │   ├── admin/        # Admin dashboard, submissions, zones
│   │   │   ├── field/        # Field officer collection form and submissions
│   │   │   ├── partner/      # Partner analytics views
│   │   │   ├── super-admin/  # Executive dashboard
│   │   │   └── login.tsx     # Authentication
│   │   ├── components/       # Reusable UI components
│   │   │   ├── map/          # Map visualization
│   │   │   ├── layout/       # Dashboard layout
│   │   │   └── ui/           # Shadcn UI primitives
│   │   ├── hooks/            # React hooks (useAuth, useToast)
│   │   ├── lib/              # Utilities (queryClient, types, utils)
│   │   └── index.css         # Global styles
├── server/                    # Express backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API endpoints
│   ├── auth.ts               # Authentication setup
│   ├── db.ts                 # Database client (Supabase)
│   ├── storage.ts            # Data layer implementation
│   ├── vite.ts               # Vite dev middleware
│   └── static.ts             # Static file serving (production)
├── shared/                    # Shared types and schemas
│   └── schema.ts             # Drizzle ORM schema and Zod validators
├── migrations/               # Database migrations
├── script/                    # Build and utility scripts
├── package.json              # Dependencies and scripts
├── drizzle.config.ts         # Database configuration
├── vite.config.ts            # Frontend build configuration
└── tsconfig.json             # TypeScript configuration
```

## User Roles & Workflows

### Field Officer
- Submit plastic collection records from the field
- Capture photo evidence and GPS location
- Select existing hotspots or report new areas
- Track submission history and status
- View assigned collection zones on map

### Admin (Ops Team)
- Create and manage collection zones (hotspots)
- Assign field officers to specific zones
- Review and verify/reject field submissions
- Update hotspot status (active, critical, cleared)
- View collections filtered by status
- Manage user accounts and suspension status

### Super Admin
- Executive-level dashboard with system-wide metrics
- Full access to all data and reports
- User role management
- System monitoring and analytics

### Partner (Recycler)
- View all collection submissions
- Access analytics on plastic types and volumes
- Monitor collection trends across hotspots
- Download reports for operational planning

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Manusosy/tebariweb.git
cd tebariweb
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_url
SESSION_SECRET=your_session_secret
NODE_ENV=development
PORT=5000
```

4. Apply database migrations:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start Express server with Vite dev middleware (development)
- `npm run dev:client` - Run Vite dev server only (frontend only)
- `npm run build` - Build client (Vite) and bundle server (esbuild) for production
- `npm run start` - Run production build
- `npm run check` - TypeScript type checking
- `npm run db:push` - Apply Drizzle ORM migrations to database

## API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate user
- `POST /api/logout` - End session
- `GET /api/user` - Get current authenticated user

### Hotspots
- `GET /api/hotspots` - List all hotspots
- `POST /api/hotspots` - Create new hotspot (admin only)
- `PATCH /api/hotspots/:id` - Update hotspot (admin only)
- `DELETE /api/hotspots/:id` - Delete hotspot (admin only)

### Collections
- `GET /api/collections` - List collections (filtered by user role)
- `POST /api/collections` - Submit new collection (multipart form data with image)
- `PATCH /api/collections/:id` - Update collection status (admin only)
- `DELETE /api/collections/:id` - Delete collection (field officer own submissions only)

### Users
- `GET /api/users` - List all users (admin only)
- `PATCH /api/users/:id` - Update user (admin only)

### File Uploads
- `GET /uploads/:filename` - Serve uploaded images

## Key Features Detail

### GPS & Location Tracking
- Real-time GPS coordinates captured during field collection
- Automatic location tagging for all submissions
- Map visualization with Leaflet (OpenStreetMap tiles)

### Photo Evidence
- Camera capture directly from browser
- Gallery upload option
- Geo-tagged photo storage
- 10MB file size limit

### Plastic Classification
- Support for 7 material types: PET, HDPE, PP, LDPE, PS, PVC, Other
- Weight tracking per material type
- Total weight aggregation per collection

### Submission Workflow
1. Field officer creates collection record
2. Submits with photo and material data
3. Admin reviews submission
4. Status updated to verified or rejected
5. Data available for partner analytics

## Development Notes

- Frontend built with Vite for fast HMR during development
- Backend uses tsx for TypeScript execution without compilation step
- Session-based authentication (credentials in browser session)
- File uploads stored locally in `/uploads` directory
- Database migrations managed with Drizzle Kit
- Type-safe database queries with Drizzle ORM

## Security Considerations

- Password hashing with scrypt (Node.js crypto module)
- Session-based CSRF protection via Passport
- Role-based access control on all API endpoints
- Request validation with Zod schemas
- Environment variables for sensitive configuration
- Secure cookie settings in production

## Deployment

Build for production:
```bash
npm run build
```

The build outputs:
- Client: `/dist/public` (Vite build)
- Server: `/dist/index.cjs` (esbuild bundle)

Start production server:
```bash
NODE_ENV=production node dist/index.cjs
```

## Contributing

Please follow the existing code style and submit pull requests with clear descriptions of changes.

## License

MIT

# Media Collection Manager

A comprehensive DVD/BluRay management website with the following features:

## Features

The following features are implemented in this management tool:

### Core Functionality
- EAN-13 barcode scanning (web interface)
- Comprehensive media fields: title, release year, genre, director, rating, EAN-13, format, cover image, loaned status, custom notes
- Custom badges for formats (4K UHD, BluRay, DVD), rating stars, cover art aspect ratio controls
- Docker and PostgreSQL integration
- Real-time multi-field search, genre/format/location filters, sorting toggles, grid/table view mode
- Backup export/import via JSON
- French translation
- Multi-movies boxset support with dynamic list manager
- Pagination for large collections
- Dedicated settings menu with configuration options
- Statistics dashboard showing collection metrics including release year, decade, and country distribution
- Smart field suggestions for genre, director, country, and rating fields
- PEGI ratings (3-18) and star ratings (0-10) for media items
- Edition types (Standard, Collector, Steelbook, etc.) for enhanced categorization
- Movie collections management - individual movies can be part of movie collections without being in a boxset (implemented using the existing BoxSet entity)
- TV Show and Season management with dedicated interfaces
- Wishlist/missing functionality for TV Shows and Movies with proper database storage
- Total number of seasons field for TV Shows
- Toggle to show/hide movies or TV shows

### Reporting & Analytics
- Detailed collection reports and exports (PDF, CSV) - *Implemented: CSV export available, TXT-based PDF export available*
- Collection value tracking over time - *Implemented: Tracks collection value history with API endpoints*
- Loan history tracking - *Implemented: Records and retrieves loan history with API endpoints*
- Collection growth analytics - *Implemented: Analyzes collection growth trends with API endpoints*

### Advanced Organization
- Movie collections management - individual movies can be part of movie collections without being in a boxset (implemented using the existing BoxSet entity for simplicity)
- TV Show and Season management with dedicated interfaces
- Wishlist/missing functionality for TV Shows and Movies with proper database storage
- Total number of seasons field for TV Shows
- Toggle to show/hide movies or TV shows


## Project Structure
```
media-collection-manager/
├── backend/           # NestJS backend with TypeScript
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── media/     # Media, BoxSet, Wishlist entities, services, and controllers
│   └── package.json
├── frontend/          # Next.js frontend with React
│   ├── pages/
│   │   └── index.js   # Main page with all functionality
│   ├── styles/
│   │   └── globals.css
│   └── package.json
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose installed

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Run `docker-compose up --build`

### Usage
1. Access the application at `http://localhost:8999`
2. Add media using the "Ajouter" button
3. Use filters and search to find specific items
4. Toggle loan status with the buttons
5. Manage boxsets using the "BoxSets" button
6. Export/import data using the respective buttons

## Backend API Endpoints
- `GET /api/media` - Get all media items
- `GET /api/media/:id` - Get a specific media item
- `POST /api/media` - Create a new media item
- `PUT /api/media/:id` - Update a media item
- `DELETE /api/media/:id` - Delete a media item
- `GET /api/media/search?q=&format=&genre=&country=&year=&loaned=` - Search media items
- `GET /api/media/genres` - Get all genres
- `GET /api/media/formats` - Get all formats
- `GET /api/media/years` - Get all years
- `GET /api/media/collections` - Get all collections
- `POST /api/media/boxsets` - Create a new boxset
- `POST /api/media/boxsets/:boxSetId/media/:mediaId` - Add media to boxset
- `DELETE /api/media/boxsets/:boxSetId/media/:mediaId` - Remove media from boxset
- `GET /api/media/boxsets` - Get all boxsets
- `POST /api/media/export` - Export data as JSON
- `GET /api/media/export/csv` - Export data as CSV
- `GET /api/media/export/pdf` - Export data as TXT-based PDF report
- `POST /api/media/import` - Import data from JSON
- `POST /api/media/loan/:mediaId` - Record a loan for a media item
- `POST /api/media/loan/:loanId/return` - Record the return of a loaned item
- `GET /api/media/loan-history` - Get complete loan history
- `GET /api/media/loan-history/:mediaId` - Get loan history for a specific media item
- `POST /api/media/collection-value` - Record current collection value
- `GET /api/media/collection-value/history` - Get collection value history
- `GET /api/media/collection-growth-analytics` - Get collection growth analytics

## Technologies Used
- Backend: NestJS, TypeScript, PostgreSQL, TypeORM
- Frontend: Next.js, React, Tailwind CSS, Framer Motion
- Containerization: Docker, Docker Compose
- UI Icons: React Icons
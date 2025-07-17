# Emergency Management and Coordination System

The Emergency Management and Coordination application is a complete, end-to-end, enterprise-class disaster management application. Developed with PostgreSQL , PostGIS , Next.js, and Python Flask , it's an open-source coordination platform that collects and visualizes real-time disaster data. It aims to streamline disaster management by tracking global earthquake, fire, and tsunami data. Designed with an enterprise-level architecture, the system aims to facilitate holistic disaster management and enhance coordination among units.

![ Main Dashboard]( assets / screenshots /dashboard-main.png)

[![Next.js]( https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js )]( https://nextjs.org/)
[![ TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript )]( https://www.typescriptlang.org/)
[![ Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma )]( https://www.prisma.io/)
[![ PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791?style=flat-square&logo=postgresql )]( https://www.postgresql.org/)
[![ Ant Design]( https://img.shields.io/badge/Ant%20Design-5.0-0170FE?style=flat-square&logo=ant-design )]( https://ant.design/)
[![ Apache 2.0]( https://img.shields.io/badge/License-Apache%202.0-blue.svg )]( https://opensource.org/licenses/Apache-2.0)
[![ BSD 3- Clause]( https://img.shields.io/badge/License-BSD%203-- Clause-blue.svg )]( https://opensource.org/licenses/BSD-3-Clause)

## Contents

- [ Project About]( #-project-about)
- [ Featured Features]( #-featured-features)
- [ System Architecture]( #️-system-architecture)
- [ System Modules and Screenshots]( #-system-modules-and-screenshots)
- [ Setup ](#-setup)
- [ Technology [Stack]( #-technology-stack)
- [ API Endpoints ]( #-api-endpoints)
- [ Database [Schema]( #️-database-schema)
- [ Security and Roles ]( #-security-and-roles)
- [ Development Process]( #-development-process)
- [ Roadmap ](#-roadmap)
- [ Contribution Providing]( #-contribution-providing)
- [ License ](#-license)
- [ Contact ](#-contact)

# # About the Project

The Emergency Management and Coordination System is a comprehensive, open-source platform developed for global disaster management. Built using modern web technologies, the system tracks global earthquake, fire, and tsunami data in real time, facilitating disaster management.

## # Main Goals

- **Global Coverage**: Tracking and management of disaster data worldwide
- ** Real-Time Monitoring **: Track live earthquake, fire and tsunami data
- **Organizational Structure**: Scalable architecture for large organizations
- ** Coordination **: Effective communication and coordination between units
- ** Data Analysis **: Comprehensive reporting and analysis tools

# # Featured Features

- **Global data integration**: NASA FIRMS, USGS, EMSC, Tsunami Alert services
- **Map-based visualization**: Mapbox GL JS and Leaflet -powered dashboard
- **Warehouse and inventory management**: Detailed category, infrastructure and condition systems
- **Equipment and inventory tracking**: Tracking by brand, model, serial number and maintenance records
- **Container and tent city management**: Infrastructure and logistics support for shelter areas
- **Personnel and volunteer management**: Role-based assignment, communication and task matching
- **Mission planning and management**: Scheduling and tracking of emergency operations
- **District management**: Hierarchical geographic structure, color map overlays according to emergency levels
- **Log management**: Control of system operations and error tracking
- **Reporting tools**: Visual and textual outputs based on data analysis
- **Settings module**: System configuration and user preferences management
- **Security structure**: Role and authority-based access control (RBAC)
- ** Geographic data analysis with PostGIS **: 31+ tables and advanced query support
- **Smart caching system**: Fast data access based on JSON files

# # System Architecture


```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Veritabanı    │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │   + PostGIS     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Harita Servisi │    │  Dış API'ler    │    │  Cache Sistemi  │
│ (Mapbox/Leaflet)│    │ (NASA/USGS/EMSC)│    │     (JSON)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## # Data Flow
1. **External APIs ** → Cron services → Cache → Database
2. **User Requests** → Next.js API Routes → Prisma ORM → PostgreSQL
3. **Real-Time Updates** → WebSocket → Frontend Components

# # System Modules and Screenshots

## # Main Dashboard
The main dashboard is designed for real-time viewing of critical system-wide data.

![ Main Dashboard]( assets / screenshots /dashboard-overview.png)

** Features:* *
- Real-time disaster data (earthquake, fire, tsunami)
- Statistical summary cards
- Quick access menu
- Notification center
- System status indicators

## # Map Module
Interactive map system visualizing global disaster data.

![ Map Module]( assets / screenshots /map-module.png)

** Features:* *
- Mapbox GL JS and Leaflet integration
- Real-time earthquake, fire and tsunami data
- Layered map views
- Geo-filtering and search
- Popup detail information

## # Regional Management
Module where the hierarchical geographical structure is managed and emergency levels are determined.

![ Region Management]( assets / screenshots /regions-management.png)

** Features:* *
- Country, city, district hierarchy
- Emergency level assignment (CRITICAL, HIGH, MEDIUM, LOW)
- Colorful map overlays
- Geographic coordinate management
- Region-based statistics

## # Personnel Management
The system in which the corporate personnel structure is organized and job assignments are made.

![ Personnel Management]( assets / screenshots /personnel-management.png)

** Features:* *
- Role-based personnel records
- Department and position assignments
- Contact information management
- Task history tracking
- Performance evaluation

### Warehouse Management
Comprehensive inventory system that coordinates the storage and distribution of disaster supplies.

![ Warehouse Management]( assets / screenshots /warehouse-management.png)

** Features:* *
- Multi-warehouse management
- Stock tracking and warning system
- Transfer and transportation coordination
- Warehouse personnel management
- Vehicle fleet tracking
- Detailed reporting

## # Equipment Management
Module where the tracking, maintenance and distribution of emergency equipment is managed.

![ Equipment Management]( assets / screenshots /equipment-management.png)

** Features:* *
- Equipment categories and subcategories
- Brand, model, serial number tracking
- Maintenance planning and history
- Usage status monitoring
- Reservation system

## # Inventory Management
A system that tracks general material and resource inventory in detail.

![ Inventory Management]( assets / screenshots /inventory-management.png)

** Features:* *
- Category-based inventory classification
- Unit and quantity tracking
- Expiration date warnings
- Minimum stock limits
- Supplier information

## # Container /Tent City Management
A comprehensive system for coordinating the establishment and management of temporary shelters.

![ Container City Management]( assets / screenshots / container-camps.png)

** Features:* *
- Urban establishment and planning
- Infrastructure management (water, electricity, sewerage)
- Camp recording and tracking
- Service coordination (health, education, social)
- City personnel management
- Logistics and material distribution

## # Task Management
Mission coordination system for planning and monitoring emergency operations.

![ Task Management]( assets / screenshots /task-management.png)

** Features:* *
- Creating and assigning tasks
- Priority level determination
- Progress tracking
- Timetable management
- Task dependencies
- Completion reports

## # Notification Center
A central notification system where important system-wide events and alerts are managed.

![ Notification Center]( assets / screenshots /notifications.png)

** Features:* *
- Real-time notifications
- Priority-based classification
- Automatic warning systems
- Notification history
- Personalized alerts

## # Volunteer Management
The system by which volunteer coordination and training programs are managed.

![ Volunteer Management]( assets / screenshots /volunteers-management.png)

** Features:* *
- Volunteer registration and profile management
- Skill and certification tracking
- Training modules and programs
- Mission matching system
- Volunteer store
- Group organization

## # Reporting System
Comprehensive reporting module where system data is analyzed and reported.

![ Reporting System]( assets / screenshots /reports-module.png)

** Features:* *
- Customizable report templates
- Graphical and visual analysis tools
- PDF and Excel export
- Creating timely reports
- Statistical analysis
- Performance metrics

## # Planning Module
Strategic planning system in which pre-disaster preparedness and response plans are created.

![ Planning Module]( assets / screenshots /planning-module.png)

** Features:* *
- Scenario-based planning
- Resource allocation planning
- Creating a timeline
- Risk assessment matrices
- Plan versioning
- Simulation support

## # Log Management
Log tracking system where system operations are recorded and audited.

![ Log Management]( assets / screenshots /logging-module.png)

** Features:* *
- Detailed system logs
- User transaction history
- Error tracking and analysis
- Security logs
- Performance metrics
- Log filtering and searching

## # System Settings
Settings module where system configuration and user preferences are managed.

![ System Settings]( assets / screenshots / settings-module.png)

** Features:* *
- User profile settings
- System configuration
- Notification preferences
- Security settings
- Backup configuration
- API configuration

## # Profile Management
Profile system where user account information and personal preferences are managed.

![ Profile Management]( assets / screenshots /profile-management.png)

** Features:* *
- Personal information update
- Change password
- Profile photo management
- Communication preferences
- Security settings
- Account history

# # Setup

### Requirements

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+ ( with PostGIS )
- Go

### Project Startup

``` bash
git clone < repository -url>
CD emergency management
npm install
npx prism generate
npx prism db push
node scripts /add-users.js
npm run dev
```

### Database Setup

``` bash
createdb emergency_management
psql -d emergency_management -c "CREATE EXTENSION postgis ;"
psql -d emergency_management -c "CREATE EXTENSION postgis_topology ;"
```

### Environment Variables

Create a ` .env .local` file:

``` env
DATABASE_URL="postgresql://username:password@localhost:5432/emergency_management"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=" your-secret-key "
MAPBOX_ACCESS_TOKEN=" your-mapbox-token "
```

# # Technology Stack

| Layer | Technology |
|-------------------|-------------------------|
| Backend | Python Flask API |
| Frontend | Next.js ( React based) |
| Database | PostgreSQL + PostGIS |
| ORM | Prisma ORM |
| Map System | Mapbox GL JS, Leaflet |
| Authentication | NextAuth.js |
| UI Framework | Ant Design |
| Style | Tailwind CSS |

# # API Endpoints

- `/ api / earthquakes `: Earthquake data
- `/ api / fires / all `: Fire data
- `/ api /tsunami- alerts `: Tsunami warnings
- `/ api / notifications` : Notification service
- `/ api / cache / earthquakes` : Earthquake data from cache
- `/ api / cache / fires` : Fire data from cache
- `/ api / regions `: Region management
- `/ api / personnel `: Personnel management
- `/ api / equipment `: Equipment management
- `/ api / warehouse` : Warehouse management
- `/ api / tasks` : Task management

# # Database Schema

The system uses a comprehensive data model with 31+ tables:

### Main Tables
- ` users `: User management
- ` regions `: Region hierarchy
- ` equipment `: Equipment tracking
- ` warehouse `: Warehouse management
- ` inventory `: Inventory system
- ` tasks `: Task management
- ` notifications `: Notification system

### Geographic Tables ( PostGIS )
- ` geonames `: Global geographic data (95 countries, 8,740 cities, 973 counties)
- ` earthquake_zones `: Earthquake zones
- ` coordinates `: Coordinate data

### Data Statistics
- ** Total Geographic Records **: 9,808
- ** Number of Countries **: 95
- ** Number of Cities **: 8,740
- ** Number of Districts **: 973

# # Security and Roles

The system uses role-based access control (RBAC):

- **ADMIN**: Full system access
- **MANAGER**: Institution management
- **REGIONAL_MANAGER**: Regional management
- **STAFF**: Operational staff
- **VOLUNTEER**: Volunteer users

# # Development Process

### Code Standards
- TypeScript usage is mandatory
- ESLint and Prettier configuration
- Conventional Commits standard
- Code review process

### Testing Strategy
- Unit tests (Jest)
- Integration tests
- E2E tests ( Playwright )
- API tests

# # Roadmap

### v2.0 Goals
- [ ] Mobile application development
- [ ] AI-supported risk analysis
- [ ] Blockchain -based resource tracking
- [ ] IoT sensor integration
- [ ] Multi-language support

### v1.5 Targets (Current)
- [x] Real-time map system
- [x] Comprehensive inventory management
- [x] Role-based access control
- [x] PDF reporting system
- [x] Notification center

# # Contribution

To contribute, follow these steps:

1. Fork the project
2. A new feature Create a branch: ` git checkout -b feature / NewFeature`
3. Commit your changes : `git commit -m 'New feature added'`
4. Branch push : `git push origin feature / New Feature `
5. Pull Open a request

See `CONTRIBUTING.md` and `CLA.md` for more information.

# # Licence

This software is available under the **Apache 2.0** and **BSD 3-Clause** licenses. Users can choose the license they want.

### Apache 2.0 License
The Apache 2.0 license provides broad permissions for use in commercial and open source projects. It includes patent protection and legal protections for contributors.

### BSD 3-Clause License
The BSD 3-Clause license permits redistribution and use with minimal restrictions. It requires preservation of the original copyright notice and license text.

**Both licenses require that developer Mustafa Barış Arslantaş's copyright be protected and his name be associated with the project.* *

For detailed license texts:
- [Apache 2.0 License]( LICENSE-APACHE)
- [BSD 3-Clause License]( LICENSE-BSD)

# # Communication

For questions about the project, visit GitHub You can contact us through the Issues section or directly:

- **GitHub**: [ https://github.com/ArslantasM/Emergency_Management_and_Coordination_System]( https://github.com/ArslantasM/Emergency_Management_and_Coordination_System)
- **Email**: arslantas.m@gmail.com
- **Phone**: +90 542 559 69 46

# # Thanks

I would like to thank all volunteers who supported the idea, development process and contribution environment in this project that will benefit people on a global scale.

---

<div align="center">

Technological transformation in disaster management worldwide with the <strong>Emergency Management and Coordination System</strong>

🌟 <a href="https://github.com/ArslantasM/Emergency_Management_and_Coordination_System">Star Project</a> |
🐛 <a href="https://github.com/ArslantasM/Emergency_Management_and_Coordination_System/issues">Bug Report</a> |
✨ <a href="https://github.com/ArslantasM/Emergency_Management_and_Coordination_System/issues">Feature Request</a>

</div>







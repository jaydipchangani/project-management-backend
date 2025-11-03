# Project Management Backend

## Summary
A Node.js/Express-based RESTful API backend for a comprehensive project management system. The application provides role-based access control (Admin, ProjectManager, TeamMember) for managing projects, tasks, users, and related activities. It integrates MongoDB for persistent data storage and implements JWT authentication for secure API access.

## Structure
The project follows a modular MVC architecture with the following main directories:
- **src/controllers**: Business logic for API endpoints (auth, users, projects, tasks, dashboard)
- **src/models**: Mongoose schemas for Project, Task, User, and ActivityLog
- **src/routes**: API route definitions and endpoint configurations
- **src/middlewares**: Authentication, role-based authorization, and file upload handlers
- **src/config**: Database connection configuration
- **src/utils**: Helper functions like query builder for advanced filtering and pagination
- **uploads**: Directory for project document storage
- **.env**: Environment variables for configuration (PORT, MONGO_URI, JWT credentials)

## Language & Runtime
**Language**: JavaScript (ES6+)\
**Runtime**: Node.js\
**Module Type**: ES Modules (type: "module")\
**Build System**: Node.js native (no build step required)\
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- express (^5.1.0): Web framework for REST API
- mongoose (^8.19.2): MongoDB ODM for data modeling
- bcryptjs (^3.0.2): Password hashing and verification
- jsonwebtoken (^9.0.2): JWT token generation and verification
- multer (^2.0.2): File upload and multipart/form-data handling
- cors (^2.8.5): Cross-Origin Resource Sharing middleware
- dotenv (^17.2.3): Environment variable management

**Development Dependencies**:
- nodemon (^3.1.10): Automatic server restart on file changes

## Build & Installation

npm install

**Start Development Server**:
npm run dev

**Start Production Server**:
npm start


## Main Files & Entry Points
**Server Entry Point**: src/server.js
- Port: 5000 (configurable via PORT env variable)
- Starts the Express application and connects to MongoDB

**Application Setup**: src/app.js
- Middleware configuration (JSON parsing, CORS)
- Route registration for all API endpoints
- Static file serving for uploaded documents

**Database Connection**: src/config/db.js
- Mongoose connection to MongoDB Atlas
- Connection URI: MONGO_URI environment variable
- Automatic retry and error handling

## API Routes
**Authentication**: /api/auth (authRoutes)
- User registration, login, token validation

**Users**: /api/users (userRoutes)
- User profile management and role-based operations

**Projects**: /api/projects (projectRoutes)
- CRUD operations, team member management, document uploads
- Activity logging for all project changes

**Tasks**: /api/tasks (taskRoutes)
- Task creation, assignment, status tracking, and prioritization

**Dashboard**: /api/dashboard (dashboardRoutes)
- Analytics and overview data for users

**File Access**: /uploads (static serving)
- Project documents and uploaded files

## Configuration
**Environment Variables** (.env):
- PORT: Server port (default: 5000)
- MONGO_URI: MongoDB connection string (Atlas cluster)
- JWT_SECRET: Secret key for JWT signing
- JWT_EXPIRE: Token expiration duration (default: 1d)

## Project Data Models
**User**: Authentication, profiles, role-based access (Admin, ProjectManager, TeamMember) \
**Project**: Name, description, team members, status, created timestamp, documents \
**Task**: Associated with projects, assignment, status, priority, due dates \
**ActivityLog**: Tracks all project modifications with user and action details

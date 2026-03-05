# EduLattice - Online Learning Resource Sharing Platform

A full-stack web application for sharing and managing educational resources within an academic class. Built with the MERN stack (MongoDB, Express, React, Node.js), with all files securely stored on Cloudinary for optimal performance and reliability.

![EduLattice](https://img.shields.io/badge/EduLattice-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Features Demonstration](#-features-demonstration)
- [Security Features](#-security-features)
- [License](#license)

## ✨ Features

### User Management

- **Two-role system**: Student and Admin
- Secure authentication with JWT tokens
- Password hashing with bcrypt
- Protected routes and role-based access control
- Admin account management and user listing

### Resource Management

- **Upload multiple file types**: PDF, PPT, DOCX, XLSX, JPG, PNG
- **Cloudinary storage**: All files securely stored in the cloud with automatic optimization
- **Image grouping**: Upload up to 5 related images with a single UUID group ID (perfect for lecture notes, diagrams, etc.)
- **File size validation**:
  - Documents: max 25MB each
  - Images: max 10MB each, 50MB group total
- **Rich metadata**: Title, description, subject, semester, resource type
- **View & download tracking**: Automatic tracking of views and downloads for analytics
- **Security features**: Dangerous file type detection with descriptive error messages
- **File archival**: Users and admins can archive resources instead of deleting

### Search & Discovery

- Advanced keyword search across title, description, and subject
- Filter by subject, semester, and resource type
- Sort by date created, most viewed, or most downloaded
- Responsive table layout for all screen sizes
- File type badges and visual indicators
- Pagination support for large resource sets

### Admin Features

- View all resources and users with filtering
- Delete resources with cascade deletion from Cloudinary
- Archive/restore resources
- Platform statistics and analytics dashboard
- Subject and semester-wise resource distribution
- Track total views and downloads across platform

### Resource Analytics

- **View Tracking**: Track each time a resource is viewed
- **Download Tracking**: Track each time a resource is downloaded
- **Trending Resources**: Sort resources by views and downloads
- **Per-User Analytics**: See upload counts, view counts, and download activity

### Security

- JWT-based authentication with token expiration
- Password hashing with bcrypt (10 salt rounds)
- Input validation and sanitization on both frontend and backend
- CORS configuration for secure cross-origin requests
- Secure file upload handling with type validation
- Defense against dangerous file uploads (executables, scripts, etc.)
- Authorization middleware for protected resources
- Environment variable management for sensitive data
- Cloudinary API key protection with server-side uploads

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer with in-memory buffer handling
- **Cloud Storage**: Cloudinary SDK (documents, images, archives)
- **UUID Generation**: uuid v4 for unique file identification
- **Archiver**: For creating zip files of grouped resources
- **Session Management**: Token-based JWT authentication (1-hour expiry)

### Frontend

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React Context API for authentication

### Deployment

- **Backend**: Render.com
- **Frontend**: Render.com
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Cloudinary CDN

## 📁 Project Structure

```
EduLattice/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── resourceController.js # Resource management with view/download tracking
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & authorization
│   │   └── upload.js             # Multer configuration
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Resource.js           # Resource schema with views/downloads fields
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── resourceRoutes.js     # Resource endpoints with view tracking
│   ├── services/
│   │   └── cloudinary.js         # Cloudinary integration
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Application entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with user menu
│   │   │   ├── PrivateRoute.jsx  # Protected route wrapper
│   │   │   ├── AdminRoute.jsx    # Admin-only route wrapper
│   │   │   ├── ResourceCard.jsx  # Resource display card (deprecated)
│   │   │   ├── ResourceTable.jsx # Resource table with view tracking
│   │   │   └── DeleteConfirmationModal.jsx # Deletion confirmation UI
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication state management
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page with validation
│   │   │   ├── Register.jsx      # Registration page with validation
│   │   │   ├── Dashboard.jsx     # Main resource search and filtering
│   │   │   ├── Upload.jsx        # Resource upload form with validation
│   │   │   ├── MyUploads.jsx     # User's uploaded resources with deduplication
│   │   │   ├── AllResources.jsx  # Admin view of all resources
│   │   │   └── AdminPanel.jsx    # Admin dashboard with statistics
│   │   ├── constants/
│   │   │   ├── curriculum.js     # Subject and semester definitions
│   │   │   ├── uploadLimits.js   # File size and count limits
│   │   │   └── errorMessages.js  # Centralized error messages
│   │   ├── utils/
│   │   │   ├── api.js            # Axios configuration
│   │   │   └── fileValidation.js # Client-side file validation
│   │   ├── App.jsx               # Main app component with routing
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global Tailwind styles
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── postcss.config.js         # PostCSS configuration
│
└── scripts/
    └── generate-icons.js         # Utility script for icon generation
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (free tier)
- **Cloudinary account** (free tier)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Apurba-0001/edulattice.git
cd edulattice
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Create `.env` file** in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

2. **Configure environment variables**:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edulattice?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Setting Up Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier available)
2. Go to Dashboard
3. Copy **Cloud Name**, **API Key**, and **API Secret**
4. Add them to your `.env` file
5. Create a folder named `edulattice` in your Cloudinary media library (optional, for organization)

### Setting Up MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0 is sufficient)
3. Create a database user with strong password
4. Whitelist IP address (0.0.0.0/0 for development, specific IPs for production)
5. Get connection string and add to `.env`
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/edulattice?retryWrites=true&w=majority`

### Frontend Configuration

1. **Create `.env` file** in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

2. **Configure environment variables**:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, replace with your deployed backend URL:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### Production Build

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create account** on [Render](https://render.com/)

2. **Create new Web Service**
   - Connect your GitHub repository
   - Select `backend` directory (if monorepo, use root directory filter)
   - Configure build settings:
     ```
     Build Command: npm install
     Start Command: node server.js
     ```

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from `.env` file
   - For `FRONTEND_URL`, use your Render frontend deployment URL

4. **Deploy**
   - Render will automatically deploy your backend
   - Note the deployment URL (e.g., `https://edulattice-api.onrender.com`)

### Frontend Deployment (Render)

1. **Create account** on [Render](https://render.com/) (same as backend)

2. **Create new Web Service**
   - Connect your GitHub repository
   - Select `frontend` directory
   - Configure build settings:
     ```
     Build Command: npm install && npm run build
     Start Command: npm run preview
     ```
   - Or use with a static site if preferred (publish `dist` folder)

3. **Configure Environment Variables**
   - Go to Environment tab
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```

4. **Deploy**
   - Render will automatically build and deploy
   - Your frontend will be live at `https://your-frontend.onrender.com`
   - Note: Free tier services may take 15-30 seconds to spin up on first request

5. **Update Backend CORS**
   - Go back to Render backend environment variables
   - Update `FRONTEND_URL` with your Render frontend URL (e.g., `https://your-frontend.onrender.com`)
   - Redeploy backend for CORS changes to take effect

### Database (MongoDB Atlas)

MongoDB Atlas is already cloud-hosted. Ensure:

- Database user has proper permissions
- IP whitelist includes `0.0.0.0/0` (for production access)
- Connection string is correctly configured in environment variables

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

**Note:** `isAdmin` is always `false` on self-registration. Admin roles can only be assigned directly in the database.

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Login successful"
}
```

**Note:** JWT token expires in 1 hour. The token includes `lastActivity` tracking for monitoring user sessions.

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** This is a stateless logout. The client should discard the JWT token after receiving this response.

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Get All Users (Admin)

```http
GET /api/auth/users
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isAdmin": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Delete User (Admin)

```http
DELETE /api/auth/users/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** Admin users cannot be deleted through this endpoint. Use database administration tools to manage admin accounts.

### Resource Endpoints

#### Upload Resource (Single or Multiple)

```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file(s)>,              # 1-5 files (images) or 1 file (documents)
  "title": "Calculus Notes",
  "description": "Chapter 1-3 comprehensive notes",
  "subject": "Mathematics",
  "semester": "3rd",
  "resourceType": "Lecture Notes"
}
```

**Response** (includes imageGroupId for grouped uploads):

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fileId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Calculus Notes",
      "fileUrl": "https://res.cloudinary.com/...",
      "views": 0,
      "downloads": 0,
      "imageGroupId": "550e8400-e29b-41d4-a716-446655440001",
      "imageGroupCount": 3
    }
  ]
}
```

#### Get All Resources (with filters and sorting)

```http
GET /api/resources?subject=Mathematics&semester=3rd&keyword=calculus&sortBy=views&sortOrder=desc
Authorization: Bearer <token>
```

**Query Parameters:**

- `subject` (string) - Filter by subject
- `semester` (string) - Filter by semester
- `keyword` (string) - Search in title, description, subject
- `resourceType` (string) - Filter by resource type
- `sortBy` (string) - Sort by: `createdAt`, `title`, or `views`
- `sortOrder` (string) - `asc` or `desc`
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10)
- `includeArchived` (boolean) - Include archived resources

#### Get Single Resource

```http
GET /api/resources/:id
Authorization: Bearer <token>
```

#### Track Resource View

```http
POST /api/resources/:id/view
Authorization: Bearer <token>
```

**Called automatically when user clicks "View Details"**

#### Download Resource

```http
GET /api/resources/:id/download
Authorization: Bearer <token>
```

- Increments download count automatically
- Returns file from Cloudinary

#### Download Grouped Resources

```http
GET /api/resources/:id/download-group
Authorization: Bearer <token>
```

- Downloads all images in a group as ZIP file
- Increments download count for each image

#### Get My Uploads

```http
GET /api/resources/my/uploads?includeArchived=false
Authorization: Bearer <token>
```

#### Update Resource (Metadata Only)

```http
PUT /api/resources/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "subject": "Mathematics",
  "semester": "3rd",
  "resourceType": "Lecture Notes"
}
```

#### Delete Resource

```http
DELETE /api/resources/:id
Authorization: Bearer <token>
```

- Deletes from Cloudinary and database
- If part of group, deletes all grouped resources
- Returns deletion report

#### Get Statistics (Admin)

```http
GET /api/resources/stats/overview
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "byType": {
      "pdf": 60,
      "ppt": 45,
      "doc": 30,
      "excel": 10,
      "image": 5
    },
    "bySubject": [
      { "_id": "Mathematics", "count": 50 },
      { "_id": "Physics", "count": 40 }
    ],
    "bySemester": [
      { "_id": "1st", "count": 45 },
      { "_id": "2nd", "count": 50 }
    ]
  }
}
```

## 📸 Features Demonstration

You can test the application using the following test credentials:

**Admin Account:**

- Email: admin@edulattice.com
- Password: Admin@123456 (adjust to your actual test credentials)

**Student Account:**

- Email: student@edulattice.com
- Password: Student@123456 (adjust to your actual test credentials)

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters including uppercase, lowercase, number, and special character (@$!%\*?&)
- **Password Hashing**: bcrypt with 10 salt rounds (never stored in plain text)
- **JWT Authentication**: Secure token-based authentication with 1-hour token expiry and activity tracking
- **Rate Limiting**: Brute-force protection on authentication endpoints (configurable via environment variables)
- **Input Validation**: Comprehensive server-side validation for all inputs with descriptive error messages
- **NoSQL Injection Prevention**: Type checking and sanitization using express-mongo-sanitize
- **File Type Validation**:
  - Strict MIME type checking
  - Extension whitelist for safe file types
  - Dangerous extension detection (executables, scripts, archives with code)
  - Double-extension detection to prevent disguised malware
- **File Size Limits**:
  - Documents: 25MB max individual, enforced before upload
  - Images: 10MB max individual, 50MB max group total
- **CORS Protection**: Configured allowed origins for secure cross-origin requests
- **Authorization Middleware**: Resource-level access control (owner or admin can modify/delete)
- **XSS Protection**: React's built-in escaping of rendered content
- **Security Headers**: Helmet.js for HTTP security headers and CSP policies
- **Cloudinary Security**: API credentials stored server-side, never exposed to client
- **HTTPS Recommended**: Configuration for secure production deployment

### Dangerous File Types Blocked

- **Executables**: .exe, .bat, .cmd, .msi, .com, .scr, .pif
- **Scripts**: .sh, .bash, .ps1, .vbs, .js, .py, .rb
- **Archives**: .zip, .rar, .7z, .tar, .gz, .iso (may contain executables)
- **Libraries**: .dll, .so, .dylib
- **Office Macros**: .docm, .xlsm, .pptm
- **Java**: .jar, .class, .jnlp

## 🧪 Testing

### Test User Accounts

After installation, you can:

1. Create test accounts through the registration page
2. Use different users to test resource sharing and access control
3. Log in as both student and admin roles to verify role-based features

### Testing Core Features

1. **Authentication**
   - Register a new user account
   - Login with registered credentials
   - Verify JWT token is issued on successful login
   - Test invalid credentials handling

2. **Resource Upload**
   - Upload single document (PDF, PPT, DOCX, XLSX)
   - Upload multiple images (up to 5 grouped together)
   - Verify file size limits are enforced
   - Check metadata is saved correctly

3. **File Management**
   - Upload files and verify they appear in "My Uploads"
   - View resource details
   - Download resources (increments download count)
   - Archive resources instead of deleting
   - Test dangerous file type detection (blocked files)

4. **Search & Discovery**
   - Search resources by keyword
   - Filter by subject and semester
   - Sort by date, views, or downloads
   - Verify pagination works correctly

5. **View & Download Tracking**
   - Click "View Details" on a resource
   - Verify view count increments in real-time
   - Download a resource
   - Verify download count increments
   - Check that own uploads don't increment views/downloads

6. **Admin Features**
   - Admin Dashboard: View platform statistics
   - Admin Panel: Manage all resources and users
   - Delete resources as admin
   - View all registered users
   - Access filtering and search on admin pages

7. **File Size Validation**
   - Try uploading a document exceeding 25MB (should fail)
   - Try uploading 6+ images (should fail)
   - Try uploading 60MB+ of images in groups (should fail)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Development Guidelines

- Follow the existing code structure and patterns established in the project
- Maintain security standards: validate inputs on both client and server
- Use centralized error messages from `constants/errorMessages.js` (frontend)
- Add descriptive comments for complex business logic
- Test new features with sample data before committing
- Ensure no sensitive data (API keys, passwords) are committed
- Keep console.log statements minimal and use only for debugging during development
- Follow the architectural patterns shown in existing controllers and components
- Respect the role-based access control patterns (PrivateRoute, AdminRoute)

## 📚 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  isAdmin: Boolean (default: false, immutable after creation),
  lastActivity: Date (tracks last login time for activity monitoring),
  createdAt: Date,
  updatedAt: Date
}
```

### Resource Model

```javascript
{
  _id: ObjectId,
  fileId: String (UUID v4),
  title: String (required),
  description: String,
  subject: String,
  semester: String,
  resourceType: String,
  fileType: String (pdf, ppt, doc, excel, image),
  fileUrl: String (Cloudinary CDN URL),
  cloudinaryPublicId: String (for deletion),
  fileName: String (display name for download),
  storageFileName: String (unique Cloudinary filename),
  fileSize: Number (in bytes),
  uploadedBy: ObjectId (reference to User),
  views: Number (default: 0, incremented on view),
  downloads: Number (default: 0, incremented on download),

  // For grouped images (multiple images uploaded together)
  imageGroupId: String (UUID v4, null if not grouped),
  imageGroupCount: Number (total images in this group),
  imageGroupSize: Number (total size of all images in group),

  isArchived: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

- `{uploadedBy, createdAt}` - Quick lookup of user's uploads
- `{subject, semester}` - For filtered queries
- `{views: -1}` - For trending resources
- `{downloads: -1}` - For popular resources
- `{imageGroupId}` - For grouped image queries
- `{email: 1}` (unique) - User email lookups

## 🌟 Key Features Explained

### Image Grouping System

When users upload multiple images at once:

- All images receive the same `imageGroupId`
- First image of group is shown in listings (deduplicated)
- Download button on grouped images offers ZIP of all images
- Deleting one image deletes entire group by design

### View & Download Tracking

- **View Count**: Increments when user clicks "View Details"
- **Download Count**: Increments when user downloads file
- Tracked per resource in database
- Used for sorting and analytics
- Never incremented for user's own resources

### Dangerous File Detection

- **Backend validation**: Checks MIME type and extension
- **Descriptive errors**: Users told exactly why file is blocked
- **Double extension check**: Detects .jpg.exe style attacks
- **Whitelist approach**: Only known-safe types allowed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Apurba** - Project Creator and Lead Developer

## 🙏 Acknowledgments

- MongoDB for reliable cloud database platform
- Cloudinary for excellent file storage and CDN
- React team for outstanding JavaScript framework
- Node.js and Express community
- Render for seamless full-stack deployment platform

## 📞 Support & Issues

For bug reports, feature requests, or general support:

1. **GitHub Issues**: [Create an issue](../../issues/new) with detailed description
2. **Email**: support@edulattice.com
3. **Documentation**: Check existing docs before reporting

## 🚀 Future Enhancements

Potential improvements for future versions:

- [ ] Advanced resource filtering with more granular controls
- [ ] Bulk resource uploads with batch operations
- [ ] Resource comments and discussions
- [ ] User activity feed and notifications
- [ ] Enhanced search with full-text indexing
- [ ] Duplicate resource detection
- [ ] Resource tags and categorization system
- [ ] User profile customization
- [ ] Export analytics reports (CSV, PDF)
- [ ] API rate limiting customization per user tier

### Current Version

**v1.0.0** - Core functionality with Cloudinary storage, view/download tracking, image grouping, and admin dashboard

---

**Built with ❤️ for education by students, for students**

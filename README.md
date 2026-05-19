# 📚 EduLattice

<div align="center">

## Intelligent Learning Resource Sharing Platform

**A production-ready MERN platform that helps students share, discover, and manage academic resources with secure uploads, analytics, and role-based access.**

_Built for fast search, reliable storage, and a clean, classroom-friendly experience._

</div>

---

<div align="center">

### 🚀 Technology Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 🚀 Live Demo

https://edulattice.onrender.com

---

## ✨ Key Features

### 👥 Student Features

- 🔐 **Secure Authentication** - JWT-based login with protected routes
- 📤 **Resource Uploads** - PDF, PPT, DOCX, XLSX, JPG, PNG with strict validation
- 🔎 **Smart Discovery** - Search, filter, and sort by subject, semester, and type
- 📈 **Analytics Visibility** - View and download counts per resource
- 🗂️ **Personal Library** - My Uploads page with archive and cleanup tools

### ⚙️ Administrative Features

- 📊 **Admin Dashboard** - Overview of platform activity and resource distribution
- 👥 **User Management** - List users and manage access control
- 🧹 **Resource Moderation** - Archive, restore, or delete resources
- 🧾 **Audit-Friendly Actions** - Safe deletion with Cloudinary cleanup

### 🧠 Platform Highlights

- ☁️ **Cloudinary Storage** - Reliable CDN-backed file hosting
- 🖼️ **Image Grouping** - Upload up to 5 related images as a single group
- 🛡️ **Secure Upload Pipeline** - MIME/extension checks and dangerous file blocking
- 📱 **Responsive UI** - Optimized for mobile, tablet, and desktop

---

## 📚 Technology Stack

### 🎨 Frontend Architecture

|                                                      Technology                                                      | Purpose                        |
| :------------------------------------------------------------------------------------------------------------------: | :----------------------------- |
|            ![React](https://img.shields.io/badge/React%2018-61DAFB?logo=react&logoColor=black&style=flat)            | Component-based UI             |
|                ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=flat)                | Fast dev server and build tool |
| ![React Router](https://img.shields.io/badge/React%20Router%20v6-CA4245?logo=reactrouter&logoColor=white&style=flat) | Client-side routing            |
|   ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat)    | Utility-first styling          |
|              ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=flat)               | API communication              |

### 🔧 Backend Architecture

|                                                Technology                                                | Purpose               |
| :------------------------------------------------------------------------------------------------------: | :-------------------- |
|    ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat)     | Runtime environment   |
|  ![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=flat)   | RESTful API framework |
|     ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat)      | Database              |
|     ![Mongoose](https://img.shields.io/badge/Mongoose-800?logo=mongoose&logoColor=white&style=flat)      | ODM for MongoDB       |
|      ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat)       | Secure authentication |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white&style=flat) | File storage and CDN  |

### 🚀 Deployment Infrastructure

|                                                   Platform                                                    | Purpose                       |
| :-----------------------------------------------------------------------------------------------------------: | :---------------------------- |
|         ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white&style=flat)          | Frontend & Backend Deployment |
| ![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white&style=flat) | Database Hosting              |

---

## Project Architecture

### Directory Structure

```
edulattice/
│
├── backend/                        # Express API
│   ├── config/                     # DB configuration
│   ├── controllers/                # Business logic
│   ├── middleware/                 # Auth, validation, uploads
│   ├── models/                     # Mongoose schemas
│   ├── routes/                     # API endpoints
│   ├── services/                   # Cloudinary integration
│   ├── server.js                   # Entry point
│   └── package.json
│
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── context/                # Auth state
│   │   ├── pages/                  # Route pages
│   │   ├── utils/                  # API helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 📋 System Requirements

| Requirement            | Version           |
| :--------------------- | :---------------- |
| 🟢 **Node.js**         | v16+              |
| 📦 **npm** or **yarn** | Latest            |
| 🗄️ **MongoDB Atlas**   | Free tier account |
| ☁️ **Cloudinary**      | Free tier account |
| 📂 **Git**             | Latest            |

---

## ✅ Upload Limits

- **Documents**: 25MB max per file
- **Images**: 10MB max per file
- **Image Groups**: 5 images max, 50MB total

---

## 🎯 Getting Started

### 1️⃣ Repository Setup

```bash
git clone https://github.com/Apurba-0001/edulattice.git
cd edulattice
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**Backend `.env` example:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edulattice?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

**Frontend `.env` example:**

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Run Locally

```bash
cd backend
npm run dev
```

```bash
cd ../frontend
npm run dev
```

Backend: `http://localhost:5000`  
Frontend: `http://localhost:5173`

---

## 🔌 API Reference

### 🔐 Authentication

| Method | Endpoint             | Description   | Auth        |
| ------ | -------------------- | ------------- | ----------- |
| POST   | `/api/auth/register` | Register user | No          |
| POST   | `/api/auth/login`    | Login         | No          |
| GET    | `/api/auth/me`       | Current user  | Yes         |
| GET    | `/api/auth/users`    | List users    | Yes (Admin) |

### 📚 Resources

| Method | Endpoint                      | Description                 | Auth |
| ------ | ----------------------------- | --------------------------- | ---- |
| POST   | `/api/resources`              | Upload resource(s)          | Yes  |
| GET    | `/api/resources`              | List resources with filters | Yes  |
| GET    | `/api/resources/:id`          | Resource details            | Yes  |
| POST   | `/api/resources/:id/view`     | Track view                  | Yes  |
| GET    | `/api/resources/:id/download` | Download resource           | Yes  |

---

## 🔑 Demo Credentials

Use seeded accounts if your deployment provides them.

```
Admin Email:    admin@edulattice.com
Admin Password: Admin@123456

Student Email:  student@edulattice.com
Student Password: Student@123456
```

---

## 🚀 Deployment Guide

### Deploy Backend (Render)

1. Create a Render Web Service (root: `backend`)
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Add environment variables from backend `.env`

### Deploy Frontend (Render)

1. Create a Render Web Service (root: `frontend`)
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run preview`
4. Add `VITE_API_URL` pointing to the backend URL

---

## 🔒 Security Best Practices

- Passwords hashed with bcrypt
- JWT auth with protected routes
- Input validation and sanitization
- File type and size enforcement
- Role-based access control for admin actions

---

## 🧩 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🗺️ Roadmap

- [ ] Resource tagging and categorization
- [ ] Comments and discussion threads
- [ ] Enhanced analytics exports (CSV/PDF)
- [ ] Advanced search and full-text indexing
- [ ] Notifications and activity feed

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Apurba Maji** - Full Stack Developer

---

_Last Updated: May 2026_

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

# EduLattice - Online Learning Resource Sharing Platform

A full-stack web application for sharing and managing educational resources within an academic class. Built with the MERN stack, integrated with Google Drive API for documents and Cloudinary for images.

![EduLattice](https://img.shields.io/badge/EduLattice-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

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
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Management

- **Two-role system**: Student and Admin
- Secure authentication with JWT tokens
- Password hashing with bcrypt
- Protected routes and role-based access control

### Resource Management

- **Upload multiple file types**: PDF, PPT, DOCX, JPG, PNG
- **Smart storage routing**:
  - Documents (PDF, PPT, DOCX) → Google Drive
  - Images (JPG, PNG) → Cloudinary
- **Video blocking**: Explicit validation to prevent video uploads
- File size validation (Documents: 20MB max, Images: 5MB max)
- Rich metadata: title, description, subject, semester, tags

### Search & Discovery

- Keyword search across title, description, and subject
- Filter by subject, semester, and tags
- Responsive grid layout for resources
- File type badges and visual indicators

### Admin Features

- View all resources and users
- Delete any resource (with cascade deletion from cloud storage)
- Platform statistics and analytics
- Subject and semester-wise resource distribution

### Security

- JWT-based authentication
- Input validation and sanitization
- CORS configuration
- Secure file upload handling
- Environment variable management

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Cloud Storage**: Google Drive API, Cloudinary SDK
- **Validation**: express-validator

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with modern design

### Deployment

- **Backend**: Render
- **Frontend**: Vercel
- **Database**: MongoDB Atlas (Free Tier)

## 📁 Project Structure

```
EduLattice/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── resourceController.js # Resource management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & authorization
│   │   └── upload.js             # Multer configuration
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Resource.js           # Resource schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── resourceRoutes.js     # Resource endpoints
│   ├── services/
│   │   └── cloudinary.js         # Cloudinary integration
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Application entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation bar
    │   │   ├── PrivateRoute.jsx  # Protected route wrapper
    │   │   ├── AdminRoute.jsx    # Admin-only route wrapper
    │   │   └── ResourceCard.jsx  # Resource display card
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication state management
    │   ├── pages/
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Register.jsx      # Registration page
    │   │   ├── Dashboard.jsx     # Main resource listing
    │   │   ├── Upload.jsx        # Resource upload form
    │   │   ├── MyUploads.jsx     # User's uploaded resources
    │   │   └── AdminPanel.jsx    # Admin dashboard
    │   ├── utils/
    │   │   └── api.js            # Axios configuration
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # React entry point
    │   └── index.css             # Global styles
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (free tier)
- **Google Cloud Platform account** (for Drive API)
- **Cloudinary account** (free tier)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/edulattice.git
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

# Google Drive API
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Setting Up Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Drive API**
4. Create **Service Account** credentials
5. Download the JSON key file
6. Copy `client_email` and `private_key` to your `.env`
7. Create a folder in Google Drive
8. Share the folder with the service account email
9. Copy the folder ID from the URL and add to `.env`

### Setting Up Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy **Cloud Name**, **API Key**, and **API Secret**
4. Add them to your `.env` file

### Setting Up MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string and add to `.env`

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
   - For `FRONTEND_URL`, use your Vercel deployment URL

4. **Deploy**
   - Render will automatically deploy your backend
   - Note the deployment URL (e.g., `https://edulattice-api.onrender.com`)

### Frontend Deployment (Vercel)

1. **Create account** on [Vercel](https://vercel.com/)

2. **Import Project**
   - Connect GitHub repository
   - Select root directory or `frontend` folder
   - Framework Preset: Vite

3. **Configure Environment Variables**

   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-app.vercel.app`

5. **Update Backend CORS**
   - Go back to Render environment variables
   - Update `FRONTEND_URL` with your Vercel URL
   - Redeploy backend

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
  "password": "password123",
  "role": "student"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

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

### Resource Endpoints

#### Upload Resource

```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "title": "Calculus Notes",
  "description": "Comprehensive calculus study material",
  "subject": "Mathematics",
  "semester": "3rd",
  "tags": "calculus,derivatives,integrals"
}
```

#### Get All Resources (with filters)

```http
GET /api/resources?subject=Mathematics&semester=3rd&keyword=calculus
Authorization: Bearer <token>
```

#### Get Single Resource

```http
GET /api/resources/:id
Authorization: Bearer <token>
```

#### Get My Uploads

```http
GET /api/resources/my/uploads
Authorization: Bearer <token>
```

#### Delete Resource

```http
DELETE /api/resources/:id
Authorization: Bearer <token>
```

#### Get Statistics (Admin)

```http
GET /api/resources/stats/overview
Authorization: Bearer <token>
```

## 📸 Screenshots

### Login Page

User-friendly authentication interface with form validation.

### Dashboard

Browse all resources with search and filtering capabilities.

### Upload Resource

Simple form to upload educational materials with metadata.

### My Uploads

Manage your uploaded resources with delete functionality.

### Admin Panel

Comprehensive admin dashboard with statistics and user management.

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **File Type Validation**: Strict file type checking
- **File Size Limits**: Prevents large file uploads
- **CORS Protection**: Configured allowed origins
- **SQL Injection Prevention**: MongoDB with parameterized queries
- **XSS Protection**: React's built-in escaping

## 🧪 Testing

### Test User Accounts

After deployment, create test accounts:

**Admin Account:**

- Email: admin@edulattice.com
- Password: admin123
- Role: admin

**Student Account:**

- Email: student@edulattice.com
- Password: student123
- Role: student

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- MongoDB for the database platform
- Google Cloud for Drive API
- Cloudinary for image hosting
- Render and Vercel for deployment platforms

## 📞 Support

For support, email support@edulattice.com or open an issue on GitHub.

---

**Built with ❤️ for education**

# Quick Start Guide - EduLattice

Get EduLattice up and running in 10 minutes!

## Prerequisites

- Node.js 16+ installed
- Git installed
- Code editor (VS Code recommended)

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/edulattice.git
cd edulattice

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Setup Environment Variables (3 minutes)

### Backend Setup

1. Copy environment template:

```bash
cd backend
cp .env.example .env
```

2. Get free MongoDB Atlas database:
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Paste in `MONGODB_URI`

3. Get free Cloudinary account:
   - Visit: https://cloudinary.com
   - Get Cloud Name, API Key, API Secret
   - Add to `.env`

4. Setup Google Drive (detailed in DEPLOYMENT.md):
   - Create service account
   - Get credentials
   - Create shared folder
   - Add to `.env`

5. Generate JWT secret:

```bash
# Generate random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:

```env
JWT_SECRET=<your-generated-secret>
```

### Frontend Setup

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Run the Application (1 minute)

Open two terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

✅ Frontend running on http://localhost:5173

## Step 4: Create Your First Account (2 minutes)

1. Open browser: http://localhost:5173
2. Click "Register"
3. Fill in details:
   - Name: Test Admin
   - Email: admin@test.com
   - Password: Test@123
   - Role: Admin
4. Click "Register"
5. You're logged in! 🎉

## Step 5: Upload Your First Resource (2 minutes)

1. Click "Upload Resource"
2. Fill the form:
   - Title: Test PDF Document
   - Description: Testing the upload feature
   - Subject: Computer Science
   - Semester: 1st
   - Tags: test, pdf
   - File: Select any PDF file
3. Click "Upload Resource"
4. Resource uploaded! ✅

## Verify Everything Works

### Check Dashboard

- Navigate to "Dashboard"
- Your uploaded resource should appear
- Click "View" to open the file

### Check Google Drive

- Open your Google Drive folder
- PDF should be stored there

### Check Cloudinary

- Upload an image file
- Check Cloudinary dashboard
- Image should be stored there

### Check Admin Panel

- Click "Admin Panel"
- View statistics
- See all resources
- See all users

## Common Issues & Fixes

### Backend won't start

```bash
# Check MongoDB connection
# Verify .env file exists
# Ensure port 5000 is free
```

### Frontend won't start

```bash
# Check .env file exists
# Verify VITE_API_URL is correct
# Ensure port 5173 is free
```

### File upload fails

```bash
# Verify Google Drive/Cloudinary credentials
# Check file size (PDF/DOC: 20MB, Images: 5MB)
# Ensure file type is allowed
```

### MongoDB connection error

```bash
# Verify MongoDB Atlas connection string
# Check database user credentials
# Ensure IP whitelist includes 0.0.0.0/0
```

## Next Steps

- ✅ Read [README.md](README.md) for full documentation
- ✅ Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- ✅ Review [API_REFERENCE.md](API_REFERENCE.md) for API details
- ✅ Create more test accounts (students)
- ✅ Upload different file types
- ✅ Test search and filtering
- ✅ Explore admin features

## Quick Commands Reference

```bash
# Backend
npm run dev      # Start development server
npm start        # Start production server

# Frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Need Help?

- 📖 Read the documentation in README.md
- 🐛 Report issues on GitHub
- 💬 Check existing issues for solutions
- 📧 Contact: support@edulattice.com

---

**You're all set! Happy coding! 🚀**

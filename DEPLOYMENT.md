# Deployment Guide for EduLattice

This comprehensive guide will walk you through deploying EduLattice to production.

## Prerequisites Checklist

- [ ] GitHub account with repository
- [ ] MongoDB Atlas account (free tier)
- [ ] Google Cloud Platform account
- [ ] Cloudinary account (free tier)
- [ ] Render account (for backend)
- [ ] Vercel account (for frontend)

## Part 1: Setup Cloud Services

### 1.1 MongoDB Atlas Setup

1. **Create Cluster**

   ```
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up / Log in
   - Click "Build a Database"
   - Choose FREE (M0) tier
   - Select region closest to your users
   - Name cluster: "EduLattice"
   ```

2. **Create Database User**

   ```
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: edulattice_admin
   - Password: Generate secure password (save it!)
   - Database User Privileges: Read and write to any database
   - Add User
   ```

3. **Configure Network Access**

   ```
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
   ```

4. **Get Connection String**
   ```
   - Go to "Database" > "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace <password> with your database password
   - Format: mongodb+srv://edulattice_admin:<password>@edulattice.xxxxx.mongodb.net/edulattice?retryWrites=true&w=majority
   ```

### 1.2 Google Drive API Setup

1. **Create Project**

   ```
   - Go to https://console.cloud.google.com/
   - Click "Select a project" > "New Project"
   - Name: "EduLattice"
   - Click "Create"
   ```

2. **Enable Drive API**

   ```
   - In dashboard, click "Enable APIs and Services"
   - Search for "Google Drive API"
   - Click "Enable"
   ```

3. **Create Service Account**

   ```
   - Go to "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name: edulattice-service
   - Role: Project > Editor
   - Click "Done"
   ```

4. **Generate Keys**

   ```
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the file (KEEP IT SAFE!)
   ```

5. **Extract Credentials**

   ```
   Open downloaded JSON file and find:
   - "client_email": Copy this value
   - "private_key": Copy this value (includes -----BEGIN/END PRIVATE KEY-----)
   ```

6. **Create Google Drive Folder**
   ```
   - Go to https://drive.google.com/
   - Create new folder: "EduLattice Resources"
   - Right-click > Share
   - Add the service account email (from step 5)
   - Give "Editor" permission
   - Click on folder, copy ID from URL
   - URL: https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### 1.3 Cloudinary Setup

1. **Create Account**

   ```
   - Go to https://cloudinary.com/
   - Sign up for free account
   - Verify email
   ```

2. **Get Credentials**
   ```
   - Go to Dashboard
   - Find:
     * Cloud Name
     * API Key
     * API Secret
   - Copy these values
   ```

## Part 2: Backend Deployment (Render)

### 2.1 Prepare Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/edulattice.git
   git push -u origin main
   ```

### 2.2 Deploy to Render

1. **Create Web Service**

   ```
   - Go to https://render.com/
   - Sign up / Log in with GitHub
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Select "EduLattice" repository
   ```

2. **Configure Service**

   ```
   Name: edulattice-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend (if monorepo, otherwise leave blank)
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

3. **Choose Plan**

   ```
   - Select "Free" tier
   - Click "Create Web Service"
   ```

4. **Add Environment Variables**

   ```
   Click "Environment" tab and add:

   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-random-secret-32-chars>
   GOOGLE_DRIVE_CLIENT_EMAIL=<service-account-email>
   GOOGLE_DRIVE_PRIVATE_KEY=<private-key-with-newlines>
   GOOGLE_DRIVE_FOLDER_ID=<drive-folder-id>
   CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<cloudinary-api-key>
   CLOUDINARY_API_SECRET=<cloudinary-api-secret>
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **Important for GOOGLE_DRIVE_PRIVATE_KEY:**
   - Must include quotes and preserve newlines
   - Format: "-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"

5. **Deploy**
   ```
   - Save environment variables
   - Render will automatically deploy
   - Wait for deployment to complete
   - Note your backend URL: https://edulattice-backend.onrender.com
   ```

## Part 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. **Import Project**

   ```
   - Go to https://vercel.com/
   - Sign up / Log in with GitHub
   - Click "Add New..." > "Project"
   - Import your GitHub repository
   ```

2. **Configure Project**

   ```
   Project Name: edulattice
   Framework Preset: Vite
   Root Directory: frontend (if monorepo, otherwise leave ./)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**

   ```
   Click "Environment Variables" and add:

   VITE_API_URL=https://edulattice-backend.onrender.com/api
   ```

4. **Deploy**
   ```
   - Click "Deploy"
   - Wait for build to complete
   - Your app URL: https://edulattice.vercel.app
   ```

### 3.2 Update Backend CORS

1. **Update Render Environment**
   ```
   - Go back to Render dashboard
   - Select your backend service
   - Go to "Environment" tab
   - Update FRONTEND_URL=https://your-actual-vercel-url.vercel.app
   - Save changes (service will redeploy)
   ```

## Part 4: Testing Deployment

### 4.1 Backend Health Check

```bash
curl https://edulattice-backend.onrender.com/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "EduLattice API is running",
  "timestamp": "2026-01-26T..."
}
```

### 4.2 Create Test Accounts

1. **Visit your Vercel URL**
2. **Register Admin Account**
   - Name: Admin User
   - Email: admin@edulattice.com
   - Password: Admin@123
   - Role: Admin

3. **Register Student Account**
   - Name: Student User
   - Email: student@edulattice.com
   - Password: Student@123
   - Role: Student

### 4.3 Test Upload Flow

1. **Login as Student**
2. **Go to Upload Resource**
3. **Upload a PDF file**
   - Title: Test PDF
   - Description: Testing Google Drive integration
   - Subject: Testing
   - Semester: 1st
   - File: Any PDF < 20MB
4. **Verify**
   - Check Google Drive folder for uploaded file
   - Check resource appears in Dashboard

5. **Upload an Image**
   - Title: Test Image
   - Description: Testing Cloudinary integration
   - Subject: Testing
   - Semester: 1st
   - File: Any JPG/PNG < 5MB
6. **Verify**
   - Check Cloudinary dashboard for uploaded image
   - Check resource appears in Dashboard

### 4.4 Test Admin Features

1. **Login as Admin**
2. **Go to Admin Panel**
3. **Check Statistics** - Should show uploaded resources
4. **View All Resources** - Should list all resources
5. **View All Users** - Should show registered users
6. **Test Delete** - Delete a test resource, verify it's removed from cloud storage

## Part 5: Custom Domain (Optional)

### 5.1 Vercel Custom Domain

1. **Add Domain**
   ```
   - Go to Vercel project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions
   ```

### 5.2 Render Custom Domain

1. **Add Domain**

   ```
   - Go to Render service settings
   - Click "Custom Domains"
   - Add your API subdomain (api.yourdomain.com)
   - Update DNS records
   ```

2. **Update Environment Variables**
   ```
   Vercel: VITE_API_URL=https://api.yourdomain.com/api
   Render: FRONTEND_URL=https://yourdomain.com
   ```

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**

```
- Verify connection string format
- Check database user credentials
- Ensure IP whitelist includes 0.0.0.0/0
```

**Google Drive Upload Failed**

```
- Verify service account has access to folder
- Check private key format (must preserve newlines)
- Ensure Drive API is enabled
```

**Cloudinary Upload Failed**

```
- Verify credentials in environment variables
- Check Cloudinary dashboard for quota
- Ensure image size < 5MB
```

### Frontend Issues

**Cannot Connect to Backend**

```
- Verify VITE_API_URL is correct
- Check backend is deployed and running
- Verify CORS settings on backend
```

**Build Failed**

```
- Check all dependencies are installed
- Verify Node version compatibility
- Review build logs for specific errors
```

## Monitoring

### Render Monitoring

- View logs in Render dashboard
- Set up email notifications for deployment failures
- Monitor resource usage

### Vercel Monitoring

- View deployment logs
- Check Analytics for usage
- Monitor build times

### MongoDB Atlas Monitoring

- Monitor database connections
- Check storage usage
- Review performance metrics

## Maintenance

### Regular Tasks

- [ ] Monitor storage usage on Google Drive and Cloudinary
- [ ] Review MongoDB Atlas storage (free tier: 512MB limit)
- [ ] Check backend logs for errors
- [ ] Update dependencies monthly
- [ ] Backup database regularly

### Scaling Considerations

- Render free tier: Service may sleep after inactivity
- MongoDB free tier: 512MB storage limit
- Cloudinary free tier: 25 credits/month
- Consider upgrading for production use with 60+ students

---

## Quick Reference

**Backend URL**: `https://edulattice-backend.onrender.com`
**Frontend URL**: `https://edulattice.vercel.app`
**Database**: MongoDB Atlas
**File Storage**: Google Drive (docs), Cloudinary (images)

**Support**: For deployment issues, check service-specific documentation:

- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Deployment Complete! 🎉**

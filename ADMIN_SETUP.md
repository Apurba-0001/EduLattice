# Admin Dashboard Implementation Guide

## Overview

This guide explains the new admin dashboard system that uses an `isAdmin` field in MongoDB to determine admin access.

## Changes Made

### 1. Backend Changes

#### User Model (`backend/models/User.js`)

- **Removed**: `role` field with enum values ["student", "admin"]
- **Added**: `isAdmin` boolean field (default: false)

```javascript
isAdmin: {
  type: Boolean,
  default: false,
}
```

#### Auth Controller (`backend/controllers/authController.js`)

- Updated **register** endpoint to accept and store `isAdmin` field
- Updated **login** endpoint to return `isAdmin` instead of `role`
- Both endpoints now return the `isAdmin` flag in the response

**Register Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "isAdmin": false
}
```

**Register/Login Response:**

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "token": "jwt_token"
  }
}
```

### 2. Frontend Changes

#### Auth Context (`frontend/src/context/AuthContext.jsx`)

- Updated `isAdmin` check to use `user?.isAdmin === true` instead of `user?.role === "admin"`
- This ensures proper boolean evaluation

#### New Admin Dashboard (`frontend/src/pages/AdminDashboard.jsx`)

- Separate, dedicated admin interface (not shared with students)
- Features:
  - **Statistics Tab**: View total resources, users, total size, and subject count
  - **Resources Tab**: Browse and delete all resources
  - **Users Tab**: View all users with isAdmin status, join date, and delete users
- Responsive design with styled components
- Admin-only access via `AdminRoute` component

#### App Routes (`frontend/src/App.jsx`)

- Changed admin route to use new `AdminDashboard` component
- Route: `/admin` → `AdminDashboard`
- Protected by `AdminRoute` which checks `isAdmin` field

#### Navbar (`frontend/src/components/Navbar.jsx`)

- Already configured to show admin panel link only if `isAdmin === true`
- No changes needed, already uses `isAdmin` property

### 3. Database Migration Required

For existing users, you need to add the `isAdmin` field. Run this command in MongoDB or MongoDB Compass:

```javascript
// Add isAdmin field to all existing users (set as false by default)
db.users.updateMany({}, { $set: { isAdmin: false } });

// Set specific users as admin (replace with actual user emails)
db.users.updateMany(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } },
);

// Remove role field from all users (optional, for cleanup)
db.users.updateMany({}, { $unset: { role: "" } });
```

## Setup Instructions

### Step 1: Update Existing Users in MongoDB

1. Open MongoDB Atlas or MongoDB Compass
2. Connect to your database
3. Run the migration commands above to add `isAdmin` field to existing users

### Step 2: Restart the Backend

```bash
cd backend
npm start
```

### Step 3: Test the Implementation

#### Test Regular User Login

1. Log in with a regular user account
2. Verify you see: Dashboard, Upload Resource, My Uploads
3. Verify you DON'T see: Admin Panel link in navbar

#### Test Admin User Login

1. Log in with an admin account (isAdmin: true)
2. Verify you see: Admin Panel link in navbar
3. Click Admin Panel to access new admin dashboard

### Step 4: Create an Admin User (if needed)

**Option A: Using Backend API**

```bash
# Register with isAdmin flag
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "isAdmin": true
}
```

**Option B: Using MongoDB**

```javascript
db.users.updateOne(
  { email: "existing-user@example.com" },
  { $set: { isAdmin: true } },
);
```

## Admin Dashboard Features

### Statistics Tab (📊)

View system statistics:

- **Total Resources**: Count of all uploaded resources
- **Total Users**: Count of registered users
- **Total Size**: Total storage used
- **Subjects**: Count of unique subjects

### Resources Tab (📚)

Manage all resources:

- View all resources uploaded by any user
- Delete inappropriate or duplicate resources
- See resource details

### Users Tab (👥)

Manage all users:

- View all registered users
- See admin status (Admin/Student badge)
- See join date
- Remove users if necessary

## API Endpoints for Admin

### Get All Users

```
GET /api/auth/users
Authorization: Bearer <token>
```

Requires: `isAdmin: true`

### Get Stats

```
GET /api/resources/stats/overview
Authorization: Bearer <token>
```

Requires: `isAdmin: true`

### Delete User

```
DELETE /api/auth/users/:userId
Authorization: Bearer <token>
```

Requires: `isAdmin: true`

### Delete Resource

```
DELETE /api/resources/:id
Authorization: Bearer <token>
```

Requires: Admin user

## File Structure

```
backend/
├── models/
│   └── User.js                 (Updated: isAdmin field)
├── controllers/
│   └── authController.js       (Updated: isAdmin handling)
└── config/
    └── db.js                   (Already has DNS fix)

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx     (Updated: isAdmin check)
│   ├── pages/
│   │   ├── AdminDashboard.jsx  (NEW: Admin-only dashboard)
│   │   └── Dashboard.jsx       (Student dashboard - unchanged)
│   ├── components/
│   │   ├── AdminRoute.jsx      (Already uses isAdmin)
│   │   └── Navbar.jsx          (Already uses isAdmin)
│   └── App.jsx                 (Updated: AdminDashboard route)
```

## Security Notes

1. **AdminRoute Component**: Automatically redirects non-admin users to `/dashboard`
2. **Backend Middleware**: Auth middleware should verify `isAdmin` before granting access to admin endpoints
3. **Token-based**: Admin status stored in JWT token via user object
4. **Password**: User passwords are never exposed (select: false in schema)

## Testing Checklist

- [ ] Regular user can login and see student dashboard
- [ ] Regular user cannot access `/admin` route (redirected to `/dashboard`)
- [ ] Admin user can login and see Admin Dashboard link in navbar
- [ ] Admin user can access `/admin` route
- [ ] Admin can view statistics
- [ ] Admin can view and manage resources
- [ ] Admin can view and manage users
- [ ] Admin can delete resources and users
- [ ] Logout works for both regular and admin users

## Troubleshooting

### Admin Dashboard shows "Failed to fetch data"

- Verify backend auth middleware is allowing admin access
- Check that `isAdmin` field exists in database
- Verify JWT token contains correct user data

### Admin link not showing in navbar after login

- Clear localStorage: `localStorage.clear()`
- Log out and log back in
- Verify `isAdmin: true` in login response

### User can access admin routes without isAdmin

- Check `AdminRoute` component is protecting the route
- Verify backend middleware checks `user.isAdmin`
- Ensure token is not expired

## Future Enhancements

1. Admin settings/preferences page
2. User role promotion/demotion from admin panel
3. Audit logs for admin actions
4. Resource approval workflow
5. Analytics and reports dashboard
6. Backup and restore functionality

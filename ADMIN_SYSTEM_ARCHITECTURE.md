# Admin System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  POST /api/auth/login  │
         └────────────┬───────────┘
                      │
              ┌───────┴───────┐
              │               │
              ▼               ▼
        ┌─────────────┐  ┌──────────────┐
        │  Verify     │  │  Generate    │
        │  Password   │  │  JWT Token   │
        │             │  │              │
        └────┬────────┘  └──────┬───────┘
             │                  │
             └──────┬───────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │ Return User Object   │
        │ with isAdmin field   │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌─────────────┐       ┌──────────────┐
    │ isAdmin:    │       │ isAdmin:     │
    │   false     │       │   true       │
    │ (Student)   │       │ (Admin)      │
    └─────┬───────┘       └──────┬───────┘
          │                      │
          ▼                      ▼
   ┌────────────────┐    ┌──────────────────┐
   │  Dashboard     │    │ Admin Dashboard  │
   │  + Upload      │    │ - Statistics     │
   │  + MyUploads   │    │ - Resources      │
   │  + Resources   │    │ - Users          │
   │                │    │ - Management     │
   │ NO Admin link  │    │ + Admin link     │
   └────────────────┘    └──────────────────┘
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed, select: false),
  isAdmin: Boolean (default: false),  // ← NEW FIELD
  createdAt: Date,
  updatedAt: Date
}
```

### Examples in MongoDB

```javascript
// Regular Student
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$...", // hashed
  "isAdmin": false,
  "createdAt": ISODate("2024-01-01"),
  "updatedAt": ISODate("2024-01-01")
}

// Admin User
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2b$10$...", // hashed
  "isAdmin": true,
  "createdAt": ISODate("2024-01-01"),
  "updatedAt": ISODate("2024-01-01")
}
```

---

## Component Hierarchy

```
App
├── AuthProvider
│   ├── Navbar
│   │   ├── Nav Links (Dynamic based on isAdmin)
│   │   ├── User Greeting
│   │   └── Logout Button
│   │
│   └── Routes
│       ├── /login → Login Page
│       ├── /register → Register Page
│       ├── /dashboard → PrivateRoute → Dashboard
│       ├── /upload → PrivateRoute → Upload
│       ├── /my-uploads → PrivateRoute → MyUploads
│       ├── /admin → AdminRoute → AdminDashboard
│       │           └── Tabs:
│       │               ├── Statistics Tab
│       │               ├── Resources Tab
│       │               └── Users Tab
│       └── / → Navigate to /dashboard
```

---

## Data Flow - Login Process

```
┌─────────────────────────────────────────────────────┐
│ Frontend: Login.jsx                                 │
│ User enters email and password                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼ api.post("/auth/login", credentials)
┌─────────────────────────────────────────────────────┐
│ Backend: authController.login()                     │
│ 1. Find user by email                              │
│ 2. Verify password with bcrypt                     │
│ 3. Generate JWT token                              │
│ 4. Return user object with isAdmin field           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼ Returns:
        {
          "success": true,
          "data": {
            "_id": "...",
            "name": "...",
            "email": "...",
            "isAdmin": true/false,  ← KEY FIELD
            "token": "jwt..."
          }
        }
                 │
                 ▼ Frontend: AuthContext
┌─────────────────────────────────────────────────────┐
│ AuthProvider.login()                                │
│ 1. Store token in localStorage                     │
│ 2. Store user object in localStorage               │
│ 3. Update user state                               │
│ 4. Set isAdmin = user?.isAdmin === true            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼ useAuth() hook available everywhere
        {
          user: {...},
          isAdmin: true/false,  ← Available globally
          loading: false,
          ...
        }
```

---

## Admin Dashboard Architecture

```
AdminDashboard Component
│
├── State Management
│   ├── activeTab: "stats" | "resources" | "users"
│   ├── resources: []
│   ├── users: []
│   ├── stats: {}
│   ├── loading: boolean
│   └── error: string
│
├── Data Fetching
│   ├── GET /api/resources/stats/overview → stats
│   ├── GET /api/resources → resources[]
│   └── GET /api/auth/users → users[]
│
├── Tabs
│   │
│   ├── Statistics Tab
│   │   ├── Total Resources (stat card)
│   │   ├── Total Users (stat card)
│   │   ├── Total Size (stat card)
│   │   └── Subjects Count (stat card)
│   │
│   ├── Resources Tab
│   │   ├── Resources Grid
│   │   ├── ResourceCard Component
│   │   └── Delete Button → DELETE /api/resources/:id
│   │
│   └── Users Tab
│       ├── Users Table
│       │   ├── Name
│       │   ├── Email
│       │   ├── Admin Status (Badge)
│       │   ├── Joined Date
│       │   └── Delete Button → DELETE /api/auth/users/:userId
│       │
│       └── Action Handlers
│           └── handleDeleteUser()
│
└── UI Elements
    ├── Page Header (with logout button)
    ├── Tab Navigation
    ├── Error Message Display
    └── Loading Spinner
```

---

## Authentication Flow Chart

```
                    ┌─────────────────┐
                    │  User Visits    │
                    │  /admin route   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AdminRoute     │
                    │  Component      │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                        │
                ▼                        ▼
        ┌──────────────┐        ┌──────────────┐
        │ Is loading?  │        │ Is loading?  │
        │    YES       │        │     NO       │
        │ Show spinner │        │   Continue  │
        └──────┬───────┘        └──────┬───────┘
               │                       │
               └───────────┬───────────┘
                           │
                    ┌──────▼───────┐
                    │ User exists? │
                    │      NO      │
                    │ Redirect to  │
                    │   /login     │
                    └──────┬───────┘
                           │ YES
                           │
                    ┌──────▼────────┐
                    │  isAdmin ==   │
                    │   true ?      │
                    └──────┬────────┘
                         YES│ NO
                           ├──────────┬──────────┐
                           │          │          │
                           ▼          ▼          │
                    ┌─────────────┐  │          │
                    │    Show     │  │     Redirect
                    │AdminDashboard  │     to
                    └─────────────┘  │  /dashboard
                                     │
                                     ▼
                              ┌────────────────┐
                              │    Navigate    │
                              │  to /dashboard │
                              └────────────────┘
```

---

## File Structure with New Files

```
EduLattice/
├── backend/
│   ├── models/
│   │   ├── User.js              ✏️  MODIFIED (isAdmin field)
│   │   └── Resource.js
│   ├── controllers/
│   │   ├── authController.js    ✏️  MODIFIED (isAdmin in responses)
│   │   └── resourceController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx  ✏️  MODIFIED (isAdmin check)
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── AdminPanel.jsx
│       │   └── AdminDashboard.jsx  ✨  NEW (dedicated admin UI)
│       ├── components/
│       │   ├── AdminRoute.jsx       (no changes needed)
│       │   └── Navbar.jsx           (already uses isAdmin)
│       └── App.jsx              ✏️  MODIFIED (AdminDashboard route)
│
├── 📄 ADMIN_SETUP.md                ✨ NEW (setup guide)
├── 📄 ADMIN_IMPLEMENTATION_SUMMARY.md ✨ NEW (quick reference)
├── 📄 BEFORE_AFTER_COMPARISON.md    ✨ NEW (detailed comparison)
├── 📄 IMPLEMENTATION_CHECKLIST.md   ✨ NEW (testing checklist)
├── 📄 CODE_REFERENCE.md             ✨ NEW (code snippets)
└── 📄 ADMIN_SYSTEM_ARCHITECTURE.md  ✨ NEW (this file)
```

---

## Security Architecture

```
┌────────────────────────────────────────┐
│      User Authentication Layer         │
├────────────────────────────────────────┤
│ 1. Password Hashing (bcrypt)           │
│ 2. JWT Token Generation                │
│ 3. Token Validation on Protected Routes│
└────────┬───────────────────────────────┘
         │
┌────────▼──────────────────────────────┐
│    Authorization Layer (isAdmin)       │
├────────────────────────────────────────┤
│ 1. AdminRoute Component                │
│ 2. Backend Middleware Checks           │
│ 3. Frontend Role-Based Access Control  │
└────────┬───────────────────────────────┘
         │
┌────────▼──────────────────────────────┐
│  Admin-Only Features Protection        │
├────────────────────────────────────────┤
│ 1. AdminDashboard (isAdmin required)   │
│ 2. User Management Endpoints           │
│ 3. Resource Deletion                   │
│ 4. Statistics/Analytics                │
└────────────────────────────────────────┘
```

---

## API Endpoint Security

```
Endpoint                      Requires         Checks
─────────────────────────────────────────────────────────
POST   /api/auth/register     -                -
GET    /api/auth/login        -                -
GET    /api/auth/users        JWT Token        isAdmin: true
DELETE /api/auth/users/:id    JWT Token        isAdmin: true
GET    /api/resources         JWT Token        -
POST   /api/resources         JWT Token        -
GET    /api/resources/:id     JWT Token        -
DELETE /api/resources/:id     JWT Token        isAdmin: true
GET    /api/resources/stats   JWT Token        isAdmin: true
```

---

## State Management Overview

```
AuthContext (Global)
├── user: {
│   _id: string,
│   name: string,
│   email: string,
│   isAdmin: boolean,     ← KEY STATE
│   ...
│ }
├── loading: boolean
├── isAuthenticated: boolean
├── isAdmin: boolean      ← COMPUTED from user.isAdmin
├── login(): Promise
├── register(): Promise
└── logout(): void

AdminDashboard (Local)
├── activeTab: "stats" | "resources" | "users"
├── resources: Resource[]
├── users: User[]
├── stats: Object
├── loading: boolean
└── error: string
```

---

## TypeScript-style Interfaces (for reference)

```typescript
// User Type
interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // Only in responses with select: false
  isAdmin: boolean; // NEW - replaces role
  createdAt: string;
  updatedAt: string;
}

// Auth Response
interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean; // NEW - replaces role
    token: string;
  };
}

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean; // Derived from user?.isAdmin === true
  login(email: string, password: string): Promise<{ success: boolean }>;
  register(
    name: string,
    email: string,
    password: string,
    isAdmin?: boolean,
  ): Promise<{ success: boolean }>;
  logout(): void;
}
```

---

This architecture ensures:
✅ Clear separation of concerns
✅ Secure authentication and authorization
✅ Scalable admin functionality
✅ Easy to test and maintain
✅ Proper role-based access control

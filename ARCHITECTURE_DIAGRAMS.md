# Application Flow & Architecture Diagrams

## User Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Opens App                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Token in        │
                    │  localStorage?   │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
            ┌───▼────┐              ┌────▼────┐
            │  YES   │              │   NO    │
            └───┬────┘              └────┬────┘
                │                         │
        ┌───────▼────────┐         ┌─────▼──────┐
        │  Validate      │         │  Redirect  │
        │  Token         │         │  to Login  │
        └───────┬────────┘         └────────────┘
                │
        ┌───────▼────────┐
        │  Valid?        │
        └───────┬────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────┐             ┌────▼────┐
│  YES   │             │   NO    │
└───┬────┘             └────┬────┘
    │                       │
┌───▼─────────┐      ┌──────▼────────┐
│  Load User  │      │  Clear Token  │
│  Profile    │      │  → Login Page │
└───┬─────────┘      └───────────────┘
    │
┌───▼──────────┐
│  Dashboard   │
└──────────────┘
```

## Resource Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   User Clicks "Upload"                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Fill Form       │
                    │  - Title         │
                    │  - Description   │
                    │  - Subject       │
                    │  - Semester      │
                    │  - Tags          │
                    │  - Select File   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Client-Side     │
                    │  Validation      │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
            ┌───▼────┐              ┌────▼────┐
            │ Valid  │              │ Invalid │
            └───┬────┘              └────┬────┘
                │                         │
                │                    ┌────▼─────────┐
                │                    │ Show Error   │
                │                    │ Return       │
                │                    └──────────────┘
                │
        ┌───────▼────────┐
        │  Send to       │
        │  Backend API   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  Server-Side   │
        │  Validation    │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  Check File    │
        │  Type          │
        └───────┬────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────────┐      ┌──────▼─────────┐
│ Document   │      │  Image         │
│ (PDF/PPT/  │      │  (JPG/PNG)     │
│  DOC)      │      │                │
└───┬────────┘      └──────┬─────────┘
    │                      │
┌───▼──────────┐    ┌──────▼─────────┐
│ Upload to    │    │ Upload to      │
│ Google Drive │    │ Cloudinary     │
└───┬──────────┘    └──────┬─────────┘
    │                      │
    └──────────┬───────────┘
               │
       ┌───────▼────────┐
       │  Save Resource │
       │  to MongoDB    │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Return        │
       │  Success +     │
       │  Resource Data │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Show Success  │
       │  Redirect to   │
       │  My Uploads    │
       └────────────────┘
```

## Search & Filter Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User on Dashboard                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Enter Search    │
                    │  Criteria:       │
                    │  - Keyword       │
                    │  - Subject       │
                    │  - Semester      │
                    │  - Tags          │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Click Search    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Build Query     │
                    │  Parameters      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Send API        │
                    │  Request         │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Backend:        │
                    │  Parse Filters   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Query MongoDB   │
                    │  with Filters    │
                    │  + Pagination    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Return Results  │
                    │  + Total Count   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Display         │
                    │  Resources in    │
                    │  Grid Layout     │
                    └──────────────────┘
```

## Delete Resource Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              User Clicks "Delete" on Resource                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Show            │
                    │  Confirmation    │
                    │  Dialog          │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
            ┌───▼────┐              ┌────▼────┐
            │ Confirm│              │ Cancel  │
            └───┬────┘              └────┬────┘
                │                         │
                │                    ┌────▼─────────┐
                │                    │ Return       │
                │                    │              │
                │                    └──────────────┘
                │
        ┌───────▼────────┐
        │  Send DELETE   │
        │  Request       │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  Verify:       │
        │  - User Auth   │
        │  - Ownership   │
        │    or Admin    │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  Get Resource  │
        │  from DB       │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  Check File    │
        │  Type          │
        └───────┬────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────────┐      ┌──────▼─────────┐
│ Document   │      │  Image         │
└───┬────────┘      └──────┬─────────┘
    │                      │
┌───▼──────────┐    ┌──────▼─────────┐
│ Delete from  │    │ Delete from    │
│ Google Drive │    │ Cloudinary     │
└───┬──────────┘    └──────┬─────────┘
    │                      │
    └──────────┬───────────┘
               │
       ┌───────▼────────┐
       │  Delete from   │
       │  MongoDB       │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Return        │
       │  Success       │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Remove from   │
       │  UI            │
       │  Show Success  │
       └────────────────┘
```

## Admin Panel Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Admin User Login                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Verify Admin    │
                    │  Role            │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Load Admin      │
                    │  Panel           │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Show Tabs:      │
                    │  - Statistics    │
                    │  - All Resources │
                    │  - All Users     │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼────┐   ┌──────▼─────┐  ┌──────▼────────┐
    │Statistics  │   │ Resources  │  │  Users        │
    │Tab         │   │ Tab        │  │  Tab          │
    └───┬────────┘   └──────┬─────┘  └──────┬────────┘
        │                   │                │
┌───────▼────────┐  ┌───────▼────────┐  ┌───▼────────┐
│- Total Count   │  │- View All      │  │- List All  │
│- By Type       │  │- Search        │  │  Users     │
│- By Subject    │  │- Delete Any    │  │- Show Role │
│- By Semester   │  │                │  │- Join Date │
└────────────────┘  └────────────────┘  └────────────┘
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │   Mobile     │  │   Tablet     │         │
│  │   (React)    │  │   (Future)   │  │   (Future)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      API GATEWAY (Vercel)                        │
│                                                                  │
│                    CORS Middleware                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    BACKEND LAYER (Render)                        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Express.js Server                       │  │
│  └────────┬──────────────────────────────────────────┬───────┘  │
│           │                                           │          │
│  ┌────────▼─────────┐                     ┌──────────▼───────┐  │
│  │  Authentication  │                     │  Authorization   │  │
│  │  Middleware      │                     │  Middleware      │  │
│  └────────┬─────────┘                     └──────────┬───────┘  │
│           │                                           │          │
│  ┌────────▼───────────────────────────────────────────▼───────┐  │
│  │                   Route Handlers                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │  │
│  │  │   Auth   │  │ Resource │  │  File Upload         │   │  │
│  │  │ Routes   │  │  Routes  │  │  (Multer)            │   │  │
│  │  └─────┬────┘  └────┬─────┘  └─────────┬────────────┘   │  │
│  └────────┼────────────┼───────────────────┼────────────────┘  │
│           │            │                   │                   │
│  ┌────────▼────────────▼───────────────────▼────────────────┐  │
│  │              Business Logic Layer                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │  │
│  │  │   Auth   │  │ Resource │  │  File Services       │  │  │
│  │  │Controller│  │Controller│  │  (Google/Cloudinary) │  │  │
│  │  └────┬─────┘  └────┬─────┘  └─────────┬────────────┘  │  │
│  └───────┼─────────────┼───────────────────┼───────────────┘  │
└──────────┼─────────────┼───────────────────┼───────────────────┘
           │             │                   │
┌──────────▼─────────────▼───────────────────▼───────────────────┐
│                    DATA LAYER                                   │
│                                                                 │
│  ┌──────────────────┐  ┌───────────────┐  ┌─────────────────┐ │
│  │   MongoDB Atlas  │  │ Google Drive  │  │  Cloudinary     │ │
│  │                  │  │               │  │                 │ │
│  │  - Users         │  │  - PDF files  │  │  - Images       │ │
│  │  - Resources     │  │  - PPT files  │  │  - JPG/PNG      │ │
│  │                  │  │  - DOC files  │  │                 │ │
│  └──────────────────┘  └───────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow for Resource Upload

```
User (Frontend)
    │
    │ 1. Form Data + File
    ▼
React Upload Component
    │
    │ 2. FormData Object
    ▼
Axios (API Client)
    │
    │ 3. HTTP POST /api/resources
    ▼
Express Server (Backend)
    │
    ├─► 4. Auth Middleware (Verify JWT)
    │
    ├─► 5. Multer Middleware (Parse File)
    │
    ├─► 6. File Validation
    │       │
    │       ├─► Check Type
    │       ├─► Check Size
    │       └─► Block Videos
    │
    ▼
Resource Controller
    │
    ├─► 7. Determine File Type
    │
    ├─► 8a. If Document → Google Drive Service
    │        │
    │        ├─► Upload to Drive
    │        ├─► Set Permissions
    │        └─► Get File ID & URL
    │
    ├─► 8b. If Image → Cloudinary Service
    │        │
    │        ├─► Upload to Cloudinary
    │        └─► Get Secure URL
    │
    ├─► 9. Save to MongoDB
    │        │
    │        └─► Resource Model
    │             │
    │             ├─► Title
    │             ├─► Description
    │             ├─► File URL
    │             ├─► File Type
    │             └─► User Reference
    │
    ▼
10. Return Success Response
    │
    ▼
Frontend
    │
    ├─► Show Success Message
    ├─► Reset Form
    └─► Redirect to My Uploads
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Request Error                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Catch in        │
                    │  Try-Catch       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Identify Error  │
                    │  Type            │
                    └────────┬─────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
┌───▼────────┐      ┌────────▼─────┐        ┌────────▼────────┐
│Validation  │      │Authentication│        │  Server Error   │
│Error       │      │Error         │        │                 │
└───┬────────┘      └────────┬─────┘        └────────┬────────┘
    │                        │                        │
┌───▼─────────┐     ┌────────▼──────┐       ┌────────▼────────┐
│ 400         │     │ 401/403       │       │ 500             │
│ Bad Request │     │ Unauthorized  │       │ Internal Error  │
└───┬─────────┘     └────────┬──────┘       └────────┬────────┘
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Format Error    │
                    │  Response        │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Send to Client  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Display Error   │
                    │  to User         │
                    └──────────────────┘
```

## Token Lifecycle

```
Registration/Login
    │
    ├─► Generate JWT Token
    │    │
    │    ├─► Payload: { id: user._id }
    │    ├─► Secret: JWT_SECRET
    │    └─► Expiry: 30 days
    │
    ▼
Return to Client
    │
    ├─► Store in localStorage
    │
    ▼
Subsequent Requests
    │
    ├─► Attach to Authorization Header
    │
    ▼
Backend Middleware
    │
    ├─► Extract Token
    │
    ├─► Verify with JWT_SECRET
    │
    ├─► Check Expiration
    │    │
    │    ├─► Valid → Continue
    │    └─► Invalid/Expired → 401 Error
    │
    ▼
Process Request
    │
    ▼
Response
```

---

These diagrams illustrate the complete flow of data and processes throughout the EduLattice application, from user interaction through to data storage and retrieval.

# API Reference - EduLattice

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend-url.onrender.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Access**: Public

**Request Body**:

```json
{
  "name": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "role": "string (optional, 'student' or 'admin', default: 'student')"
}
```

**Success Response** (201):

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "jwt_token_here"
  }
}
```

**Error Response** (400):

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /auth/login`

**Access**: Public

**Request Body**:

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "token": "jwt_token_here"
  }
}
```

**Error Response** (401):

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Access**: Private

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "createdAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### Get All Users

Get list of all registered users (Admin only).

**Endpoint**: `GET /auth/users`

**Access**: Private/Admin

**Success Response** (200):

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "createdAt": "2026-01-26T10:00:00.000Z"
    },
    {
      "_id": "user_id_2",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2026-01-25T10:00:00.000Z"
    }
  ]
}
```

---

## Resource Endpoints

### Upload Resource

Upload a new learning resource.

**Endpoint**: `POST /resources`

**Access**: Private

**Content-Type**: `multipart/form-data`

**Request Body**:

```
file: File (required, PDF/PPT/DOCX/JPG/PNG)
title: string (required, max 200 chars)
description: string (required, max 1000 chars)
subject: string (required)
semester: string (required)
tags: string (optional, comma-separated)
```

**File Constraints**:

- Documents (PDF, PPT, DOCX): Max 20MB
- Images (JPG, PNG): Max 5MB
- Videos: Blocked

**Success Response** (201):

```json
{
  "success": true,
  "data": {
    "_id": "resource_id",
    "title": "Calculus Notes",
    "description": "Comprehensive calculus study material",
    "subject": "Mathematics",
    "semester": "3rd",
    "tags": ["calculus", "derivatives", "integrals"],
    "fileType": "pdf",
    "fileUrl": "https://drive.google.com/file/d/...",
    "driveFileId": "drive_file_id",
    "fileName": "calculus-notes.pdf",
    "fileSize": 2048576,
    "uploadedBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2026-01-26T10:00:00.000Z"
  }
}
```

**Error Responses**:

- 400: Invalid file type, file too large, missing required fields
- 500: Upload failed

---

### Get All Resources

Retrieve resources with optional filters.

**Endpoint**: `GET /resources`

**Access**: Private

**Query Parameters**:

- `subject` (string, optional): Filter by subject
- `semester` (string, optional): Filter by semester
- `keyword` (string, optional): Search in title, description, subject
- `tags` (string, optional): Comma-separated tags
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 10): Results per page

**Example**:

```
GET /resources?subject=Mathematics&semester=3rd&keyword=calculus&page=1&limit=10
```

**Success Response** (200):

```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "resource_id",
      "title": "Calculus Notes",
      "description": "Comprehensive calculus study material",
      "subject": "Mathematics",
      "semester": "3rd",
      "tags": ["calculus", "derivatives"],
      "fileType": "pdf",
      "fileUrl": "https://drive.google.com/file/d/...",
      "fileName": "calculus-notes.pdf",
      "fileSize": 2048576,
      "uploadedBy": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2026-01-26T10:00:00.000Z"
    }
  ]
}
```

---

### Get Single Resource

Get details of a specific resource.

**Endpoint**: `GET /resources/:id`

**Access**: Private

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "_id": "resource_id",
    "title": "Calculus Notes",
    "description": "Comprehensive calculus study material",
    "subject": "Mathematics",
    "semester": "3rd",
    "tags": ["calculus", "derivatives"],
    "fileType": "pdf",
    "fileUrl": "https://drive.google.com/file/d/...",
    "driveFileId": "drive_file_id",
    "fileName": "calculus-notes.pdf",
    "fileSize": 2048576,
    "uploadedBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "createdAt": "2026-01-26T10:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

**Error Response** (404):

```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

### Get My Uploads

Get all resources uploaded by the authenticated user.

**Endpoint**: `GET /resources/my/uploads`

**Access**: Private

**Success Response** (200):

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "resource_id",
      "title": "My Resource",
      "description": "Resource description",
      "subject": "Physics",
      "semester": "2nd",
      "tags": ["mechanics"],
      "fileType": "pdf",
      "fileUrl": "https://drive.google.com/file/d/...",
      "fileName": "physics-notes.pdf",
      "fileSize": 1048576,
      "uploadedBy": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2026-01-26T10:00:00.000Z"
    }
  ]
}
```

---

### Delete Resource

Delete a resource (Owner or Admin only).

**Endpoint**: `DELETE /resources/:id`

**Access**: Private (Owner or Admin)

**Success Response** (200):

```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

**Error Responses**:

- 403: Not authorized to delete this resource
- 404: Resource not found
- 500: Deletion failed

---

### Get Resource Statistics

Get platform statistics (Admin only).

**Endpoint**: `GET /resources/stats/overview`

**Access**: Private/Admin

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "total": 45,
    "byType": {
      "pdf": 20,
      "ppt": 15,
      "doc": 5,
      "image": 5
    },
    "bySubject": [
      { "_id": "Mathematics", "count": 15 },
      { "_id": "Physics", "count": 12 },
      { "_id": "Chemistry", "count": 10 }
    ],
    "bySemester": [
      { "_id": "1st", "count": 10 },
      { "_id": "2nd", "count": 15 },
      { "_id": "3rd", "count": 20 }
    ]
  }
}
```

---

## Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 500  | Internal Server Error                   |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider:

- 100 requests per 15 minutes per IP
- 1000 requests per day per user

---

## Pagination

Resources endpoint supports pagination:

- Default: 10 items per page
- Max: 100 items per page
- Use `page` and `limit` query parameters

Example:

```
GET /resources?page=2&limit=20
```

---

## File Types

### Supported File Types

**Documents (Google Drive)**:

- PDF: `application/pdf`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Images (Cloudinary)**:

- JPEG: `image/jpeg`, `image/jpg`
- PNG: `image/png`

**Blocked**:

- All video formats (`video/*`)

---

## CORS

Allowed origins are configured via `FRONTEND_URL` environment variable.

---

## Webhook Support

Future feature - not yet implemented.

---

## Version History

- **v1.0.0** (2026-01-26): Initial release

---

For issues or questions, please open an issue on GitHub.

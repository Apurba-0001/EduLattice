# File Deletion Authorization - Quick Reference

## Who Can Delete Files?

### ✅ **File Owner** (Uploader)

- The user who uploaded the file
- Can delete their own files anytime

### ✅ **Admin User**

- Can delete ANY file
- Used for moderation and content management

### ❌ **Other Users**

- Cannot delete files they didn't upload
- Cannot delete other users' files
- Will receive 403 Forbidden error

## Authorization Flow

```
Delete Request
    ↓
Is user authenticated?
    ├─ NO → 401 Unauthorized
    └─ YES → Continue
         ↓
    Is file found?
         ├─ NO → 404 Not Found
         └─ YES → Continue
              ↓
         Is user ADMIN?
              ├─ YES → ✅ Allow Deletion
              └─ NO → Continue
                   ↓
              Is user the UPLOADER?
                   ├─ YES → ✅ Allow Deletion
                   └─ NO → ❌ 403 Forbidden
```

## Code Implementation

### Middleware - Authorization Check

```javascript
// middleware/auth.js
if (isAdmin || uploadedById === userId) {
  next(); // ✅ Allow
} else {
  res.status(403).json({
    success: false,
    message: "Only the file uploader or an admin can modify this resource",
  });
}
```

### Controller - Delete Resource

```javascript
// controllers/resourceController.js
export const deleteResource = async (req, res) => {
  const resource = req.resource; // Already authorized

  // Delete from Cloudinary/Google Drive
  // Delete from database

  res.status(200).json({
    success: true,
    message: "Resource deleted successfully",
    data: {
      deletedFileId: resource.fileId,
      fileName: resource.fileName,
      deletedBy: isAdmin ? "Admin" : "Owner",
    },
  });
};
```

### Route - Delete Endpoint

```javascript
// routes/resourceRoutes.js
router.delete(
  "/:id",
  protect, // Must be authenticated
  authorizeResourceAccess, // Must be owner or admin
  deleteResource, // Perform deletion
);
```

## Error Responses

| Scenario                      | HTTP Status | Message                                                       |
| ----------------------------- | ----------- | ------------------------------------------------------------- |
| Not logged in                 | 401         | "No token provided"                                           |
| User not uploader & not admin | 403         | "Only the file uploader or an admin can modify this resource" |
| File doesn't exist            | 404         | "Resource not found"                                          |
| File owner deletes own file   | 200         | "Resource deleted successfully"                               |
| Admin deletes any file        | 200         | "Resource deleted successfully"                               |

## Logging

Every deletion attempt is logged:

```
✅ Authorization granted:
   User: 507f1f77bcf86cd799439012
   Uploader: 507f1f77bcf86cd799439012
   Is Admin: false
   Resource: 550e8400-...

✅ Deleted image from Cloudinary: edulattice/Math Notes_550e8400
✅ Deleted resource from database: 550e8400-...
✅ Resource deleted successfully by Owner
```

## Testing

### Test Case 1: File Owner Deletes Own File ✅

```
1. User uploads "Math Notes.pdf"
2. System stores: uploadedBy = user_123
3. Same user deletes the file
4. ✅ Authorization check passes
5. ✅ File deleted from Cloudinary
6. ✅ File deleted from Google Drive
7. ✅ File deleted from database
```

### Test Case 2: Different User Tries to Delete ❌

```
1. User A uploads "Math Notes.pdf"
   uploadedBy = user_123
2. User B tries to delete it
   userId = user_456
3. ❌ uploadedById ≠ userId
4. ❌ user_456 is not admin
5. ❌ 403 Forbidden returned
6. ✅ File remains intact
```

### Test Case 3: Admin Deletes Any File ✅

```
1. User A uploads "Math Notes.pdf"
2. Admin logs in
   isAdmin = true
3. Admin deletes the file
4. ✅ Authorization check passes (admin override)
5. ✅ File deleted from all systems
6. ✅ Logged as "deleted by Admin"
```

## Database References

### Resource Document

```javascript
{
  _id: ObjectId,
  title: "Math Notes",
  uploadedBy: ObjectId(user_123),  // ← Stores uploader ID
  fileName: "Math Notes.pdf",
  fileId: UUID,
  ...
}
```

### User Document

```javascript
{
  _id: ObjectId(user_123),
  name: "Apurba",
  email: "apurba@example.com",
  isAdmin: false,  // ← Regular user
  ...
}
```

## Security Summary

✅ **Authentication** - JWT token required
✅ **Authorization** - Owner or admin only
✅ **Verification** - User ID comparison
✅ **Audit Trail** - All deletions logged
✅ **Complete Removal** - Deleted from all storage systems
✅ **No Recovery** - Permanent deletion
✅ **Error Handling** - Clear error messages

## Files Modified

1. **middleware/auth.js** - Enhanced authorization checks
2. **controllers/resourceController.js** - Improved deletion logging
3. **routes/resourceRoutes.js** - Uses authorization middleware

All deletion functionality is **production-ready and secure**.

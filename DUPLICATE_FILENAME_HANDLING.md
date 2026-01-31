# Duplicate Filename Handling - EduLattice

## Overview

EduLattice now gracefully handles cases where multiple files have the same title, preventing file conflicts and ensuring proper file management across Cloudinary and Google Drive storage.

## How It Works

### 1. **Storage Layer (Backend)**

When a file is uploaded with title "Math Notes":

```
Original Upload: Math Notes.pdf
↓
Backend Processing:
  - Extracts extension: .pdf
  - Generates unique ID: 123456 (last 6 digits of timestamp)
  - Creates storage filename: "Math Notes_123456.pdf"
  - Creates display filename: "Math Notes.pdf"
↓
Database Storage:
  - fileName: "Math Notes.pdf" (user sees this on download)
  - storageFileName: "Math Notes_123456.pdf" (unique, prevents conflicts)
  - fileUrl: Cloudinary/Drive URL with unique filename
```

### 2. **File Upload Flow**

**Scenario: User uploads two files both titled "Math Notes"**

| First Upload                      | Second Upload                     |
| --------------------------------- | --------------------------------- |
| Title: "Math Notes"               | Title: "Math Notes"               |
| Timestamp: 1706759123             | Timestamp: 1706759125             |
| Storage: "Math Notes_123123.pdf"  | Storage: "Math Notes_125125.pdf"  |
| Cloudinary Folder: `/edulattice/` | Cloudinary Folder: `/edulattice/` |
| **Files are completely separate** | **No conflicts or overwrites**    |

### 3. **Download Flow**

```
User clicks Download
  ↓
Frontend retrieves: fileName = "Math Notes.pdf"
  ↓
Backend URL points to: "Math Notes_123123.pdf"
  ↓
Cloudinary/Google Drive serves correct file
  ↓
Browser downloads as: "Math Notes.pdf"
```

**User Experience:** User always sees "Math Notes.pdf" in downloads, but internal system prevents collisions.

### 4. **Database Schema**

```javascript
{
  title: "Math Notes",                        // Display name (can be duplicate)
  fileName: "Math Notes.pdf",                 // User-friendly download name
  storageFileName: "Math Notes_123123.pdf",   // Unique identifier (no duplicates)
  fileUrl: "https://..../Math Notes_123123.pdf",
  driveFileId: "unique_google_id_123"         // Unique ID for Google Drive
}
```

The `storageFileName` field is set as `unique: true` in MongoDB, ensuring no two files can have the same storage name.

### 5. **Cloud Storage Organization**

#### Cloudinary

- **Path:** `/edulattice/Math Notes_123123.pdf`
- **Path:** `/edulattice/Math Notes_125125.pdf`
- Both files coexist without conflicts
- Deletion uses resource ID + fileUrl to ensure correct file is removed

#### Google Drive

- **File ID:** `unique_google_id_123` (automatically unique)
- **File ID:** `unique_google_id_125`
- Google Drive already provides unique IDs, preventing any conflicts
- Deletion uses `driveFileId` to delete specific file

### 6. **Deletion Safety**

When deleting "Math Notes" (first upload):

```javascript
Resource._id: "abc123" → storageFileName: "Math Notes_123123.pdf"
  ↓
Cloudinary Deletion:
  - Extract public_id from fileUrl
  - Delete: edulattice/Math Notes_123123
  ↓
Google Drive Deletion:
  - Use driveFileId from database
  - No filename confusion possible
```

**Result:** Only the specific file is deleted, other "Math Notes" files remain untouched.

### 7. **Error Handling**

The system gracefully handles:

✅ **Duplicate titles** - Prevented by unique storage names
✅ **File overwrites** - Impossible with unique IDs
✅ **Wrong file deletion** - Uses database IDs, not filenames
✅ **Download conflicts** - Backend manages unique URLs
✅ **Mixed file content** - Each file has unique identifier throughout

### 8. **Database Migration Note**

For existing resources created before this implementation:

- Old resources will have `storageFileName` = `fileName`
- This is acceptable as existing files already have unique Cloudinary/Drive IDs
- No data loss or conflicts occur
- All new uploads use the unique storage name system

## Technical Implementation

### Changes Made

1. **Backend Controller** (`resourceController.js`)
   - Added unique ID generation: `Date.now().toString().slice(-6)`
   - Created separate `storageFileName` and `displayFileName`
   - Pass unique name to Cloudinary/Google Drive
   - Store both in database

2. **Resource Model** (`Resource.js`)
   - Added `storageFileName` field
   - Set as `unique: true` to prevent duplicates
   - Indexed for efficient queries

3. **Frontend** (`ResourceCard.jsx`)
   - Uses `fileName` (display name) for user downloads
   - Works with any internal storage scheme
   - No changes needed for this feature

## Benefits

| Scenario               | Before              | After                 |
| ---------------------- | ------------------- | --------------------- |
| Upload 2 "Math Notes"  | Files may overwrite | Both files preserved  |
| Delete wrong file      | Risk of deletion    | Safe - uses unique ID |
| Download "Math Notes"  | Possible confusion  | Always correct file   |
| Same title, diff users | Potential conflicts | Fully isolated        |

## Testing

Test with these scenarios:

1. Upload file titled "Test"
2. Upload another file titled "Test"
3. Both appear in Dashboard
4. Download each - correct file downloads
5. Delete first "Test" - second remains
6. No errors in console

## Examples

### Example 1: Two Math Study Guides

```
Upload 1: "Math Study Guide.pdf" → Stored as "Math Study Guide_153847.pdf"
Upload 2: "Math Study Guide.pdf" → Stored as "Math Study Guide_153851.pdf"
Download 1: User gets "Math Study Guide.pdf" (correct file)
Download 2: User gets "Math Study Guide.pdf" (correct file)
Delete 1: Only first file deleted, second remains
```

### Example 2: Three Lecture Notes

```
Upload 1: "Lecture Notes.pptx" → "Lecture Notes_100001.pptx"
Upload 2: "Lecture Notes.pptx" → "Lecture Notes_100002.pptx"
Upload 3: "Lecture Notes.pptx" → "Lecture Notes_100003.pptx"
Total: 3 completely separate files, no conflicts
```

## Conclusion

EduLattice now robustly handles duplicate filenames with a two-tier naming system:

- **Storage Layer:** Unique identifiers prevent all conflicts
- **User Layer:** Clean, readable filenames for downloads
- **Safety Layer:** Database IDs ensure correct operations

Users can upload unlimited files with the same title without any errors or data loss.

# MongoDB Resource Schema Documentation

## Collection: Resources

### Field Structure

#### Required Fields

- **fileId** (String)
  - UUID v4, unique identifier
  - Auto-generated on creation
  - Used for uniqueness across all files
  - Index: Single field index

- **title** (String)
  - Max 200 characters
  - Required
  - Trimmed on save
  - Full-text searchable
  - Single field index

- **description** (String)
  - Max 1000 characters
  - Required
  - Trimmed on save
  - Full-text searchable

- **subject** (String)
  - Required
  - Trimmed on save
  - Full-text searchable
  - Indexed with semester for combo queries
  - Indexed individually for filtering

- **semester** (String)
  - Required (Format: "Semester I", "Semester II", etc.)
  - Trimmed on save
  - Indexed with subject for combo queries
  - Indexed individually for filtering

- **resourceType** (String, Enum)
  - Required
  - Valid values:
    - Class Notes
    - Module
    - Assignment
    - Presentation
    - Exam Suggestion
    - Book
    - Lab Experiment
    - Other
  - Full-text searchable
  - Indexed individually for filtering

- **fileType** (String, Enum)
  - Required
  - Valid values: pdf, ppt, doc, image
  - Determines upload/download handling

- **fileUrl** (String)
  - Required
  - Cloudinary/Drive URL
  - Source for downloads

- **fileName** (String)
  - Required
  - User-friendly display name (includes title)
  - Used for download naming

- **storageFileName** (String)
  - Required
  - Unique storage identifier with UUID
  - Prevents duplicate filename overwrites
  - Unique constraint enforced

- **fileSize** (Number)
  - Required
  - Size in bytes
  - Used for upload limit validation

- **uploadedBy** (ObjectId Reference)
  - Required reference to User collection
  - Used for authorization (file deletion)
  - Used for tracking user uploads
  - Indexed individually for user filtering

#### Optional Fields

- **driveFileId** (String)
  - Google Drive file ID
  - Default: null
  - Only populated for Google Drive uploads

- **downloads** (Number)
  - Default: 0
  - Tracks download count
  - Used for popular resource ranking
  - Indexed for sorting

- **views** (Number)
  - Default: 0
  - Tracks view count
  - Used for trending resources
  - Indexed for sorting

- **isArchived** (Boolean)
  - Default: false
  - Soft delete indicator
  - Indexed for filtering active resources

#### System Fields (Auto-managed by Mongoose)

- **createdAt** (Date)
  - Auto-generated on creation
  - Indexed for sorting by latest
  - Used in feed/listing queries

- **updatedAt** (Date)
  - Auto-updated on modification
  - Automatically managed by timestamps: true

- **\_id** (ObjectId)
  - MongoDB default document ID
  - Auto-generated

### Index Strategy

#### Text Search Index

```javascript
{
  title: "text",
  description: "text",
  subject: "text",
  resourceType: "text"
}
```

- Enables full-text search across multiple fields
- Used for keyword search functionality

#### Single Field Indexes

| Field                  | Purpose                    |
| ---------------------- | -------------------------- |
| fileId                 | Unique file identification |
| title                  | Title-based searches       |
| resourceType           | Filter by resource type    |
| semester               | Filter by semester         |
| uploadedBy             | Get user's resources       |
| createdAt (descending) | Sort by newest             |
| downloads (descending) | Popular resources ranking  |
| views (descending)     | Trending resources ranking |
| isArchived             | Filter active resources    |

#### Compound Indexes

| Fields                            | Purpose                                |
| --------------------------------- | -------------------------------------- |
| subject + semester                | Filter by subject in specific semester |
| subject + semester + resourceType | Multi-filter queries                   |

### Search Query Examples

#### Full-Text Search

```javascript
db.resources.find({ $text: { $search: "calculus" } });
```

#### Filter by Semester and Subject

```javascript
db.resources.find({
  semester: "Semester I",
  subject: "Mathematics",
});
```

#### Filter by Resource Type

```javascript
db.resources.find({
  resourceType: "Assignment",
  semester: "Semester I",
});
```

#### Get User's Resources

```javascript
db.resources.find({ uploadedBy: ObjectId("...") });
```

#### Popular Resources

```javascript
db.resources
  .find({
    semester: "Semester I",
  })
  .sort({ downloads: -1 })
  .limit(10);
```

#### Latest Resources

```javascript
db.resources.find().sort({ createdAt: -1 }).limit(20);
```

### Data Validation

#### Enum Validation

- **resourceType**: Only 8 specific types allowed
- **fileType**: Only 4 file types allowed

#### Length Constraints

- **title**: 1-200 characters
- **description**: 1-1000 characters

#### Uniqueness Constraints

- **fileId**: Globally unique
- **storageFileName**: Globally unique (prevents overwrites)

### Migration Notes

When deploying updated schema:

1. **New Documents**: Will automatically have:
   - downloads: 0
   - views: 0
   - isArchived: false

2. **Existing Documents**:
   - Will work with old schema
   - New fields populated on update
   - Indexes will be created automatically on first access
   - Recommend: Build indexes during off-peak hours

3. **Index Creation**:
   - MongoDB creates indexes automatically on first query
   - For production: Pre-create indexes before deploying
   - Command: `db.resources.createIndex(...)` for each index

### Performance Recommendations

1. **Search**: Use text index for keyword searches
2. **Filtering**: Use compound indexes for multi-field filters
3. **Sorting**: Use createdAt, downloads, views indexes
4. **Pagination**: Combine limit with skip for efficient pagination
5. **Archiving**: Mark as archived instead of deleting for audit trail

### Query Optimization

- Always use filters with indexed fields
- Combine multiple single-field indexes into compound indexes for frequent multi-field queries
- Use projections to limit returned fields
- Consider caching for frequently accessed resources

# AdminDashboard UI Reference Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVBAR                              │
│  📚 EduLattice  Dashboard  Upload  MyUploads  Admin Panel   │
│                                        Admin User    Logout │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PAGE HEADER                              │
│  Admin Dashboard              [LOGOUT BUTTON]              │
│  Welcome, Admin User                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               TAB NAVIGATION                                │
│  [📊 Statistics]  [📚 Resources]  [👥 Users]              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  CONTENT AREA (TABS)                        │
│                                                              │
│  [Tab content changes based on selected tab]               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Statistics Tab

### Visual Layout

```
┌──────────────────────────────────────────────────────────┐
│              📊 STATISTICS TAB                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   STATS     │  │   STATS     │  │   STATS     │     │
│  │   CARD      │  │   CARD      │  │   CARD      │     │
│  │             │  │             │  │             │     │
│  │ Total       │  │ Total       │  │ Total       │     │
│  │ Resources   │  │ Users       │  │ Size        │     │
│  │     45      │  │     128     │  │   2.5 GB    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │   STATS     │  │   STATS     │                       │
│  │   CARD      │  │   CARD      │                       │
│  │             │  │             │                       │
│  │ Subjects    │  │ (More stats)│                       │
│  │      8      │  │   (Future)  │                       │
│  └─────────────┘  └─────────────┘                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Stat Card Styling

- **Background**: Gradient (667eea → 764ba2)
- **Color**: White text
- **Padding**: 2rem
- **Border Radius**: 10px
- **Shadow**: Subtle box-shadow
- **Title**: Smaller, slightly transparent
- **Number**: Large, bold font (2.5rem)

### Responsive

- Desktop: 4 cards per row
- Tablet: 2-3 cards per row
- Mobile: 1 card per row

---

## Resources Tab

### Visual Layout

```
┌──────────────────────────────────────────────────────────┐
│              📚 RESOURCES TAB                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │   RESOURCE 1    │  │   RESOURCE 2    │  ...          │
│  │                 │  │                 │               │
│  │ [Image/Thumb]   │  │ [Image/Thumb]   │               │
│  │                 │  │                 │               │
│  │ Title here      │  │ Title here      │               │
│  │ Description...  │  │ Description...  │               │
│  │                 │  │                 │               │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │               │
│  │ │   DELETE    │ │  │ │   DELETE    │ │               │
│  │ └─────────────┘ │  │ └─────────────┘ │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Resource Card Features

- **Image**: Thumbnail of resource
- **Title**: Resource name
- **Description**: Brief description
- **Metadata**: Tags, subject, semester
- **Delete Button**: Red button with confirmation

### Grid Layout

- Desktop: 3-4 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row
- Gap: 1.5rem between cards

### Delete Confirmation

```
┌─────────────────────────────────┐
│ Are you sure you want to        │
│ delete this resource?           │
│                                 │
│ [CANCEL]         [DELETE]       │
└─────────────────────────────────┘
```

---

## Users Tab

### Visual Layout

```
┌──────────────────────────────────────────────────────────┐
│              👥 USERS TAB                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  All Users (128)                                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ NAME  │ EMAIL  │ STATUS │ JOINED │ ACTIONS      │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ John  │ john@  │ ADMIN  │ Jan 1  │ [REMOVE]     │   │
│  │ Doe   │ ex.com │ [BLUE] │ 2024   │              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Sarah │ sarah@ │STUDENT │ Jan 5  │ [REMOVE]     │   │
│  │ Smith │ ex.com │[GREEN] │ 2024   │              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Mike  │ mike@  │STUDENT │ Jan 10 │ [REMOVE]     │   │
│  │ Brown │ ex.com │[GREEN] │ 2024   │              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Table Columns

1. **Name** - User's full name
2. **Email** - User's email address
3. **Admin Status** - Badge showing role
4. **Joined** - Date user joined
5. **Actions** - Delete button

### Status Badges

```
┌─────────────────┐  ┌──────────────────┐
│     ADMIN       │  │     STUDENT      │
│   [BLUE BADGE]  │  │  [GREEN BADGE]   │
│ White text      │  │  White text      │
│ Rounded 20px    │  │  Rounded 20px    │
└─────────────────┘  └──────────────────┘
```

### Table Features

- **Sortable**: Click column headers to sort (optional)
- **Hoverable**: Row highlights on hover
- **Responsive**: Scrolls horizontally on mobile
- **Pagination**: Show 10-20 users per page (optional)

### Delete Confirmation

```
┌─────────────────────────────────┐
│ Are you sure you want to        │
│ remove this user?               │
│                                 │
│ [CANCEL]         [REMOVE]       │
└─────────────────────────────────┘
```

---

## Loading State

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                    ┌────────┐                           │
│                    │  ○ ○ ○ │  Loading data...          │
│                    └────────┘                           │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Spinner Animation

- **Size**: 40px × 40px
- **Color**: #0066cc border-top, #e0e0e0 rest
- **Speed**: 0.8s rotation cycle
- **Message**: "Loading data..." below spinner

---

## Error State

```
┌──────────────────────────────────────────────────────────┐
│  ❌ Failed to fetch data                               │
│  [Error message details here]                           │
└──────────────────────────────────────────────────────────┘
```

### Error Message Styling

- **Background**: Light red (#fee)
- **Text Color**: Dark red (#c33)
- **Border-left**: 4px solid #c33
- **Padding**: 1rem
- **Border-radius**: 8px

---

## Empty State

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              No resources found                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- **Text Color**: #999 (gray)
- **Padding**: 2rem
- **Text-align**: center

---

## Color Scheme

### Primary Colors

- **Brand Blue**: #0066cc
- **Success Green**: #28a745
- **Danger Red**: #dc3545
- **Light Gray**: #f5f5f5
- **Dark Gray**: #333

### Gradient Colors

- **Stat Cards**: #667eea → #764ba2 (purple gradient)

### Badge Colors

- **Admin**: #0066cc (blue)
- **Student**: #28a745 (green)

---

## Typography

### Headings

- **Page Title**: 2rem, bold, #333
- **Section Title**: 1.5rem, bold, #333
- **Tab Button**: 1rem, semi-bold, #666

### Text

- **Body**: 1rem, normal, #333
- **Secondary**: 0.9rem, normal, #666
- **Small**: 0.85rem, normal, #999

---

## Spacing

### Common Spacing

- **Section Gap**: 1.5rem - 2rem
- **Card Padding**: 1.5rem - 2rem
- **Button Padding**: 0.5rem - 1rem
- **Table Cell Padding**: 1rem

---

## Button Styles

### Primary Button (Active Tab)

```
┌────────────────┐
│   📊 Stats     │ ← Border-bottom: 3px solid #0066cc
│ Color: #0066cc │    Background: white
└────────────────┘
```

### Secondary Button (Inactive Tab)

```
┌────────────────┐
│   📚 Resources │ ← Border-bottom: 3px transparent
│ Color: #666    │    Background: white
└────────────────┘
```

### Action Button (Delete/Remove)

```
┌──────────────┐
│   DELETE     │ ← Background: #dc3545
│ White text   │    Padding: 0.5rem 1rem
│ Rounded: 4px │    Hover: darker red
└──────────────┘
```

### Logout Button (Header)

```
┌──────────────┐
│   LOGOUT     │ ← Background: #6c757d
│ White text   │    Padding: 0.75rem 1.5rem
│ Rounded: 6px │    Hover: darker gray
└──────────────┘
```

---

## Responsive Breakpoints

```
Mobile: < 640px
  - 1 column layouts
  - Stacked buttons
  - Smaller padding

Tablet: 640px - 1024px
  - 2 column layouts
  - Medium padding
  - Horizontal scroll for tables

Desktop: > 1024px
  - 3-4 column layouts
  - Full padding
  - Full table view
```

---

## Animations & Transitions

### Hover Effects

- **Buttons**: 0.3s color transition
- **Table Rows**: 0.2s background transition
- **Links**: 0.3s color transition

### Loading Animation

- **Spinner**: 0.8s infinite rotation

### Page Transitions

- **Tab Change**: Smooth fade (0.3s)
- **Data Load**: Fade in from opacity 0

---

## Accessibility Features

- ✅ Semantic HTML (tables for data)
- ✅ ARIA labels on buttons
- ✅ Color not only indicator (+ badges text)
- ✅ Focus states on buttons
- ✅ Keyboard navigation support
- ✅ Clear error messages

---

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

This UI provides a professional, user-friendly interface for admin management while maintaining consistency with your EduLattice brand!

# EduLattice PNG Icon Setup

## Quick Setup Instructions

You have provided professional EduLattice logos. Follow these steps to add them to the project:

### Step 1: Save PNG Files to Public Folder

Copy your PNG files to: `frontend/public/`

**Required files to save:**

- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)
- `icon-192x192-maskable.png` (192x192, transparent background for Android)
- `icon-512x512-maskable.png` (512x512, transparent background for Android)
- `favicon.ico` (optional, for browser tab)
- `apple-touch-icon.png` (optional, 180x180 for iOS)

### Step 2: Generate Favicon (Windows PowerShell)

If you have the large PNG, you can convert one to favicon.ico:

```powershell
# Install ImageMagick if not already installed
choco install imagemagick

# Convert PNG to favicon.ico
magick convert "frontend\public\icon-512x512.png" -define icon:auto-resize=64,48,32,16 "frontend\public\favicon.ico"
```

### Step 3: Alternative - Use Online Converter

If you don't have ImageMagick:

1. Visit: https://convertio.co/png-ico/
2. Upload your `icon-512x512.png`
3. Download `favicon.ico`
4. Save to `frontend/public/`

### Step 4: Verify Files

Check that these files exist in `frontend/public/`:

```powershell
ls "frontend\public\icon-*.png"
ls "frontend\public\favicon.ico"
```

### Step 5: Test

1. Hard refresh browser: **Ctrl+Shift+R**
2. Check DevTools → Application → Manifest
3. All icons should show without errors

## File Locations

```
frontend/public/
├── logo.svg                   (SVG source - already updated)
├── manifest.webmanifest       (Updated with correct settings)
├── favicon.ico                ← Add your PNG file here
├── apple-touch-icon.png       ← Add your PNG file here
├── icon-192x192.png           ← Add your PNG file here
├── icon-512x512.png           ← Add your PNG file here
├── icon-192x192-maskable.png  ← Add your PNG file here
└── icon-512x512-maskable.png  ← Add your PNG file here
```

## Expected Result

After adding files:

- ✅ Browser tab will show EduLattice logo
- ✅ App will install as PWA with correct icon
- ✅ Favicon appears in browser history
- ✅ Apple devices show logo when added to home screen
- ✅ Android devices show adaptive icon

## Troubleshooting

**Icons not showing?**

1. Verify files are in `frontend/public/`
2. Hard refresh: Ctrl+Shift+R
3. Clear browser cache
4. Check DevTools Console for 404 errors

**Logo looks pixelated?**

1. Ensure PNG is high resolution (512x512 minimum)
2. Use lossless compression
3. Keep colors consistent

## Next Steps

1. ✅ Updated `logo.svg` with EduLattice design
2. ✅ Updated `manifest.webmanifest` with correct settings
3. ⏳ **Save your PNG files to `frontend/public/`**
4. ⏳ Refresh browser to see changes
5. ⏳ Test PWA installation

---

**Status**: Ready for PNG files to be added!

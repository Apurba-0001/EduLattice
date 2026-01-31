#!/usr/bin/env node

/**
 * Icon Generator for EduLattice
 *
 * This script generates all required icons from logo.svg
 *
 * Usage:
 *   npm run generate-icons
 *   or
 *   node scripts/generate-icons.js
 *
 * Requirements:
 *   npm install --save-dev sharp
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Configuration
const SOURCE_SVG = path.join(__dirname, "../public/logo.svg");
const PUBLIC_DIR = path.join(__dirname, "../public");

const ICONS = [
  { size: 16, name: "favicon-16x16.png", bg: true },
  { size: 32, name: "favicon-32x32.png", bg: true },
  { size: 64, name: "icon-64x64.png", bg: true },
  { size: 180, name: "apple-touch-icon.png", bg: true },
  { size: 192, name: "icon-192x192.png", bg: true },
  { size: 512, name: "icon-512x512.png", bg: true },
  { size: 192, name: "icon-192x192-maskable.png", bg: false },
  { size: 512, name: "icon-512x512-maskable.png", bg: false },
];

// Colors
const COLORS = {
  primary: "#6366f1",
  secondary: "#a855f7",
  white: "#ffffff",
};

async function generateIcons() {
  console.log("🎨 EduLattice Icon Generator\n");

  // Check if source SVG exists
  if (!fs.existsSync(SOURCE_SVG)) {
    console.error(`❌ Error: logo.svg not found at ${SOURCE_SVG}`);
    console.error("   Please ensure logo.svg exists in the public folder.");
    process.exit(1);
  }

  console.log(`📁 Source: ${SOURCE_SVG}`);
  console.log(`📁 Output: ${PUBLIC_DIR}\n`);

  let successCount = 0;
  let errorCount = 0;

  try {
    // Generate each icon size
    for (const icon of ICONS) {
      try {
        process.stdout.write(`⏳ Generating ${icon.name}...`);

        const svgBuffer = fs.readFileSync(SOURCE_SVG);

        let transform = sharp(svgBuffer).resize(icon.size, icon.size, {
          fit: "contain",
          background: icon.bg
            ? COLORS.white
            : { r: 255, g: 255, b: 255, alpha: 0 },
        });

        const outputPath = path.join(PUBLIC_DIR, icon.name);
        await transform.png({ quality: 90 }).toFile(outputPath);

        console.log(` ✅ (${icon.size}x${icon.size})`);
        successCount++;
      } catch (err) {
        console.log(` ❌ Error`);
        console.error(`   ${err.message}`);
        errorCount++;
      }
    }

    // Generate favicon.ico from 64x64 PNG
    try {
      process.stdout.write("⏳ Generating favicon.ico...");

      const svgBuffer = fs.readFileSync(SOURCE_SVG);
      const faviconPath = path.join(PUBLIC_DIR, "favicon.ico");

      await sharp(svgBuffer)
        .resize(64, 64, {
          fit: "contain",
          background: COLORS.white,
        })
        .png()
        .toFile(faviconPath);

      console.log(" ✅");
      successCount++;
    } catch (err) {
      console.log(" ❌ Error");
      console.error(`   ${err.message}`);
      errorCount++;
    }

    // Summary
    console.log(`\n${"=".repeat(50)}`);
    console.log(`📊 Generation Summary`);
    console.log(`${"=".repeat(50)}`);
    console.log(`✅ Successfully generated: ${successCount} icons`);

    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} icons`);
    }

    console.log(`\n📁 All icons are in: ${PUBLIC_DIR}\n`);

    // List generated files
    console.log("📋 Generated Files:");
    const generatedFiles = fs
      .readdirSync(PUBLIC_DIR)
      .filter(
        (f) =>
          f.includes("icon-") ||
          f.includes("favicon") ||
          f === "apple-touch-icon.png",
      )
      .sort();

    generatedFiles.forEach((file) => {
      const filePath = path.join(PUBLIC_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  • ${file} (${sizeKB} KB)`);
    });

    console.log(`\n${"=".repeat(50)}`);
    console.log("✨ Next Steps:");
    console.log(`${"=".repeat(50)}`);
    console.log("1. Refresh your browser (Ctrl+Shift+R)");
    console.log("2. Check DevTools → Application → Manifest");
    console.log("3. Test PWA installation (Chrome/Edge)");
    console.log("4. Deploy and verify on production\n");

    if (errorCount === 0) {
      console.log("🎉 All icons generated successfully!\n");
      process.exit(0);
    } else {
      console.log("⚠️  Some icons failed. Check errors above.\n");
      process.exit(1);
    }
  } catch (err) {
    console.error("\n❌ Unexpected error:", err.message);
    process.exit(1);
  }
}

// Run the generator
generateIcons();

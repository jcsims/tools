#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Copy public files to dist
if (fs.existsSync(PUBLIC_DIR)) {
  copyDir(PUBLIC_DIR, DIST_DIR);
}

// Get all apps
const apps = fs.readdirSync(APPS_DIR).filter(name => {
  const appPath = path.join(APPS_DIR, name);
  return fs.statSync(appPath).isDirectory() &&
         fs.existsSync(path.join(appPath, 'package.json'));
});

console.log(`Found ${apps.length} app(s): ${apps.join(', ')}\n`);

// Build each app
for (const app of apps) {
  const appPath = path.join(APPS_DIR, app);
  const appDistPath = path.join(appPath, 'dist');
  const targetPath = path.join(DIST_DIR, app);

  console.log(`\n📦 Building ${app}...`);

  try {
    // Install dependencies and build
    execSync('npm ci', { cwd: appPath, stdio: 'inherit' });
    execSync('npm run build', { cwd: appPath, stdio: 'inherit' });

    // Copy built files to dist/<app-name>
    if (fs.existsSync(appDistPath)) {
      copyDir(appDistPath, targetPath);
      console.log(`✅ ${app} built successfully`);
    } else {
      console.error(`❌ ${app} dist folder not found`);
    }
  } catch (error) {
    console.error(`❌ Failed to build ${app}:`, error.message);
    process.exit(1);
  }
}

console.log('\n🎉 All apps built successfully!');
console.log(`Output: ${DIST_DIR}`);

// Helper function to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

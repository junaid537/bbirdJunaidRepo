#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to minify a single JavaScript file
function minifyFile(inputPath, outputPath) {
  try {
    execSync(`npx terser "${inputPath}" --compress --mangle --output "${outputPath}"`);
    console.log(`Minified: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error minifying ${inputPath}:`, error.message);
  }
}

// Function to update import paths in minified files
function updateImportPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Update relative imports to point to minified versions (handle both spaced and non-spaced)
  // Handle ./script.js patterns
  content = content.replace(/from\s*["']\.\/(aem)\.js["']/g, 'from "./$1.min.js"');
  content = content.replace(/from["']\.\/(aem)\.js["']/g, 'from"./$1.min.js"');

  content = content.replace(/from\s*["']\.\/(scripts)\.js["']/g, 'from "./$1.min.js"');
  content = content.replace(/from["']\.\/(scripts)\.js["']/g, 'from"./$1.min.js"');

  content = content.replace(/from\s*["']\.\/(utils)\.js["']/g, 'from "./$1.min.js"');
  content = content.replace(/from["']\.\/(utils)\.js["']/g, 'from"./$1.min.js"');

  // Handle relative paths like ../../scripts/aem.js
  content = content.replace(/from\s*["']([^"']*\/scripts\/aem)\.js["']/g, 'from "$1.min.js"');
  content = content.replace(/from["']([^"']*\/scripts\/aem)\.js["']/g, 'from"$1.min.js"');

  content = content.replace(/from\s*["']([^"']*\/scripts\/scripts)\.js["']/g, 'from "$1.min.js"');
  content = content.replace(/from["']([^"']*\/scripts\/scripts)\.js["']/g, 'from"$1.min.js"');

  content = content.replace(/from\s*["']([^"']*\/scripts\/utils)\.js["']/g, 'from "$1.min.js"');
  content = content.replace(/from["']([^"']*\/scripts\/utils)\.js["']/g, 'from"$1.min.js"');

  // Update block imports to minified versions
  content = content.replace(/from\s*["']([^"']*\/blocks\/[^"']*\/[^"']*)\.js["']/g, 'from "$1.min.js"');
  content = content.replace(/from["']([^"']*\/blocks\/[^"']*\/[^"']*)\.js["']/g, 'from"$1.min.js"');

  // Handle import() calls as well
  content = content.replace(/import\(\s*["']([^"']*\/blocks\/[^"']*\/[^"']*)\.js["']\s*\)/g, 'import("$1.min.js")');
  content = content.replace(/import\(["']([^"']*\/blocks\/[^"']*\/[^"']*)\.js["']\)/g, 'import("$1.min.js")');

  // Handle import() with relative paths like ./delayed.js
  content = content.replace(/import\(\s*["']\.\/(delayed)\.js["']\s*\)/g, 'import("./$1.min.js")');
  content = content.replace(/import\(["']\.\/(delayed)\.js["']\)/g, 'import("./$1.min.js")');

  fs.writeFileSync(filePath, content);
}

// Main build process
function build() {
  console.log('Starting JavaScript minification process...');

  // Minify main scripts
  const scriptsDir = 'scripts';
  const scriptFiles = ['aem.js', 'scripts.js', 'utils.js', 'delayed.js'];

  scriptFiles.forEach((file) => {
    const inputPath = path.join(scriptsDir, file);
    const outputPath = path.join(scriptsDir, file.replace('.js', '.min.js'));

    if (fs.existsSync(inputPath)) {
      minifyFile(inputPath, outputPath);
    }
  });

  // Find and minify all block JavaScript files
  function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        processDirectory(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
        const inputPath = path.join(dir, entry.name);
        const outputPath = path.join(dir, entry.name.replace('.js', '.min.js'));

        minifyFile(inputPath, outputPath);
      }
    });
  }

  if (fs.existsSync('blocks')) {
    processDirectory('blocks');
  }

  // Update import paths in all minified files
  console.log('Updating import paths in minified files...');

  function updateMinifiedFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        updateMinifiedFiles(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.min.js')) {
        const filePath = path.join(dir, entry.name);
        updateImportPaths(filePath);
        console.log(`Updated imports in: ${filePath}`);
      }
    });
  }

  // Update imports in script files
  scriptFiles.forEach((file) => {
    const minifiedPath = path.join(scriptsDir, file.replace('.js', '.min.js'));
    if (fs.existsSync(minifiedPath)) {
      updateImportPaths(minifiedPath);
      console.log(`Updated imports in: ${minifiedPath}`);
    }
  });

  // Update imports in block files
  if (fs.existsSync('blocks')) {
    updateMinifiedFiles('blocks');
  }

  console.log('JavaScript minification completed successfully!');

  // Show compression statistics
  console.log('\nCompression Statistics:');
  const stats = [];

  scriptFiles.forEach((file) => {
    const originalPath = path.join(scriptsDir, file);
    const minifiedPath = path.join(scriptsDir, file.replace('.js', '.min.js'));

    if (fs.existsSync(originalPath) && fs.existsSync(minifiedPath)) {
      const originalSize = fs.statSync(originalPath).size;
      const minifiedSize = fs.statSync(minifiedPath).size;
      const reduction = (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1);

      stats.push({
        file,
        original: originalSize,
        minified: minifiedSize,
        reduction,
      });
    }
  });

  stats.forEach((stat) => {
    console.log(`${stat.file}: ${stat.original} -> ${stat.minified} bytes (${stat.reduction}% reduction)`);
  });
}

// Run the build if this script is executed directly
if (require.main === module) {
  build();
}

module.exports = { build };

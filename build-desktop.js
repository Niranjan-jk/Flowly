#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Flowly CRM for Desktop Distribution...\n');

async function buildProduction() {
  try {
    // Step 1: Build Next.js application
    console.log('📦 Step 1: Building Next.js application...');
    await runCommand('npm', ['run', 'build']);
    
    // Step 2: Export static files
    console.log('📁 Step 2: Exporting static files...');
    await runCommand('npm', ['run', 'export']);
    
    // Step 3: Build Electron distributables
    console.log('🔧 Step 3: Building Electron distributables...');
    await runCommand('npm', ['run', 'dist']);
    
    console.log('\n✅ Build completed successfully!');
    console.log('📦 Distribution files are available in the "dist" directory');
    console.log('🎉 Your Flowly CRM desktop application is ready for distribution!');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" failed with exit code ${code}`));
      }
    });
    
    process.on('error', reject);
  });
}

// Check if this is being run directly
if (require.main === module) {
  buildProduction();
}

module.exports = { buildProduction };
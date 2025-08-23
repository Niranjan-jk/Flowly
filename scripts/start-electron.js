#!/usr/bin/env node

const { spawn } = require('child_process');
const waitOn = require('wait-on');

async function startElectronApp() {
  console.log('🚀 Starting Flowly CRM Desktop App...');
  
  try {
    // Start Next.js development server
    console.log('📦 Starting Next.js development server...');
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Wait for Next.js to be ready
    console.log('⏳ Waiting for Next.js server to be ready...');
    await waitOn({
      resources: ['http://localhost:3000'],
      delay: 1000,
      interval: 100,
      timeout: 30000
    });

    console.log('✅ Next.js server is ready!');
    console.log('🖥️ Starting Electron app...');

    // Start Electron
    const electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Handle process cleanup
    const cleanup = () => {
      console.log('🧹 Cleaning up processes...');
      nextProcess.kill();
      electronProcess.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    electronProcess.on('close', () => {
      console.log('🔒 Electron app closed');
      nextProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start the application:', error);
    process.exit(1);
  }
}

startElectronApp();
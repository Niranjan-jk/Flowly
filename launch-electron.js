const { spawn } = require('child_process');
const path = require('path');

// Set environment variable
process.env.NODE_ENV = 'development';

console.log('Launching Electron in development mode...');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Launch Electron using direct binary path
const electronBinary = path.join(__dirname, 'node_modules', '.pnpm', 'electron@37.3.1', 'node_modules', 'electron', 'dist', 'electron.exe');

console.log('Electron binary path:', electronBinary);

const electronProcess = spawn(electronBinary, ['.'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
});

electronProcess.on('error', (err) => {
  console.error('Failed to start Electron:', err);
});
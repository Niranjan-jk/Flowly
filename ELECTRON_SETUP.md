# Flowly CRM Desktop Application

This document explains how to run and build the Flowly CRM as a desktop application using Electron.

## 🖥️ Available Commands

### Development

```bash
# Start the desktop app in development mode
npm run electron

# Alternative method (manual)
npm run dev  # In one terminal
npm run electron-dev  # In another terminal (after Next.js is ready)

# Or use the convenience script
node scripts/start-electron.js
```

### Building for Production

```bash
# Build and create distributable packages
npm run dist

# Build only (without packaging)
npm run build-electron

# Create app directory (without installer)
npm run pack
```

## 📁 Project Structure

```
flowly/
├── electron/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script for security
├── scripts/
│   └── start-electron.js # Development launcher
├── assets/              # App icons (create this folder)
│   ├── icon.png         # Linux icon
│   ├── icon.ico         # Windows icon
│   └── icon.icns        # macOS icon
└── dist/               # Built desktop app (generated)
```

## 🎯 How It Works

### Development Mode
1. **Next.js Development Server**: Runs on `http://localhost:3000`
2. **Electron Main Process**: Creates a window that loads the Next.js app
3. **Hot Reload**: Changes in your React code are reflected immediately
4. **DevTools**: Available for debugging (automatically opened in dev mode)

### Production Mode
1. **Static Export**: Next.js builds a static version of your app
2. **Electron Packaging**: Bundles the static files with Electron
3. **Installers**: Creates platform-specific installers (Windows .exe, macOS .dmg, Linux .AppImage)

## ⚙️ Configuration

### Electron Builder Settings

The `package.json` includes configuration for:
- **Windows**: NSIS installer and portable executable
- **macOS**: DMG installer with Apple Silicon support
- **Linux**: AppImage and Debian packages

### Next.js Configuration

The `next.config.ts` is configured for:
- Static export when building for production
- Disabled image optimization for Electron compatibility
- ESM external handling for better compatibility

## 🔧 Customization

### App Icons
Add icons to the `assets/` folder:
- `icon.png` (512x512) for Linux
- `icon.ico` (multiple sizes) for Windows  
- `icon.icns` (multiple sizes) for macOS

### Window Properties
Edit `electron/main.js` to customize:
- Window size and minimum dimensions
- Menu bar options
- Security settings
- Auto-updater configuration

### Build Configuration
Modify the `"build"` section in `package.json` to:
- Change app metadata (name, ID, category)
- Adjust file inclusion/exclusion
- Configure installer options
- Set up code signing

## 🚀 Getting Started

1. **Install Dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Run in Development**:
   ```bash
   npm run electron
   ```

3. **Build for Distribution**:
   ```bash
   npm run dist
   ```

## 📱 Platform Support

- **Windows**: Windows 10+ (x64)
- **macOS**: macOS 10.15+ (Intel & Apple Silicon)
- **Linux**: Ubuntu 18.04+ compatible distributions (x64)

## 🔒 Security Features

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer process
- **Preload Scripts**: Used for safe API exposure
- **Content Security Policy**: Configured for web security
- **External Link Handling**: Opens external links in default browser

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   ```bash
   # Kill existing Next.js process
   npx kill-port 3000
   ```

2. **Electron fails to start**:
   - Ensure Next.js server is running first
   - Check for console errors in terminal
   - Try running `npm run dev` separately first

3. **Build errors**:
   - Verify all dependencies are installed
   - Check Next.js build succeeds: `npm run build`
   - Ensure static export works: `npm run export`

### Debug Mode

Add debugging to Electron:
```bash
# Enable Electron debug output
DEBUG=electron* npm run electron-dev
```

## 🎉 Features

✅ **Development Hot Reload**: Changes reflect immediately  
✅ **Production Builds**: Creates installable desktop apps  
✅ **Cross Platform**: Works on Windows, macOS, and Linux  
✅ **Security Hardened**: Modern Electron security practices  
✅ **Menu Integration**: Native menu bar with shortcuts  
✅ **Window Management**: Proper window state handling  
✅ **External Links**: Safe handling of external websites  

Your Flowly CRM is now ready to run as a native desktop application! 🎊
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Add any APIs you want to expose to the renderer process
  platform: process.platform,
  versions: process.versions,
  
  // Add methods here as needed for your application
  // openExternal: (url) => ipcRenderer.invoke('open-external', url),
  // showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
});

// Prevent new window creation
window.addEventListener('DOMContentLoaded', () => {
  // Prevent context menu in production
  if (process.env.NODE_ENV !== 'development') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
});
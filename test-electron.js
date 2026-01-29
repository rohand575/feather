// Debug info about the environment
console.log('=== Environment Debug ===');
console.log('process.type:', process.type);
console.log('process.versions:', process.versions);
console.log('process.resourcesPath:', process.resourcesPath);

// Check if we're in Electron by looking at versions
if (process.versions.electron) {
  console.log('Running in Electron version:', process.versions.electron);

  // Try to require electron
  try {
    const electron = require('electron');
    console.log('electron:', typeof electron);
    console.log('electron.app:', electron.app);
  } catch(e) {
    console.log('Error requiring electron:', e.message);
  }
} else {
  console.log('NOT running in Electron (no electron version in process.versions)');
}

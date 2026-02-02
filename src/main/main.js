const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, shell } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AutoLaunch = require('auto-launch');

// Single instance lock - must be called early
const gotTheLock = app.requestSingleInstanceLock();

let mainWindow = null;
let tray = null;
let db = null;
let isQuitting = false;

// Auto-launch configuration
const featherAutoLauncher = new AutoLaunch({
  name: 'Feather',
  path: app.getPath('exe'),
  isHidden: true
});

// Disable hardware acceleration for faster startup
app.disableHardwareAcceleration();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showWindow();
  });

  // Continue with app initialization
  initApp();
}

function initApp() {
  app.whenReady().then(async () => {
    // Initialize database after app is ready
    const Database = require('./database');
    db = new Database();

    // Enable auto-launch on Windows startup
    try {
      const isEnabled = await featherAutoLauncher.isEnabled();
      if (!isEnabled) {
        await featherAutoLauncher.enable();
      }
    } catch (err) {
      console.error('Auto-launch error:', err);
    }

    setupIpcHandlers();
    createWindow();
    createTray();
    registerGlobalShortcuts();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // Keep app running in tray on Windows
    }
  });

  app.on('before-quit', () => {
    isQuitting = true;
    if (db) {
      db.close();
    }
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#1a1a1f',
    show: false,
    center: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle close - hide instead of quit (for quick reopen)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showWindow() {
  if (mainWindow === null) {
    createWindow();
  } else if (!mainWindow.isVisible()) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    mainWindow.focus();
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch (e) {
    trayIcon = nativeImage.createEmpty();
  }

  // Use fallback icon if needed
  const fallbackIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADLSURBVDiNrdMxSgNBGAXg7xdtPIGdnZXgCbyAR/AAHsJjeABP4QW8gJWVjYVewMLCQkRQBGGLn2V3sxvXhw+GYd78M/MmGaS0f6ThBiN8pLRAoLNE8Iw+NpaeX+ITdrCfyqpB8AXWMUQfF8sErmEDHbzjNpUVA2zgO5V1c3jHGKdLBF5xgDFOUlkxMMAX9nGOt1TWDQK7uMMerpeeTwhc4gS7uFp6vpBojAOcYZBq1sAYR7hYerwYuIczHOMslS0EYoIfDHGZ0h9FfwHYe0FfgC4FMAAAAABJRU5ErkJggg==');

  tray = new Tray(trayIcon.isEmpty() ? fallbackIcon : trayIcon);

  tray.setToolTip('Feather - Press Ctrl+Alt+N to open');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Feather', click: showWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', showWindow);
}

function registerGlobalShortcuts() {
  // Global shortcut to open app
  globalShortcut.register('CommandOrControl+Alt+N', showWindow);
}

// IPC Handlers for database operations
function setupIpcHandlers() {
  ipcMain.handle('db:getAllNotes', async () => {
    return db.getAllNotes();
  });

  ipcMain.handle('db:getNote', async (event, id) => {
    return db.getNote(id);
  });

  ipcMain.handle('db:createNote', async (event, content) => {
    return db.createNote(content);
  });

  ipcMain.handle('db:updateNote', async (event, id, content) => {
    return db.updateNote(id, content);
  });

  ipcMain.handle('db:deleteNote', async (event, id) => {
    return db.deleteNote(id);
  });

  ipcMain.handle('db:getTodayNote', async () => {
    return db.getTodayNote();
  });

  ipcMain.handle('db:createTodayNote', async () => {
    return db.createTodayNote();
  });

  // Window controls
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.on('window:toggleFocusMode', (event, enabled) => {
    if (mainWindow) {
      if (enabled) {
        mainWindow.setFullScreen(true);
      } else {
        mainWindow.setFullScreen(false);
      }
    }
  });

  // Download note to Desktop/Notes folder
  ipcMain.handle('note:download', async (event, filename, content) => {
    const desktopPath = path.join(os.homedir(), 'Desktop', 'Notes');

    // Create Notes folder if it doesn't exist
    if (!fs.existsSync(desktopPath)) {
      fs.mkdirSync(desktopPath, { recursive: true });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
    const filePath = path.join(desktopPath, `${sanitizedFilename}.txt`);

    // Write file
    fs.writeFileSync(filePath, content, 'utf8');

    return { success: true, path: filePath };
  });

  // Open external URL in system default browser
  ipcMain.handle('shell:openExternal', async (event, url) => {
    // Validate URL to prevent security issues
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        await shell.openExternal(url);
        return { success: true };
      }
    } catch (err) {
      console.error('Invalid URL:', err);
    }
    return { success: false };
  });
}

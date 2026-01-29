const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// Single instance lock - must be called early
const gotTheLock = app.requestSingleInstanceLock();

let mainWindow = null;
let tray = null;
let db = null;
let isQuitting = false;

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
  app.whenReady().then(() => {
    // Initialize database after app is ready
    const Database = require('./database');
    db = new Database();

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
}

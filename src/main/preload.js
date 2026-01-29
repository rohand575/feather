const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('feather', {
  // Database operations
  getAllNotes: () => ipcRenderer.invoke('db:getAllNotes'),
  getNote: (id) => ipcRenderer.invoke('db:getNote', id),
  createNote: (content) => ipcRenderer.invoke('db:createNote', content),
  updateNote: (id, content) => ipcRenderer.invoke('db:updateNote', id, content),
  deleteNote: (id) => ipcRenderer.invoke('db:deleteNote', id),
  getTodayNote: () => ipcRenderer.invoke('db:getTodayNote'),
  createTodayNote: () => ipcRenderer.invoke('db:createTodayNote'),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  toggleFocusMode: (enabled) => ipcRenderer.send('window:toggleFocusMode', enabled)
});

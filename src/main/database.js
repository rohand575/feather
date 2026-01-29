const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

class FeatherDatabase {
  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'feather-notes.json');
    this.data = { notes: [] };
    this.saveTimeout = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure notes array exists
        if (!Array.isArray(this.data.notes)) {
          this.data.notes = [];
        }
      }
    } catch (e) {
      console.error('Failed to load database:', e);
      this.data = { notes: [] };
    }
  }

  save() {
    // Debounce saves to avoid excessive disk writes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveSync();
    }, 100);
  }

  saveSync() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to temp file first, then rename for atomic operation
      const tempPath = this.dbPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (e) {
      console.error('Failed to save database:', e);
      // Try direct write as fallback
      try {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
      } catch (e2) {
        console.error('Fallback save also failed:', e2);
      }
    }
  }

  getAllNotes() {
    // Sort by updatedAt descending
    return [...this.data.notes].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getNote(id) {
    return this.data.notes.find(n => n.id === id) || null;
  }

  createNote(content = '') {
    const id = uuidv4();
    const now = Date.now();

    const note = {
      id,
      content,
      createdAt: now,
      updatedAt: now,
      isDaily: 0,
      dailyDate: null
    };

    this.data.notes.push(note);
    this.save();

    return note;
  }

  updateNote(id, content) {
    const note = this.data.notes.find(n => n.id === id);
    if (note) {
      note.content = content;
      note.updatedAt = Date.now();
      this.save();
      return true;
    }
    return false;
  }

  deleteNote(id) {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.data.notes.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  getTodayNote() {
    const today = this.getTodayDateString();
    return this.data.notes.find(n => n.isDaily === 1 && n.dailyDate === today) || null;
  }

  createTodayNote() {
    const today = this.getTodayDateString();

    // Check if today's note already exists
    const existing = this.getTodayNote();
    if (existing) {
      return existing;
    }

    const id = uuidv4();
    const now = Date.now();

    const note = {
      id,
      content: '',
      createdAt: now,
      updatedAt: now,
      isDaily: 1,
      dailyDate: today
    };

    this.data.notes.push(note);
    this.save();

    return note;
  }

  getTodayDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  close() {
    // Ensure final save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveSync();
  }
}

module.exports = FeatherDatabase;

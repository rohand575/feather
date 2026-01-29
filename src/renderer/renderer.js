// ===== State =====
let notes = [];
let currentNoteId = null;
let saveTimeout = null;
let emojiSelectedIndex = 0;
let filteredEmojis = [];
let isFocusMode = false;

// ===== Common Emojis =====
const emojis = [
  // Smileys
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘',
  '😋', '😛', '😜', '🤪', '😝', '🤗', '🤔', '🤫', '🤭', '😶', '😏', '😒', '🙄', '😬', '😮',
  '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩',
  // Gestures
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️',
  // Hearts & Symbols
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗',
  '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
  // Objects
  '📝', '📄', '📃', '📑', '🗒️', '📓', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📰', '🗞️',
  '✏️', '✒️', '🖊️', '🖋️', '📌', '📍', '🔖', '🏷️', '💡', '🔦', '🏮', '📦', '📫', '📬', '📭',
  // Nature
  '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾',
  '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪴', '🌍', '🌎', '🌏', '🌐', '🌑', '🌒', '🌓', '🌔',
  // Weather & Time
  '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨',
  '🌈', '🌊', '💧', '💦', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '🌙', '🌛', '🌜', '🌝', '🌞',
  // Activities
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑',
  '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿',
  // Food
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
  '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
  // Miscellaneous
  '🎉', '🎊', '🎈', '🎁', '🎀', '🪅', '🪆', '🧸', '🎭', '🎨', '🧵', '🧶', '🪡', '🧷', '🪢',
  '💎', '💍', '👑', '🎩', '🎓', '🧢', '👒', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷'
];

// ===== DOM Elements =====
const elements = {
  editor: document.getElementById('editor'),
  notesList: document.getElementById('notesList'),
  newNoteBtn: document.getElementById('newNoteBtn'),
  timeWhisper: document.getElementById('timeWhisper'),
  charCount: document.getElementById('charCount'),
  emojiPicker: document.getElementById('emojiPicker'),
  emojiGrid: document.getElementById('emojiGrid'),
  emojiSearch: document.getElementById('emojiSearch'),
  deleteModal: document.getElementById('deleteModal'),
  cancelDelete: document.getElementById('cancelDelete'),
  confirmDelete: document.getElementById('confirmDelete'),
  helpBtn: document.getElementById('helpBtn'),
  helpModal: document.getElementById('helpModal'),
  closeHelp: document.getElementById('closeHelp'),
  formatToolbar: document.getElementById('formatToolbar'),
  minimizeBtn: document.getElementById('minimizeBtn'),
  maximizeBtn: document.getElementById('maximizeBtn'),
  closeBtn: document.getElementById('closeBtn'),
  sidebar: document.getElementById('sidebar')
};

// ===== Initialization =====
async function init() {
  await loadNotes();
  await ensureTodayNote();
  renderNotesList();
  setupEventListeners();
  setupKeyboardShortcuts();

  // Select today's note by default
  const todayNote = notes.find(n => n.isDaily && n.dailyDate === getTodayDateString());
  if (todayNote) {
    selectNote(todayNote.id);
  } else if (notes.length > 0) {
    selectNote(notes[0].id);
  }
}

// ===== Data Operations =====
async function loadNotes() {
  notes = await window.feather.getAllNotes();
}

async function ensureTodayNote() {
  const todayNote = notes.find(n => n.isDaily && n.dailyDate === getTodayDateString());
  if (!todayNote) {
    const newTodayNote = await window.feather.createTodayNote();
    notes.unshift(newTodayNote);
  }
}

async function createNote() {
  const newNote = await window.feather.createNote('');
  notes.unshift(newNote);
  renderNotesList();
  selectNote(newNote.id);
  elements.editor.focus();
}

async function saveNote() {
  if (!currentNoteId) return;

  const content = elements.editor.value;
  await window.feather.updateNote(currentNoteId, content);

  // Update local state
  const note = notes.find(n => n.id === currentNoteId);
  if (note) {
    note.content = content;
    note.updatedAt = Date.now();
  }

  renderNotesList();
  updateTimeWhisper();
}

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveNote, 300);
}

async function deleteNote() {
  const idToDelete = noteToDeleteId || currentNoteId;
  if (!idToDelete) return;

  const note = notes.find(n => n.id === idToDelete);

  // Don't allow deleting today's note
  if (note?.isDaily && note?.dailyDate === getTodayDateString()) {
    return;
  }

  await window.feather.deleteNote(idToDelete);
  notes = notes.filter(n => n.id !== idToDelete);

  hideDeleteModal();
  renderNotesList();

  // If we deleted the current note, select another one
  if (idToDelete === currentNoteId) {
    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      currentNoteId = null;
      elements.editor.value = '';
    }
  }
}

// ===== Note Selection =====
function selectNote(id) {
  currentNoteId = id;
  const note = notes.find(n => n.id === id);

  if (note) {
    elements.editor.value = note.content;
    updateTimeWhisper();
    updateCharCount();
    renderNotesList();
    elements.editor.focus();
  }
}

// ===== Rendering =====
function renderNotesList() {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const today = getTodayDateString();

  if (notes.length === 0) {
    elements.notesList.innerHTML = '<div class="notes-list-empty">No notes yet</div>';
    return;
  }

  elements.notesList.innerHTML = notes.map(note => {
    const title = getNoteTitle(note);
    const time = formatTimeWhisper(note.updatedAt);
    const isActive = note.id === currentNoteId;
    const isFaded = note.updatedAt < sevenDaysAgo;
    const isDaily = note.isDaily && note.dailyDate === today;
    const canDelete = !(note.isDaily && note.dailyDate === today);

    return `
      <div class="note-item ${isActive ? 'active' : ''} ${isFaded ? 'faded' : ''} ${isDaily ? 'daily' : ''}"
           data-id="${note.id}">
        <div class="note-item-content">
          <div class="note-title">${escapeHtml(title)}</div>
          <div class="note-time">${time}</div>
        </div>
        ${canDelete ? `
          <button class="note-delete-btn" data-id="${note.id}" title="Delete note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  // Add click handlers for note selection
  elements.notesList.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't select if clicking delete button
      if (e.target.closest('.note-delete-btn')) return;
      selectNote(item.dataset.id);
    });
  });

  // Add click handlers for delete buttons
  elements.notesList.querySelectorAll('.note-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.id;
      showDeleteModalForNote(noteId);
    });
  });
}

function getNoteTitle(note) {
  if (note.isDaily && note.dailyDate === getTodayDateString()) {
    return 'Today';
  }

  if (note.isDaily) {
    return formatDailyDate(note.dailyDate);
  }

  const firstLine = note.content.split('\n')[0].trim();
  return firstLine || 'Untitled';
}

function formatDailyDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ===== Ritual Prompt =====
// ===== Time Whisper =====
function updateTimeWhisper() {
  const note = notes.find(n => n.id === currentNoteId);
  if (note) {
    elements.timeWhisper.textContent = formatTimeWhisper(note.updatedAt);
  } else {
    elements.timeWhisper.textContent = '';
  }
}

function formatTimeWhisper(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `Edited ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
    return `Edited ${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days === 1) {
    const date = new Date(timestamp);
    return `Yesterday at ${formatTime(date)}`;
  } else if (days < 7) {
    const date = new Date(timestamp);
    return `${days} days ago at ${formatTime(date)}`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// ===== Character Count =====
function updateCharCount() {
  const count = elements.editor.value.length;
  elements.charCount.textContent = `${count.toLocaleString()} characters`;
}

// ===== Emoji Picker =====
function showEmojiPicker() {
  const selection = elements.editor.selectionStart;
  const rect = elements.editor.getBoundingClientRect();

  // Calculate approximate position based on cursor
  const lines = elements.editor.value.substring(0, selection).split('\n');
  const lineHeight = 28; // Approximate line height
  const charWidth = 10; // Approximate character width

  let top = rect.top + (lines.length * lineHeight) + 30;
  let left = rect.left + (lines[lines.length - 1].length * charWidth);

  // Keep picker in viewport
  const pickerWidth = 320;
  const pickerHeight = 300;

  if (left + pickerWidth > window.innerWidth) {
    left = window.innerWidth - pickerWidth - 20;
  }
  if (top + pickerHeight > window.innerHeight) {
    top = window.innerHeight - pickerHeight - 20;
  }

  elements.emojiPicker.style.top = `${Math.max(50, top)}px`;
  elements.emojiPicker.style.left = `${Math.max(20, left)}px`;

  elements.emojiPicker.classList.add('visible');
  elements.emojiSearch.value = '';
  elements.emojiSearch.focus();

  filteredEmojis = [...emojis];
  emojiSelectedIndex = 0;
  renderEmojiGrid();
}

function hideEmojiPicker() {
  elements.emojiPicker.classList.remove('visible');
  elements.editor.focus();
}

function renderEmojiGrid() {
  elements.emojiGrid.innerHTML = filteredEmojis.map((emoji, index) => `
    <div class="emoji-item ${index === emojiSelectedIndex ? 'selected' : ''}"
         data-emoji="${emoji}"
         data-index="${index}">
      ${emoji}
    </div>
  `).join('');

  // Add click handlers
  elements.emojiGrid.querySelectorAll('.emoji-item').forEach(item => {
    item.addEventListener('click', () => {
      insertEmoji(item.dataset.emoji);
    });
  });

  // Scroll selected into view
  const selected = elements.emojiGrid.querySelector('.selected');
  if (selected) {
    selected.scrollIntoView({ block: 'nearest' });
  }
}

function filterEmojis(query) {
  if (!query) {
    filteredEmojis = [...emojis];
  } else {
    // Simple filter - in a production app, you'd use emoji keywords
    filteredEmojis = emojis.filter(() => Math.random() > 0.7); // Placeholder
    if (filteredEmojis.length === 0) filteredEmojis = [...emojis];
  }
  emojiSelectedIndex = 0;
  renderEmojiGrid();
}

function insertEmoji(emoji) {
  const start = elements.editor.selectionStart;
  const end = elements.editor.selectionEnd;
  const text = elements.editor.value;

  elements.editor.value = text.substring(0, start) + emoji + text.substring(end);
  elements.editor.selectionStart = elements.editor.selectionEnd = start + emoji.length;

  hideEmojiPicker();
  debouncedSave();
  updateCharCount();
}

// ===== Focus Mode =====
function toggleFocusMode() {
  isFocusMode = !isFocusMode;

  if (isFocusMode) {
    document.getElementById('app').classList.add('focus-mode');
    window.feather.toggleFocusMode(true);
  } else {
    document.getElementById('app').classList.remove('focus-mode');
    window.feather.toggleFocusMode(false);
  }
}

// ===== Delete Modal =====
let noteToDeleteId = null;

function showDeleteModal() {
  showDeleteModalForNote(currentNoteId);
}

function showDeleteModalForNote(noteId) {
  const note = notes.find(n => n.id === noteId);

  // Don't allow deleting today's note
  if (note?.isDaily && note?.dailyDate === getTodayDateString()) {
    return;
  }

  noteToDeleteId = noteId;
  elements.deleteModal.classList.add('visible');
}

function hideDeleteModal() {
  elements.deleteModal.classList.remove('visible');
  noteToDeleteId = null;
}

// ===== Help Modal =====
function showHelpModal() {
  elements.helpModal.classList.add('visible');
}

function hideHelpModal() {
  elements.helpModal.classList.remove('visible');
}

// ===== Text Formatting =====
function applyFormat(format) {
  const editor = elements.editor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  const selectedText = text.substring(start, end);

  let replacement = '';
  let cursorOffset = 0;

  // Get the start of the current line
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = text.indexOf('\n', end);
  const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;
  const currentLine = text.substring(lineStart, actualLineEnd);

  switch (format) {
    case 'bold':
      if (selectedText) {
        replacement = `**${selectedText}**`;
      } else {
        replacement = '****';
        cursorOffset = -2;
      }
      break;

    case 'italic':
      if (selectedText) {
        replacement = `*${selectedText}*`;
      } else {
        replacement = '**';
        cursorOffset = -1;
      }
      break;

    case 'strikethrough':
      if (selectedText) {
        replacement = `~~${selectedText}~~`;
      } else {
        replacement = '~~~~';
        cursorOffset = -2;
      }
      break;

    case 'bullet':
      // Apply to each selected line or current line
      if (selectedText.includes('\n')) {
        const lines = selectedText.split('\n');
        replacement = lines.map(line => `- ${line}`).join('\n');
      } else if (start === end) {
        // No selection, add bullet at line start
        const beforeLine = text.substring(0, lineStart);
        const afterLine = text.substring(lineStart);
        editor.value = beforeLine + '- ' + afterLine;
        editor.selectionStart = editor.selectionEnd = start + 2;
        debouncedSave();
        updateCharCount();
        return;
      } else {
        replacement = `- ${selectedText}`;
      }
      break;

    case 'numbered':
      if (selectedText.includes('\n')) {
        const lines = selectedText.split('\n');
        replacement = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
      } else if (start === end) {
        const beforeLine = text.substring(0, lineStart);
        const afterLine = text.substring(lineStart);
        editor.value = beforeLine + '1. ' + afterLine;
        editor.selectionStart = editor.selectionEnd = start + 3;
        debouncedSave();
        updateCharCount();
        return;
      } else {
        replacement = `1. ${selectedText}`;
      }
      break;

    case 'checkbox':
      if (selectedText.includes('\n')) {
        const lines = selectedText.split('\n');
        replacement = lines.map(line => `- [ ] ${line}`).join('\n');
      } else if (start === end) {
        const beforeLine = text.substring(0, lineStart);
        const afterLine = text.substring(lineStart);
        editor.value = beforeLine + '- [ ] ' + afterLine;
        editor.selectionStart = editor.selectionEnd = start + 6;
        debouncedSave();
        updateCharCount();
        return;
      } else {
        replacement = `- [ ] ${selectedText}`;
      }
      break;

    case 'heading':
      if (start === end) {
        // Toggle heading on current line
        const beforeLine = text.substring(0, lineStart);
        const afterLine = text.substring(actualLineEnd);
        let newLine = currentLine;

        if (currentLine.startsWith('### ')) {
          newLine = currentLine.substring(4);
        } else if (currentLine.startsWith('## ')) {
          newLine = '### ' + currentLine.substring(3);
        } else if (currentLine.startsWith('# ')) {
          newLine = '## ' + currentLine.substring(2);
        } else {
          newLine = '# ' + currentLine;
        }

        editor.value = beforeLine + newLine + afterLine;
        editor.selectionStart = editor.selectionEnd = lineStart + newLine.length;
        debouncedSave();
        updateCharCount();
        return;
      } else {
        replacement = `# ${selectedText}`;
      }
      break;

    case 'quote':
      if (selectedText.includes('\n')) {
        const lines = selectedText.split('\n');
        replacement = lines.map(line => `> ${line}`).join('\n');
      } else if (start === end) {
        const beforeLine = text.substring(0, lineStart);
        const afterLine = text.substring(lineStart);
        editor.value = beforeLine + '> ' + afterLine;
        editor.selectionStart = editor.selectionEnd = start + 2;
        debouncedSave();
        updateCharCount();
        return;
      } else {
        replacement = `> ${selectedText}`;
      }
      break;

    case 'code':
      if (selectedText.includes('\n')) {
        replacement = '```\n' + selectedText + '\n```';
      } else if (selectedText) {
        replacement = '`' + selectedText + '`';
      } else {
        replacement = '``';
        cursorOffset = -1;
      }
      break;

    default:
      return;
  }

  // Apply the replacement
  editor.value = text.substring(0, start) + replacement + text.substring(end);

  // Set cursor position
  const newPosition = start + replacement.length + cursorOffset;
  editor.selectionStart = editor.selectionEnd = newPosition;

  editor.focus();
  debouncedSave();
  updateCharCount();
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Editor events
  elements.editor.addEventListener('input', () => {
    debouncedSave();
    updateCharCount();
  });

  // New note button
  elements.newNoteBtn.addEventListener('click', createNote);

  // Window controls
  elements.minimizeBtn.addEventListener('click', () => window.feather.minimize());
  elements.maximizeBtn.addEventListener('click', () => window.feather.maximize());
  elements.closeBtn.addEventListener('click', () => window.feather.close());

  // Delete modal
  elements.cancelDelete.addEventListener('click', hideDeleteModal);
  elements.confirmDelete.addEventListener('click', deleteNote);

  // Help modal
  elements.helpBtn.addEventListener('click', showHelpModal);
  elements.closeHelp.addEventListener('click', hideHelpModal);
  elements.helpModal.addEventListener('click', (e) => {
    if (e.target === elements.helpModal) {
      hideHelpModal();
    }
  });

  // Format toolbar buttons
  elements.formatToolbar.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      applyFormat(format);
    });
  });

  // Emoji search
  elements.emojiSearch.addEventListener('input', (e) => {
    filterEmojis(e.target.value);
  });

  // Close emoji picker on outside click
  document.addEventListener('click', (e) => {
    if (!elements.emojiPicker.contains(e.target) && elements.emojiPicker.classList.contains('visible')) {
      hideEmojiPicker();
    }
  });

  // Close modal on outside click
  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) {
      hideDeleteModal();
    }
  });
}

// ===== Keyboard Shortcuts =====
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Emoji picker navigation
    if (elements.emojiPicker.classList.contains('visible')) {
      const cols = 8;
      const rows = Math.ceil(filteredEmojis.length / cols);

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          emojiSelectedIndex = Math.min(emojiSelectedIndex + 1, filteredEmojis.length - 1);
          renderEmojiGrid();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          emojiSelectedIndex = Math.max(emojiSelectedIndex - 1, 0);
          renderEmojiGrid();
          break;
        case 'ArrowDown':
          e.preventDefault();
          emojiSelectedIndex = Math.min(emojiSelectedIndex + cols, filteredEmojis.length - 1);
          renderEmojiGrid();
          break;
        case 'ArrowUp':
          e.preventDefault();
          emojiSelectedIndex = Math.max(emojiSelectedIndex - cols, 0);
          renderEmojiGrid();
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredEmojis[emojiSelectedIndex]) {
            insertEmoji(filteredEmojis[emojiSelectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          hideEmojiPicker();
          break;
      }
      return;
    }

    // Global shortcuts
    const isCtrl = e.ctrlKey || e.metaKey;
    const isAlt = e.altKey;

    // Ctrl + N: New note
    if (isCtrl && !isAlt && e.key === 'n') {
      e.preventDefault();
      createNote();
    }

    // Ctrl + W: Delete note
    if (isCtrl && !isAlt && e.key === 'w') {
      e.preventDefault();
      showDeleteModal();
    }

    // Ctrl + B: Bold
    if (isCtrl && !isAlt && e.key === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }

    // Ctrl + I: Italic
    if (isCtrl && !isAlt && e.key === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }

    // Ctrl + Alt + F: Focus mode
    if (isCtrl && isAlt && e.key === 'f') {
      e.preventDefault();
      toggleFocusMode();
    }

    // Ctrl + .: Emoji picker
    if (isCtrl && e.key === '.') {
      e.preventDefault();
      if (elements.emojiPicker.classList.contains('visible')) {
        hideEmojiPicker();
      } else {
        showEmojiPicker();
      }
    }

    // Escape: Exit focus mode or close modals
    if (e.key === 'Escape') {
      if (isFocusMode) {
        toggleFocusMode();
      } else if (elements.helpModal.classList.contains('visible')) {
        hideHelpModal();
      } else if (elements.deleteModal.classList.contains('visible')) {
        hideDeleteModal();
      } else if (elements.emojiPicker.classList.contains('visible')) {
        hideEmojiPicker();
      }
    }
  });
}

// ===== Utilities =====
function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== Start =====
init();

// ===== State =====
let notes = [];
let currentNoteId = null;
let saveTimeout = null;
let emojiSelectedIndex = 0;
let filteredEmojis = [];
let isFocusMode = false;
let searchQuery = '';

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
  searchInput: document.getElementById('searchInput'),
  themeToggle: document.getElementById('themeToggle'),
  minimizeBtn: document.getElementById('minimizeBtn'),
  maximizeBtn: document.getElementById('maximizeBtn'),
  closeBtn: document.getElementById('closeBtn'),
  sidebar: document.getElementById('sidebar'),
  downloadBtn: document.getElementById('downloadBtn'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage'),
  tableContextMenu: document.getElementById('tableContextMenu')
};

// ===== Initialization =====
async function init() {
  // Load saved theme
  loadTheme();

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

// ===== Theme =====
function loadTheme() {
  const savedTheme = localStorage.getItem('feather-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('feather-theme', newTheme);
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

  const content = elements.editor.innerHTML;
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
      elements.editor.innerHTML = '';
    }
  }
}

// ===== Note Selection =====
function selectNote(id) {
  currentNoteId = id;
  const note = notes.find(n => n.id === id);

  if (note) {
    elements.editor.innerHTML = note.content;
    ensureFirstLineTitle();
    updateTimeWhisper();
    updateCharCount();
    renderNotesList();
    elements.editor.focus();
  }
}

// ===== First Line Title Handling =====
function ensureFirstLineTitle() {
  // If editor is empty or has no wrapped first element, wrap the first line
  const firstChild = elements.editor.firstChild;

  if (!firstChild) return;

  // If first child is a text node with content, wrap it in a title div
  if (firstChild.nodeType === Node.TEXT_NODE && firstChild.textContent.trim()) {
    const text = firstChild.textContent;
    const lines = text.split('\n');
    const firstLine = lines[0];
    const rest = lines.slice(1).join('\n');

    const titleDiv = document.createElement('div');
    titleDiv.className = 'first-line-title';
    titleDiv.textContent = firstLine;

    elements.editor.removeChild(firstChild);
    elements.editor.insertBefore(titleDiv, elements.editor.firstChild);

    if (rest) {
      const restNode = document.createTextNode(rest);
      titleDiv.after(restNode);
    }
  }
}

// ===== Rendering =====
function renderNotesList() {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const today = getTodayDateString();

  // Filter notes based on search query
  let filteredNotes = notes;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredNotes = notes.filter(note => {
      const title = getNoteTitle(note).toLowerCase();
      // Strip HTML and search in content
      const temp = document.createElement('div');
      temp.innerHTML = note.content;
      const textContent = (temp.textContent || temp.innerText || '').toLowerCase();
      return title.includes(query) || textContent.includes(query);
    });
  }

  if (filteredNotes.length === 0) {
    if (searchQuery.trim()) {
      elements.notesList.innerHTML = '<div class="notes-list-empty">No matching notes</div>';
    } else {
      elements.notesList.innerHTML = '<div class="notes-list-empty">No notes yet</div>';
    }
    return;
  }

  elements.notesList.innerHTML = filteredNotes.map(note => {
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

  // Parse HTML and get first line properly
  const temp = document.createElement('div');
  temp.innerHTML = note.content;

  // Replace block elements with newlines to properly detect line breaks
  const blockTags = ['div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'blockquote'];
  blockTags.forEach(tag => {
    temp.querySelectorAll(tag).forEach(el => {
      el.insertAdjacentText('beforebegin', '\n');
    });
  });

  const textContent = temp.textContent || temp.innerText || '';

  // Split by newlines and get the first non-empty line
  const lines = textContent.split('\n');
  let firstLine = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      firstLine = trimmed;
      break;
    }
  }

  return firstLine.substring(0, 50) || 'Untitled';
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
  const count = elements.editor.innerText.length;
  elements.charCount.textContent = `${count.toLocaleString()} characters`;
}

// ===== Emoji Picker =====
let savedSelection = null;

function showEmojiPicker() {
  // Save the current selection before opening picker
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedSelection = sel.getRangeAt(0).cloneRange();
  }

  const rect = elements.editor.getBoundingClientRect();

  // Position near the center of the editor
  let top = rect.top + 100;
  let left = rect.left + (rect.width / 2) - 160;

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
  elements.editor.focus();

  // Restore the saved selection
  if (savedSelection) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  }

  // Insert the emoji at cursor position
  document.execCommand('insertText', false, emoji);

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
  elements.editor.focus();

  switch (format) {
    case 'bold':
      document.execCommand('bold', false, null);
      break;

    case 'italic':
      document.execCommand('italic', false, null);
      break;

    case 'strikethrough':
      document.execCommand('strikeThrough', false, null);
      break;

    case 'bullet':
      document.execCommand('insertUnorderedList', false, null);
      break;

    case 'numbered':
      document.execCommand('insertOrderedList', false, null);
      break;

    case 'checkbox':
      // Insert a checkbox using HTML
      const checkboxHtml = '<label style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;"><input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;"> </label>';
      document.execCommand('insertHTML', false, checkboxHtml);
      break;

    case 'heading':
      // Get the current block and toggle heading
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.startContainer;

        // Get the parent block element
        while (container && container !== elements.editor && container.nodeType !== 1) {
          container = container.parentNode;
        }

        if (container && container !== elements.editor) {
          const tagName = container.tagName?.toLowerCase();
          if (tagName === 'h1') {
            document.execCommand('formatBlock', false, 'h2');
          } else if (tagName === 'h2') {
            document.execCommand('formatBlock', false, 'h3');
          } else if (tagName === 'h3') {
            document.execCommand('formatBlock', false, 'p');
          } else {
            document.execCommand('formatBlock', false, 'h1');
          }
        } else {
          document.execCommand('formatBlock', false, 'h1');
        }
      }
      break;

    case 'quote':
      document.execCommand('formatBlock', false, 'blockquote');
      break;

    case 'code':
      // Wrap selection in code tag
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const selectedText = sel.toString();
        if (selectedText) {
          document.execCommand('insertHTML', false, `<code>${escapeHtml(selectedText)}</code>`);
        } else {
          document.execCommand('insertHTML', false, '<code>&nbsp;</code>');
        }
      }
      break;

    case 'table':
      // Insert a 3x3 table
      const tableHtml = `
        <table class="note-table">
          <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </table><br>`;
      document.execCommand('insertHTML', false, tableHtml);
      break;

    default:
      return;
  }

  debouncedSave();
  updateCharCount();
}

// ===== Paste Handler =====
function handlePaste(e) {
  e.preventDefault();

  // Get plain text from clipboard
  const text = e.clipboardData.getData('text/plain');

  // Check if the text is a URL and convert to clickable link
  const processedText = convertUrlsToLinks(text);

  if (processedText !== text) {
    // Insert as HTML if we have links
    document.execCommand('insertHTML', false, processedText);
  } else {
    // Insert as plain text, preserving line breaks
    document.execCommand('insertText', false, text);
  }

  debouncedSave();
  updateCharCount();
}

// ===== URL Detection and Conversion =====
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getShortenedUrl(url) {
  try {
    const urlObj = new URL(url);
    let display = urlObj.hostname.replace(/^www\./, '');

    // Add path if it's short enough
    if (urlObj.pathname && urlObj.pathname !== '/') {
      const path = urlObj.pathname;
      if (path.length <= 20) {
        display += path;
      } else {
        display += path.substring(0, 17) + '...';
      }
    }

    // Truncate if still too long
    if (display.length > 35) {
      display = display.substring(0, 32) + '...';
    }

    return display;
  } catch {
    return url.length > 35 ? url.substring(0, 32) + '...' : url;
  }
}

function convertUrlsToLinks(text) {
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;

  return text.replace(urlPattern, (url) => {
    const shortUrl = getShortenedUrl(url);
    return `<a href="${escapeHtml(url)}" class="note-link" title="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(shortUrl)}</a>`;
  });
}

// ===== Table Context Menu =====
let currentTableCell = null;

function showTableContextMenu(e, cell) {
  e.preventDefault();
  currentTableCell = cell;

  const menu = elements.tableContextMenu;
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.classList.add('visible');

  // Adjust position if menu goes off screen
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = `${window.innerWidth - rect.width - 10}px`;
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${window.innerHeight - rect.height - 10}px`;
  }
}

function hideTableContextMenu() {
  elements.tableContextMenu.classList.remove('visible');
  currentTableCell = null;
}

function handleTableAction(action) {
  if (!currentTableCell) return;

  const table = currentTableCell.closest('table');
  const row = currentTableCell.closest('tr');
  if (!table || !row) return;

  const rowIndex = Array.from(table.rows).indexOf(row);
  const cellIndex = Array.from(row.cells).indexOf(currentTableCell);
  const colCount = row.cells.length;

  switch (action) {
    case 'addRowAbove': {
      const newRow = table.insertRow(rowIndex);
      for (let i = 0; i < colCount; i++) {
        const cell = newRow.insertCell(i);
        cell.innerHTML = '&nbsp;';
      }
      break;
    }
    case 'addRowBelow': {
      const newRow = table.insertRow(rowIndex + 1);
      for (let i = 0; i < colCount; i++) {
        const cell = newRow.insertCell(i);
        cell.innerHTML = '&nbsp;';
      }
      break;
    }
    case 'addColLeft': {
      for (const tableRow of table.rows) {
        const cell = tableRow.insertCell(cellIndex);
        cell.innerHTML = '&nbsp;';
      }
      break;
    }
    case 'addColRight': {
      for (const tableRow of table.rows) {
        const cell = tableRow.insertCell(cellIndex + 1);
        cell.innerHTML = '&nbsp;';
      }
      break;
    }
    case 'deleteRow': {
      if (table.rows.length > 1) {
        table.deleteRow(rowIndex);
      } else {
        // If only one row, delete the whole table
        table.remove();
      }
      break;
    }
    case 'deleteCol': {
      if (colCount > 1) {
        for (const tableRow of table.rows) {
          tableRow.deleteCell(cellIndex);
        }
      } else {
        // If only one column, delete the whole table
        table.remove();
      }
      break;
    }
    case 'deleteTable': {
      table.remove();
      break;
    }
  }

  hideTableContextMenu();
  debouncedSave();
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Paste event - convert to plain text
  elements.editor.addEventListener('paste', handlePaste);

  // Editor events
  elements.editor.addEventListener('input', () => {
    debouncedSave();
    updateCharCount();
  });

  // Handle Enter key to wrap first line as title
  elements.editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const firstChild = elements.editor.firstChild;
      // If typing in a plain text node as first child, wrap it as title
      if (firstChild && firstChild.nodeType === Node.TEXT_NODE && firstChild.textContent.trim()) {
        e.preventDefault();

        const titleDiv = document.createElement('div');
        titleDiv.className = 'first-line-title';
        titleDiv.textContent = firstChild.textContent;

        elements.editor.removeChild(firstChild);
        elements.editor.insertBefore(titleDiv, elements.editor.firstChild);

        // Add a new line after the title and place cursor there
        const newLine = document.createElement('div');
        newLine.innerHTML = '<br>';
        titleDiv.after(newLine);

        // Place cursor in the new line
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(newLine, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        debouncedSave();
      }
    }
  });

  // Handle link clicks in editor
  elements.editor.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      // Open in system default browser
      window.feather.openExternal(link.href);
    }
  });

  // Handle right-click on table cells
  elements.editor.addEventListener('contextmenu', (e) => {
    const cell = e.target.closest('td');
    if (cell && cell.closest('table')) {
      showTableContextMenu(e, cell);
    }
  });

  // Table context menu actions
  elements.tableContextMenu.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      handleTableAction(item.dataset.action);
    });
  });

  // Close table context menu on outside click
  document.addEventListener('click', (e) => {
    if (!elements.tableContextMenu.contains(e.target)) {
      hideTableContextMenu();
    }
  });

  // New note button
  elements.newNoteBtn.addEventListener('click', createNote);

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderNotesList();
  });

  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Download button
  elements.downloadBtn.addEventListener('click', downloadNote);

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

// ===== Toast Notification =====
let toastTimeout = null;

function showToast(message) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  elements.toastMessage.textContent = message;
  elements.toast.classList.add('visible');

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('visible');
  }, 3000);
}

// ===== Download Note =====
async function downloadNote() {
  if (!currentNoteId) return;

  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;

  // Get plain text content (strip HTML)
  const textContent = elements.editor.innerText;

  // Generate filename from note title
  const title = getNoteTitle(note);
  const filename = title || 'Untitled';

  try {
    const result = await window.feather.downloadNote(filename, textContent);
    if (result.success) {
      showToast(`Saved to Desktop/Notes/${filename}.txt`);
    }
  } catch (err) {
    console.error('Failed to download note:', err);
    showToast('Failed to save note');
  }
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

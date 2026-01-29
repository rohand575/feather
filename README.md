# Feather

A lightweight, beautiful notepad for calm focus. A thinking space, not just a text editor.

![Feather Screenshot](docs/screenshot.png)

## Features

### Core Philosophy
- **Never lose a thought** - Auto-saves on every keystroke with 300ms debounce
- **Instant access** - Press `Ctrl+Alt+N` anywhere to summon Feather
- **Distraction-free** - Minimalist design with no clutter

### Daily Scratchpad
Each day automatically creates a "Today" note. Opening the app always focuses this note by default.

### Focus Mode
Press `Ctrl+Alt+F` to enter full-screen focus mode. Hides all UI chrome and lets you write in peace.

### Time Whisper
Each note shows subtle, human-readable timestamps like "Edited 3 minutes ago" or "Yesterday at 2:14 AM".

### Fade Old Thoughts
Notes not touched in 7+ days appear slightly faded in the sidebar, gently reminding you of forgotten ideas.

### Tiny Ritual Prompts
New notes start with one gentle line chosen randomly:
- "What's on your mind?"
- "What are you avoiding?"
- "What would future-you thank you for?"

The prompt disappears once you start typing.

### Emoji Shortcut
Press `Ctrl+.` while typing to open an inline emoji picker. Navigate with arrow keys, press Enter to insert.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+N` | Open Feather (global, works even when app is closed) |
| `Ctrl+N` | Create new note |
| `Ctrl+W` | Delete current note (with confirmation) |
| `Ctrl+Alt+F` | Toggle Focus Mode |
| `Ctrl+.` | Open emoji picker |
| `Esc` | Exit Focus Mode / Close modals |

## Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn

### Development Setup

```bash
# Clone or navigate to the project
cd feather

# Install dependencies
npm install

# Start the app in development mode
npm start
```

### Building for Windows

1. **Generate icons first** (one-time setup):
   - Open `scripts/create-icon.html` in a browser
   - Download all PNG sizes
   - Convert to ICO using [convertico.com](https://convertico.com)
   - Save as `build/icon.ico`

2. **Build the installer**:
   ```bash
   npm run build:win
   ```

3. The installer will be in the `dist/` folder

### Quick Development (No Icons)

The app works without icons - it will use a fallback. Just run:
```bash
npm install
npm start
```

## Project Structure

```
feather/
├── src/
│   ├── main/
│   │   ├── main.js        # Electron main process
│   │   ├── preload.js     # IPC bridge
│   │   └── database.js    # SQLite persistence
│   ├── renderer/
│   │   ├── index.html     # Main window
│   │   ├── renderer.js    # UI logic
│   │   └── styles/
│   │       └── main.css   # All styles
│   └── assets/
│       └── icon.svg       # Source icon
├── scripts/
│   └── create-icon.html   # Icon generator
├── build/                 # Build resources (icons)
├── dist/                  # Build output
├── package.json
├── electron-builder.yml
└── README.md
```

## Data Storage

Notes are stored in a SQLite database at:
- **Windows**: `%APPDATA%/feather/feather.db`
- **macOS**: `~/Library/Application Support/feather/feather.db`
- **Linux**: `~/.config/feather/feather.db`

The database uses WAL mode for better write performance and crash recovery.

### Note Schema

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_daily INTEGER DEFAULT 0,
  daily_date TEXT
);
```

## Technical Details

- **Framework**: Electron 28
- **Database**: better-sqlite3 (native SQLite bindings)
- **Auto-save**: 300ms debounced writes
- **Global shortcuts**: Registered via Electron globalShortcut API
- **Single instance**: Only one Feather window can run at a time

## Design Principles

1. **Speed** - Opens in under 200ms
2. **Simplicity** - No heavy toolbars or options
3. **Safety** - Data is never lost
4. **Serenity** - Calm colors, gentle animations

## Troubleshooting

### Global shortcut not working
- Another app might be using `Ctrl+Alt+N`
- Try running as administrator
- Check if Feather is running in the system tray

### Database errors
- Delete `%APPDATA%/feather/feather.db` to reset
- Your notes will be lost, so back up first if needed

### App won't start
- Check if another instance is running (look in system tray)
- Delete the app data folder and restart

## License

MIT

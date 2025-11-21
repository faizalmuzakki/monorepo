# Markdown Notepad

A clean, minimalist notepad application with full **GitHub Flavored Markdown** support. Inspired by notepad.pw but with powerful markdown editing capabilities.

## Features

### Core Functionality
- **GitHub Flavored Markdown** - Full GFM support including tables, task lists, strikethrough, and more
- **Live Preview** - See your markdown rendered in real-time as you type
- **Auto-Save** - Automatic saving to browser's localStorage with 500ms debounce
- **URL-Based Notes** - Each note has its own URL (e.g., `#my-shopping-list`)
- **Multiple View Modes** - Switch between split view, edit-only, and preview-only modes

### Markdown Support
All standard markdown features plus GitHub extensions:
- Headers (H1-H6)
- **Bold**, *italic*, ~~strikethrough~~ text
- Ordered and unordered lists
- Nested lists
- Task lists with checkboxes
- Code blocks with syntax highlighting
- Inline `code`
- Tables
- Blockquotes
- Links and images
- Horizontal rules
- And more!

### User Interface
- **Clean, Minimal Design** - Distraction-free writing experience
- **Split View** - Editor on the left, preview on the right
- **Character & Word Count** - Track your writing progress
- **Responsive Design** - Works on desktop and mobile devices
- **Dark Mode Ready** - Uses system color variables (easy to extend)

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Manual save (already auto-saves)
- `Ctrl/Cmd + E` - Switch to edit mode
- `Ctrl/Cmd + P` - Switch to preview mode
- `Ctrl/Cmd + Shift + V` - Toggle view modes

### Additional Features
- **Copy Markdown** - Copy the raw markdown to clipboard
- **Copy HTML** - Copy the rendered HTML to clipboard
- **Create New Notes** - Quick note creation with custom names
- **Safe Storage** - XSS protection with DOMPurify
- **Export API** - Console API for advanced users

## Quick Start

1. Open `index.html` in your web browser
2. Start typing your markdown
3. See the live preview on the right
4. Your note auto-saves to localStorage

## Usage

### Creating Notes

**Method 1: URL Hash**
Simply change the URL hash to create or access a note:
```
index.html#my-shopping-list
index.html#meeting-notes
index.html#todo-list
```

**Method 2: New Note Button**
Click the "➕ New Note" button and enter a name.

### Switching View Modes

Click the view mode button (or use `Ctrl/Cmd + Shift + V`) to cycle through:
1. **Split View** - Editor and preview side-by-side
2. **Edit Only** - Full-width editor
3. **Preview Only** - Full-width preview

### Copying Content

- **Copy MD** - Copies the raw markdown text
- **Copy HTML** - Copies the rendered HTML output

Perfect for pasting into emails, documents, or other applications.

## Technical Details

### Stack
- **Pure Vanilla JavaScript** - No frameworks, no build process
- **marked.js** - Markdown parsing with GFM support
- **DOMPurify** - XSS protection for rendered HTML
- **localStorage** - Client-side data persistence

### File Structure
```
notepad-app/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling
├── app.js          # Application logic
└── README.md       # Documentation
```

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6+ support

### Data Storage
All notes are stored in localStorage with the prefix `markdown_notepad_`. Each note is identified by its name (from the URL hash).

Example storage keys:
- `markdown_notepad_default` - Default note
- `markdown_notepad_my-note` - Custom note named "my-note"

### Console API

Advanced users can access the notepad programmatically via the browser console:

```javascript
// Get current note name
MarkdownNotepad.getCurrentNote()

// Get current content
MarkdownNotepad.getContent()

// Set content programmatically
MarkdownNotepad.setContent('# Hello World')

// List all saved notes
MarkdownNotepad.listNotes()

// Save current note
MarkdownNotepad.saveNote()

// Load a specific note
MarkdownNotepad.loadNote('my-note')
```

## Deployment

### Local Usage
Just open `index.html` in your browser. No server required!

### Web Server
Upload all files to any web server. Works with:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

### Example URLs
```
https://yourdomain.com/notepad/#work-notes
https://yourdomain.com/notepad/#recipes
https://yourdomain.com/notepad/#project-ideas
```

## Privacy & Security

- **All data stays local** - Notes are stored in your browser's localStorage
- **No server communication** - No data is sent to any server
- **XSS Protection** - All HTML is sanitized with DOMPurify
- **No tracking** - No analytics, no cookies, no tracking

## Limitations

- **Storage Limit** - localStorage typically has a 5-10MB limit per domain
- **No Sync** - Notes are stored locally and don't sync across devices
- **Browser-Specific** - Notes are tied to the browser they were created in

## Future Enhancements

Potential features for future versions:
- Export to .md files
- Import from .md files
- Cloud sync option
- Custom themes
- Syntax highlighting for code blocks
- Full-text search across all notes
- Note organization (folders, tags)
- Encryption option for private notes

## Markdown Cheat Sheet

```markdown
# Heading 1
## Heading 2
### Heading 3

**bold** *italic* ~~strikethrough~~

- Bullet list
- Another item
  - Nested item

1. Numbered list
2. Another item

- [ ] Task list
- [x] Completed task

`inline code`

\`\`\`javascript
// Code block
function hello() {
    console.log('Hello!');
}
\`\`\`

| Table | Header |
|-------|--------|
| Cell  | Cell   |

[Link text](https://example.com)

> Blockquote

---

Horizontal rule
```

## Credits

- **marked.js** - Markdown parser (https://marked.js.org/)
- **DOMPurify** - HTML sanitizer (https://github.com/cure53/DOMPurify)
- Inspired by **notepad.pw** - Simple notepad concept

## License

Feel free to use, modify, and distribute this project as you wish.

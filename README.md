# Personal Projects Monorepo

A unified repository containing all my personal projects. No more juggling multiple repositories – everything I build lives here.

## Why a Monorepo?

- **Simplified Management**: One repository to clone, one place to search
- **Easier Maintenance**: Single git history, unified versioning
- **Reduced Overhead**: No more context-switching between repos
- **Better Organization**: All projects under one roof

## Projects

### 📝 [Markdown Notepad](./notepad-app)

A clean, minimalist notepad application with full GitHub Flavored Markdown support. Inspired by notepad.pw but with powerful markdown editing capabilities.

**Features:**
- GitHub Flavored Markdown with live preview
- Auto-save to localStorage
- URL-based notes (e.g., `#my-note`)
- Multiple view modes (split, edit, preview)
- Copy markdown or HTML to clipboard
- Keyboard shortcuts for quick navigation

**Tech Stack:** Vanilla JavaScript, marked.js, DOMPurify

[→ View project README](./notepad-app/README.md)

---

### 🌐 [Chrome Extension - Website Blocker](./chrome-extension)

A Chrome extension to block distracting websites and stay focused.

**Features:**
- Block websites with a simple interface
- Two modes: Close tab or show warning
- Smart URL matching for domains and subdomains
- Persistent storage across Chrome browsers

**Tech Stack:** Vanilla JavaScript, Chrome Extension API

[→ View project README](./chrome-extension/README.md)

---

## Repository Structure

```
monorepo/
├── notepad-app/               # Markdown notepad web application
├── chrome-extension/          # Website blocker Chrome extension
├── [future-project-1]/        # Your next project
├── [future-project-2]/        # Another project
└── README.md                  # This file
```

## Getting Started

Each project lives in its own directory with its own README, dependencies, and setup instructions. Navigate to the project folder you're interested in to get started.

### Quick Navigation

- **Markdown Notepad**: `cd notepad-app`
- **Chrome Extension**: `cd chrome-extension`

## Adding New Projects

When adding a new project to this monorepo:

1. Create a new directory at the root level
2. Include a dedicated README.md in the project folder
3. Update this main README with a link to the new project
4. Keep dependencies isolated to each project directory

## Development Philosophy

This monorepo houses personal projects and experiments. Each project is:

- **Self-contained**: Independent dependencies and setup
- **Well-documented**: Each has its own README
- **Production-ready or experimental**: Mix of polished tools and learning projects

## Contributing

These are personal projects, but if you find something useful and want to suggest improvements, feel free to open an issue or submit a pull request!

## License

Each project may have its own license. Check individual project folders for details.

---

**Last Updated:** November 2025

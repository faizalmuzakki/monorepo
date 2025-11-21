// Markdown Notepad Application
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        AUTO_SAVE_DELAY: 500, // ms
        DEFAULT_NOTE_NAME: 'default',
        STORAGE_PREFIX: 'markdown_notepad_',
        VIEW_MODES: ['split', 'edit', 'preview']
    };

    // State
    let currentNoteName = CONFIG.DEFAULT_NOTE_NAME;
    let autoSaveTimer = null;
    let currentViewMode = 0; // 0: split, 1: edit, 2: preview

    // DOM Elements
    const elements = {
        editor: document.getElementById('editor'),
        preview: document.getElementById('preview'),
        noteName: document.getElementById('noteName'),
        saveStatus: document.getElementById('saveStatus'),
        charCount: document.getElementById('charCount'),
        toggleView: document.getElementById('toggleView'),
        viewIcon: document.getElementById('viewIcon'),
        copyMarkdown: document.getElementById('copyMarkdown'),
        copyHTML: document.getElementById('copyHTML'),
        newNote: document.getElementById('newNote'),
        mainContent: document.getElementById('mainContent')
    };

    // Configure marked.js for GitHub Flavored Markdown
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        tables: true,
        smartLists: true,
        smartypants: false
    });

    // Initialize the application
    function init() {
        setupEventListeners();
        loadFromURL();
        updatePreview();
        updateCharCount();

        // Listen for URL hash changes
        window.addEventListener('hashchange', loadFromURL);
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Editor events
        elements.editor.addEventListener('input', handleEditorInput);

        // Button events
        elements.toggleView.addEventListener('click', toggleViewMode);
        elements.copyMarkdown.addEventListener('click', copyMarkdownToClipboard);
        elements.copyHTML.addEventListener('click', copyHTMLToClipboard);
        elements.newNote.addEventListener('click', createNewNote);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    // Handle editor input with auto-save
    function handleEditorInput() {
        updatePreview();
        updateCharCount();
        showSaveStatus('saving');

        // Debounce auto-save
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        autoSaveTimer = setTimeout(() => {
            saveNote();
            showSaveStatus('saved');
        }, CONFIG.AUTO_SAVE_DELAY);
    }

    // Update markdown preview
    function updatePreview() {
        const markdownText = elements.editor.value;

        // Parse markdown and sanitize HTML
        const rawHTML = marked.parse(markdownText);
        const cleanHTML = DOMPurify.sanitize(rawHTML);

        elements.preview.innerHTML = cleanHTML;
    }

    // Update character count
    function updateCharCount() {
        const text = elements.editor.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

        elements.charCount.textContent = `${charCount} chars, ${wordCount} words`;
    }

    // Show save status
    function showSaveStatus(status) {
        if (status === 'saving') {
            elements.saveStatus.textContent = 'Saving...';
            elements.saveStatus.classList.add('saving');
        } else {
            elements.saveStatus.textContent = 'Saved ✓';
            elements.saveStatus.classList.remove('saving');
        }
    }

    // Save note to localStorage
    function saveNote() {
        const content = elements.editor.value;
        const storageKey = CONFIG.STORAGE_PREFIX + currentNoteName;

        try {
            localStorage.setItem(storageKey, content);
            console.log(`Saved note: ${currentNoteName}`);
        } catch (e) {
            console.error('Failed to save note:', e);
            elements.saveStatus.textContent = 'Error saving!';
            elements.saveStatus.style.color = 'red';
        }
    }

    // Load note from localStorage
    function loadNote(noteName) {
        const storageKey = CONFIG.STORAGE_PREFIX + noteName;
        const content = localStorage.getItem(storageKey);

        if (content !== null) {
            elements.editor.value = content;
            console.log(`Loaded note: ${noteName}`);
        } else {
            // If note doesn't exist and it's not the default, create empty note
            if (noteName !== CONFIG.DEFAULT_NOTE_NAME) {
                elements.editor.value = '';
            }
            // Otherwise keep the placeholder text
        }

        updatePreview();
        updateCharCount();
    }

    // Load note from URL hash
    function loadFromURL() {
        // Save current note before switching
        if (currentNoteName) {
            saveNote();
        }

        // Get note name from URL hash
        const hash = window.location.hash.slice(1); // Remove the # symbol
        const noteName = hash || CONFIG.DEFAULT_NOTE_NAME;

        // Sanitize note name (only allow alphanumeric, hyphens, and underscores)
        const sanitizedNoteName = noteName.replace(/[^a-zA-Z0-9\-_]/g, '-');

        currentNoteName = sanitizedNoteName;
        elements.noteName.textContent = sanitizedNoteName;

        // Update URL if sanitization changed it
        if (sanitizedNoteName !== noteName && sanitizedNoteName !== CONFIG.DEFAULT_NOTE_NAME) {
            window.location.hash = sanitizedNoteName;
            return; // Will trigger hashchange event
        }

        loadNote(currentNoteName);
    }

    // Toggle view mode (split, edit only, preview only)
    function toggleViewMode() {
        currentViewMode = (currentViewMode + 1) % CONFIG.VIEW_MODES.length;
        const mode = CONFIG.VIEW_MODES[currentViewMode];

        // Remove all mode classes
        elements.mainContent.classList.remove('split', 'edit-only', 'preview-only');

        // Add current mode class
        if (mode !== 'split') {
            elements.mainContent.classList.add(`${mode}-only`);
        }

        // Update button text and icon
        const icons = ['⚡', '✏️', '👁️'];
        const labels = ['Split View', 'Edit Only', 'Preview Only'];

        elements.viewIcon.textContent = icons[currentViewMode];
        elements.toggleView.innerHTML = `<span id="viewIcon">${icons[currentViewMode]}</span> ${labels[currentViewMode]}`;

        console.log(`View mode: ${mode}`);
    }

    // Copy markdown to clipboard
    async function copyMarkdownToClipboard() {
        const markdown = elements.editor.value;

        try {
            await navigator.clipboard.writeText(markdown);
            showTemporaryMessage(elements.copyMarkdown, '✓ Copied!');
        } catch (e) {
            console.error('Failed to copy markdown:', e);
            showTemporaryMessage(elements.copyMarkdown, '✗ Failed');
        }
    }

    // Copy HTML to clipboard
    async function copyHTMLToClipboard() {
        const markdown = elements.editor.value;
        const rawHTML = marked.parse(markdown);
        const cleanHTML = DOMPurify.sanitize(rawHTML);

        try {
            await navigator.clipboard.writeText(cleanHTML);
            showTemporaryMessage(elements.copyHTML, '✓ Copied!');
        } catch (e) {
            console.error('Failed to copy HTML:', e);
            showTemporaryMessage(elements.copyHTML, '✗ Failed');
        }
    }

    // Show temporary message on button
    function showTemporaryMessage(button, message) {
        const originalText = button.textContent;
        button.textContent = message;

        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }

    // Create new note
    function createNewNote() {
        const noteName = prompt('Enter a name for your new note:', '');

        if (noteName && noteName.trim()) {
            const sanitizedName = noteName.trim().replace(/[^a-zA-Z0-9\-_]/g, '-');
            window.location.hash = sanitizedName;
        }
    }

    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S: Save (already auto-saves, just show confirmation)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNote();
            showSaveStatus('saved');
        }

        // Ctrl/Cmd + E: Toggle to edit mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            currentViewMode = 0; // Reset to allow toggling
            toggleViewMode(); // Will set to edit mode
        }

        // Ctrl/Cmd + P: Toggle to preview mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            currentViewMode = 1; // Set to preview - 1 so next toggle goes to preview
            toggleViewMode(); // Will set to preview mode
        }

        // Ctrl/Cmd + Shift + V: Toggle view mode
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            toggleViewMode();
        }
    }

    // Save before unload
    window.addEventListener('beforeunload', () => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        saveNote();
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export API for debugging (optional)
    window.MarkdownNotepad = {
        getCurrentNote: () => currentNoteName,
        getContent: () => elements.editor.value,
        setContent: (content) => {
            elements.editor.value = content;
            updatePreview();
            updateCharCount();
        },
        saveNote,
        loadNote,
        listNotes: () => {
            const notes = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(CONFIG.STORAGE_PREFIX)) {
                    notes.push(key.replace(CONFIG.STORAGE_PREFIX, ''));
                }
            }
            return notes;
        }
    };
})();

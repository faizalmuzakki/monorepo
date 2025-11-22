// Markdown Notepad Application - Cloud Version
// Uses Cloudflare D1 for storage via API
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        AUTO_SAVE_DELAY: 1000, // ms (increased for cloud saves)
        API_BASE_URL: '/api',
        VIEW_MODES: ['split', 'edit', 'preview']
    };

    // State
    let currentNoteId = null;
    let autoSaveTimer = null;
    let currentViewMode = 0; // 0: split, 1: edit, 2: preview
    let isLoading = false;
    let isSaving = false;

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
        showSaveStatus('pending');

        // Debounce auto-save
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        autoSaveTimer = setTimeout(() => {
            saveNote();
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
        elements.saveStatus.classList.remove('saving', 'error');

        switch (status) {
            case 'loading':
                elements.saveStatus.textContent = 'Loading...';
                elements.saveStatus.classList.add('saving');
                break;
            case 'pending':
                elements.saveStatus.textContent = 'Unsaved';
                elements.saveStatus.classList.add('saving');
                break;
            case 'saving':
                elements.saveStatus.textContent = 'Saving...';
                elements.saveStatus.classList.add('saving');
                break;
            case 'saved':
                elements.saveStatus.textContent = 'Saved ✓';
                break;
            case 'error':
                elements.saveStatus.textContent = 'Error!';
                elements.saveStatus.classList.add('error');
                break;
        }
    }

    // Save note to cloud (API)
    async function saveNote() {
        if (isSaving || !currentNoteId) {
            return;
        }

        isSaving = true;
        showSaveStatus('saving');

        try {
            const content = elements.editor.value;

            const response = await fetch(`${CONFIG.API_BASE_URL}/notes/${currentNoteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`Saved note: ${currentNoteId}`, result);
            showSaveStatus('saved');

        } catch (error) {
            console.error('Error saving note:', error);
            showSaveStatus('error');
        } finally {
            isSaving = false;
        }
    }

    // Load note from cloud (API)
    async function loadNote(noteId) {
        if (isLoading || !noteId) {
            return;
        }

        isLoading = true;
        showSaveStatus('loading');

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/notes/${noteId}`);

            if (!response.ok) {
                throw new Error(`Failed to load: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Loaded note: ${noteId}`, data);

            // Set editor content
            if (data.exists && data.content) {
                elements.editor.value = data.content;
            } else {
                // New note - start with empty or placeholder
                elements.editor.value = '';
            }

            updatePreview();
            updateCharCount();
            showSaveStatus(data.exists ? 'saved' : 'pending');

        } catch (error) {
            console.error('Error loading note:', error);
            showSaveStatus('error');
            // Show error but allow user to type
            elements.editor.value = '';
            updatePreview();
            updateCharCount();
        } finally {
            isLoading = false;
        }
    }

    // Load note from URL hash
    async function loadFromURL() {
        // Save current note before switching
        if (currentNoteId && autoSaveTimer) {
            clearTimeout(autoSaveTimer);
            await saveNote();
        }

        // Get note ID from URL hash
        const hash = window.location.hash.slice(1); // Remove the # symbol

        if (!hash) {
            // No hash - this shouldn't happen as root redirects
            // But handle it gracefully
            console.log('No hash in URL, waiting for redirect...');
            return;
        }

        // Sanitize note ID (only allow alphanumeric and hyphens)
        const sanitizedId = hash.replace(/[^a-zA-Z0-9\-]/g, '');

        // Update URL if sanitization changed it
        if (sanitizedId !== hash) {
            window.location.hash = sanitizedId;
            return; // Will trigger hashchange event
        }

        currentNoteId = sanitizedId;
        elements.noteName.textContent = sanitizedId;

        // Load the note
        await loadNote(currentNoteId);
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
        // Generate random ID (client-side)
        const randomId = generateRandomId(8);
        window.location.hash = randomId;
    }

    // Generate random ID
    function generateRandomId(length) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const values = new Uint8Array(length);
        crypto.getRandomValues(values);

        for (let i = 0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }

        return result;
    }

    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S: Save immediately
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
            saveNote();
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
    window.addEventListener('beforeunload', (e) => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
            // Note: We can't await here, but we try to save
            saveNote();
        }
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export API for debugging (optional)
    window.MarkdownNotepad = {
        getCurrentNote: () => currentNoteId,
        getContent: () => elements.editor.value,
        setContent: (content) => {
            elements.editor.value = content;
            updatePreview();
            updateCharCount();
        },
        saveNote,
        loadNote: (id) => {
            window.location.hash = id;
        }
    };
})();

-- Cloudflare D1 Database Schema for Markdown Notepad

-- Notes table to store all notepad content
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,              -- URL identifier (e.g., "abc123")
    content TEXT NOT NULL DEFAULT '', -- Markdown content
    created_at INTEGER NOT NULL,      -- Unix timestamp
    updated_at INTEGER NOT NULL       -- Unix timestamp
);

-- Index for faster lookups (though PRIMARY KEY already creates one)
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);

-- Optional: Table for analytics/stats (future enhancement)
CREATE TABLE IF NOT EXISTS note_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id TEXT NOT NULL,
    action TEXT NOT NULL,             -- 'view', 'save', etc.
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id)
);

CREATE INDEX IF NOT EXISTS idx_stats_note_id ON note_stats(note_id);
CREATE INDEX IF NOT EXISTS idx_stats_timestamp ON note_stats(timestamp);

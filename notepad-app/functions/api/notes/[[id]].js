/**
 * Cloudflare Pages Function: Notes API
 * Handles GET and POST requests for note operations
 *
 * Routes:
 * - GET /api/notes/:id - Retrieve a note
 * - POST /api/notes/:id - Save/update a note
 */

// CORS headers for API responses
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

// GET /api/notes/:id - Retrieve a note
export async function onRequestGet(context) {
    try {
        const { params, env } = context;
        const noteId = params.id;

        if (!noteId || noteId.length === 0) {
            return jsonResponse({ error: 'Note ID is required' }, 400);
        }

        // Sanitize note ID (only allow alphanumeric and hyphens)
        const sanitizedId = sanitizeNoteId(noteId);
        if (sanitizedId !== noteId) {
            return jsonResponse({ error: 'Invalid note ID format' }, 400);
        }

        // Query the database
        const result = await env.DB.prepare(
            'SELECT id, content, created_at, updated_at FROM notes WHERE id = ?'
        ).bind(sanitizedId).first();

        if (!result) {
            // Note doesn't exist yet - return empty content
            return jsonResponse({
                id: sanitizedId,
                content: '',
                created_at: null,
                updated_at: null,
                exists: false
            });
        }

        return jsonResponse({
            id: result.id,
            content: result.content,
            created_at: result.created_at,
            updated_at: result.updated_at,
            exists: true
        });

    } catch (error) {
        console.error('Error retrieving note:', error);
        return jsonResponse({ error: 'Failed to retrieve note' }, 500);
    }
}

// POST /api/notes/:id - Save/update a note
export async function onRequestPost(context) {
    try {
        const { request, params, env } = context;
        const noteId = params.id;

        if (!noteId || noteId.length === 0) {
            return jsonResponse({ error: 'Note ID is required' }, 400);
        }

        // Sanitize note ID
        const sanitizedId = sanitizeNoteId(noteId);
        if (sanitizedId !== noteId) {
            return jsonResponse({ error: 'Invalid note ID format' }, 400);
        }

        // Parse request body
        const body = await request.json();
        const { content } = body;

        if (typeof content !== 'string') {
            return jsonResponse({ error: 'Content must be a string' }, 400);
        }

        // Limit content size (e.g., 1MB)
        const MAX_CONTENT_SIZE = 1024 * 1024; // 1MB
        if (content.length > MAX_CONTENT_SIZE) {
            return jsonResponse({ error: 'Content too large (max 1MB)' }, 413);
        }

        const timestamp = Date.now();

        // Check if note exists
        const existingNote = await env.DB.prepare(
            'SELECT id FROM notes WHERE id = ?'
        ).bind(sanitizedId).first();

        let result;
        if (existingNote) {
            // Update existing note
            result = await env.DB.prepare(
                'UPDATE notes SET content = ?, updated_at = ? WHERE id = ?'
            ).bind(content, timestamp, sanitizedId).run();
        } else {
            // Create new note
            result = await env.DB.prepare(
                'INSERT INTO notes (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)'
            ).bind(sanitizedId, content, timestamp, timestamp).run();
        }

        if (!result.success) {
            throw new Error('Database operation failed');
        }

        return jsonResponse({
            id: sanitizedId,
            success: true,
            updated_at: timestamp,
            action: existingNote ? 'updated' : 'created'
        });

    } catch (error) {
        console.error('Error saving note:', error);
        return jsonResponse({ error: 'Failed to save note' }, 500);
    }
}

// Helper: Create JSON response with CORS headers
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
        },
    });
}

// Helper: Sanitize note ID (allow only alphanumeric and hyphens)
function sanitizeNoteId(id) {
    return id.replace(/[^a-zA-Z0-9\-]/g, '');
}

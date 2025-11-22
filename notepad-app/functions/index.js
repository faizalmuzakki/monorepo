/**
 * Cloudflare Pages Function: Root Redirect
 * Redirects root path (/) to a random note ID
 */

// Character set for random ID generation (URL-safe)
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 8; // Length of random ID (e.g., "aB3xK9mZ")

export async function onRequestGet(context) {
    const { request } = context;
    const url = new URL(request.url);

    // Only redirect if we're exactly at the root path
    if (url.pathname === '/' && !url.hash) {
        const randomId = generateRandomId(ID_LENGTH);

        // Redirect to the random note URL
        return Response.redirect(`${url.origin}/#${randomId}`, 302);
    }

    // For all other paths, let the static file handler take over
    return context.next();
}

/**
 * Generate a random URL-safe ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
function generateRandomId(length) {
    let result = '';
    const charsetLength = CHARSET.length;

    // Use crypto.getRandomValues for better randomness
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += CHARSET[randomValues[i] % charsetLength];
    }

    return result;
}

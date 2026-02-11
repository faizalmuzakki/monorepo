#!/usr/bin/env node
/**
 * Import/Export Validation Script
 * 
 * Scans all JavaScript files and validates that all named imports
 * have corresponding exports in their source modules.
 * 
 * Usage: node scripts/check-imports.js [src-directory]
 * Example: node scripts/check-imports.js ./src
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = process.argv[2] || './src';

// Get all JS files recursively
function getJsFiles(dir) {
    const files = [];
    for (const file of readdirSync(dir)) {
        const path = join(dir, file);
        if (statSync(path).isDirectory()) {
            files.push(...getJsFiles(path));
        } else if (file.endsWith('.js')) {
            files.push(path);
        }
    }
    return files;
}

// Extract exports from a file
function getExports(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const exports = new Set();

    // Named exports: export function foo(), export const foo, export { foo }
    const funcMatches = content.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g);
    for (const m of funcMatches) exports.add(m[1]);

    const constMatches = content.matchAll(/export\s+(?:const|let|var)\s+(\w+)/g);
    for (const m of constMatches) exports.add(m[1]);

    const namedMatches = content.matchAll(/export\s+\{\s*([^}]+)\s*\}/g);
    for (const m of namedMatches) {
        m[1].split(',').forEach(e => {
            const name = e.trim().split(/\s+as\s+/)[0].trim();
            if (name) exports.add(name);
        });
    }

    // Default export
    if (/export\s+default/.test(content)) {
        exports.add('default');
    }

    return exports;
}

// Extract imports from a file
function getImports(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const imports = [];

    // import { foo, bar } from './module.js'
    const matches = content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
    for (const m of matches) {
        const names = m[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
        imports.push({ names, from: m[2], file: filePath });
    }

    return imports;
}

// Resolve relative import path
function resolveImport(fromFile, importPath) {
    if (importPath.startsWith('.')) {
        return resolve(dirname(fromFile), importPath);
    }
    return null; // External module
}

// Main
console.log(`Scanning: ${resolve(srcDir)}\n`);

const jsFiles = getJsFiles(srcDir);
const exportMap = new Map();

// Build export map
for (const file of jsFiles) {
    exportMap.set(resolve(file), getExports(file));
}

// Check all imports
const errors = [];
for (const file of jsFiles) {
    const imports = getImports(file);
    for (const imp of imports) {
        const targetPath = resolveImport(file, imp.from);
        if (!targetPath) continue; // External module

        const targetExports = exportMap.get(targetPath);
        if (!targetExports) {
            errors.push(`❌ ${file}: Cannot find module '${imp.from}'`);
            continue;
        }

        for (const name of imp.names) {
            if (!targetExports.has(name)) {
                errors.push(`❌ ${file}: '${name}' not exported from '${imp.from}'`);
            }
        }
    }
}

if (errors.length === 0) {
    console.log('✅ All imports are valid!');
    console.log(`   Scanned ${jsFiles.length} files`);
    process.exit(0);
} else {
    console.log(`Found ${errors.length} import errors:\n`);
    errors.forEach(e => console.log(e));
    process.exit(1);
}

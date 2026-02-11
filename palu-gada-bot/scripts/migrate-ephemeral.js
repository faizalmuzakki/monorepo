#!/usr/bin/env node
/**
 * Migration script to update ephemeral: true to use MessageFlags
 * This fixes the Discord.js deprecation warning
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsDir = join(__dirname, '../src/commands');

let totalFixed = 0;
let filesModified = 0;

for (const file of readdirSync(commandsDir)) {
    if (!file.endsWith('.js')) continue;

    const filePath = join(commandsDir, file);
    let content = readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Check if file uses ephemeral
    if (!content.includes('ephemeral')) continue;

    // Check if MessageFlags is already imported
    const hasMessageFlags = content.includes('MessageFlags');

    // Add MessageFlags to import if needed
    if (!hasMessageFlags) {
        // Find the discord.js import line
        const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]discord\.js['"]/);
        if (importMatch) {
            const imports = importMatch[1];
            const newImports = imports.trim() + ', MessageFlags';
            content = content.replace(importMatch[0], `import { ${newImports} } from 'discord.js'`);
        }
    }

    // Replace ephemeral: true with flags: MessageFlags.Ephemeral
    const count = (content.match(/ephemeral:\s*true/g) || []).length;
    content = content.replace(/ephemeral:\s*true/g, 'flags: MessageFlags.Ephemeral');

    if (content !== originalContent) {
        writeFileSync(filePath, content);
        console.log(`✓ ${file}: Fixed ${count} occurrences`);
        totalFixed += count;
        filesModified++;
    }
}

console.log(`\n✅ Done! Fixed ${totalFixed} occurrences in ${filesModified} files.`);

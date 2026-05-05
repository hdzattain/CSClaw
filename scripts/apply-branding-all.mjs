#!/usr/bin/env node
/**
 * apply-branding-all.mjs
 *
 * Comprehensive branding replacement that covers ALL files in the project.
 * - Non-code files (md, json, yml, yaml, html): full text replacement
 * - Code files (ts, tsx, js, mjs): string-literal-only replacement
 * - Skips: node_modules, .git, dist, release, branding.config.json, apply-branding*.mjs
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const config = JSON.parse(readFileSync(join(ROOT, 'branding.config.json'), 'utf-8'));
const replaceMap = config.replaceMap;

// Sort by longest key first to avoid partial matches
const sortedEntries = Object.entries(replaceMap).sort(([a], [b]) => b.length - a.length);
// For TS files, exclude keys with spaces to avoid corrupting camelCase identifiers
const tsEntries = sortedEntries.filter(([key]) => !key.includes(' '));

// Directories and files to skip
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'release', '.qoder', 'branding']);
const SKIP_FILES = new Set(['branding.config.json', 'apply-branding.mjs', 'apply-branding-all.mjs']);

// Extensions for full-text replacement
const FULL_REPLACE_EXTS = new Set(['.md', '.json', '.yml', '.yaml', '.html']);
// Extensions for string-literal-only replacement
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs']);

let filesModified = 0;
let totalReplacements = 0;

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      files.push(fullPath);
    }
  }
  return files;
}

function fullTextReplace(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  let count = 0;

  for (const [search, replace] of sortedEntries) {
    if (content.includes(search)) {
      const c = content.split(search).length - 1;
      content = content.replaceAll(search, replace);
      modified = true;
      count += c;
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    filesModified++;
    totalReplacements += count;
    console.log(`  [FULL] ${relative(ROOT, filePath)} (${count})`);
  }
}

function stringLiteralReplace(filePath) {
  const lines = readFileSync(filePath, 'utf-8').split('\n');
  let modified = false;
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const newLine = line.replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\/\/.*$)/g,
      (match) => {
        let replaced = match;
        for (const [search, replace] of tsEntries) {
          if (replaced.includes(search)) {
            const c = replaced.split(search).length - 1;
            replaced = replaced.replaceAll(search, replace);
            count += c;
          }
        }
        return replaced;
      },
    );
    if (newLine !== line) {
      lines[i] = newLine;
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(filePath, lines.join('\n'), 'utf-8');
    filesModified++;
    totalReplacements += count;
    console.log(`  [STR]  ${relative(ROOT, filePath)} (${count})`);
  }
}

console.log('\n🎨 Comprehensive branding replacement: ClawX → CSClaw\n');

const allFiles = walkDir(ROOT);

for (const filePath of allFiles) {
  const ext = extname(filePath).toLowerCase();
  if (FULL_REPLACE_EXTS.has(ext)) {
    fullTextReplace(filePath);
  } else if (CODE_EXTS.has(ext)) {
    stringLiteralReplace(filePath);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log('\n✨ Done!\n');

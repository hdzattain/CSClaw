#!/usr/bin/env node
/**
 * apply-branding-full.mjs
 *
 * FULL text replacement across ALL source files including code identifiers.
 * This renames functions, variables, env vars, and comments.
 * Skips: node_modules, .git, dist, release, .qoder, branding/, branding.config.json, apply-branding*.mjs
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// Full replacement map including identifiers
const replaceMap = {
  // Longest first to avoid partial matches
  'repairClawXOnlyBootstrapFiles': 'repairCSClawOnlyBootstrapFiles',
  'CLAWX_E2E_SKIP_SETUP': 'CSCLAW_E2E_SKIP_SETUP',
  'CLAWX_USER_DATA_DIR': 'CSCLAW_USER_DATA_DIR',
  'ensureClawXContext': 'ensureCSClawContext',
  'app.clawx.desktop': 'app.csclaw.desktop',
  'getClawXConfigDir': 'getCSClawConfigDir',
  'CLAWX_E2E': 'CSCLAW_E2E',
  'Claw X': 'CSClaw',
  'ClawX': 'CSClaw',
  'clawx': 'csclaw',
  'CLAWX': 'CSCLAW',
};

// Sort by longest key first
const sortedEntries = Object.entries(replaceMap).sort(([a], [b]) => b.length - a.length);

// Directories to skip
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'release', '.qoder', 'branding']);
const SKIP_FILES = new Set(['branding.config.json', 'apply-branding.mjs', 'apply-branding-all.mjs', 'apply-branding-full.mjs']);

// Extensions to process
const VALID_EXTS = new Set(['.md', '.json', '.yml', '.yaml', '.html', '.ts', '.tsx', '.js', '.mjs', '.css', '.svg']);

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

console.log('\n🎨 FULL branding replacement (including identifiers)\n');

const allFiles = walkDir(ROOT);

for (const filePath of allFiles) {
  const ext = extname(filePath).toLowerCase();
  if (!VALID_EXTS.has(ext)) continue;

  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    continue;
  }

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
    console.log(`  ${relative(ROOT, filePath)} (${count})`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log('\n✨ Done!\n');

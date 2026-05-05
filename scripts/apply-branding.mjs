#!/usr/bin/env node
/**
 * apply-branding.mjs
 *
 * Reads branding.config.json and applies brand name/logo replacements
 * across the entire project. This script is idempotent — running it
 * multiple times produces the same result.
 *
 * Usage:
 *   node scripts/apply-branding.mjs          # apply branding
 *   node scripts/apply-branding.mjs --dry-run # preview changes without writing
 *   node scripts/apply-branding.mjs --revert  # revert to original "ClawX" branding
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ─── Load branding config ───────────────────────────────────────────────────

const configPath = join(ROOT, 'branding.config.json');
if (!existsSync(configPath)) {
  console.error('❌ branding.config.json not found in project root');
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const isDryRun = process.argv.includes('--dry-run');
const isRevert = process.argv.includes('--revert');

// When reverting, swap the replace map direction
const replaceMap = isRevert
  ? Object.fromEntries(Object.entries(config.replaceMap).map(([k, v]) => [v, k]))
  : config.replaceMap;

const appName = isRevert ? 'ClawX' : config.appName;
const appNameLower = isRevert ? 'clawx' : config.appNameLower;

console.log(`\n🎨 ${isRevert ? 'Reverting' : 'Applying'} branding: ${appName}`);
if (isDryRun) console.log('   (dry-run mode — no files will be modified)\n');

// ─── File targets for text replacement ──────────────────────────────────────

const TEXT_TARGETS = [
  // Core config
  'package.json',
  'electron-builder.yml',
  'index.html',
  // i18n (all languages)
  'src/i18n/locales/en/settings.json',
  'src/i18n/locales/en/setup.json',
  'src/i18n/locales/en/common.json',
  'src/i18n/locales/en/chat.json',
  'src/i18n/locales/en/agents.json',
  'src/i18n/locales/en/channels.json',
  'src/i18n/locales/en/cron.json',
  'src/i18n/locales/en/dashboard.json',
  'src/i18n/locales/en/dreams.json',
  'src/i18n/locales/en/skills.json',
  'src/i18n/locales/zh/settings.json',
  'src/i18n/locales/zh/setup.json',
  'src/i18n/locales/zh/common.json',
  'src/i18n/locales/zh/chat.json',
  'src/i18n/locales/zh/agents.json',
  'src/i18n/locales/zh/channels.json',
  'src/i18n/locales/zh/cron.json',
  'src/i18n/locales/zh/dashboard.json',
  'src/i18n/locales/zh/dreams.json',
  'src/i18n/locales/zh/skills.json',
  'src/i18n/locales/ja/settings.json',
  'src/i18n/locales/ja/setup.json',
  'src/i18n/locales/ja/common.json',
  'src/i18n/locales/ja/chat.json',
  'src/i18n/locales/ja/agents.json',
  'src/i18n/locales/ja/channels.json',
  'src/i18n/locales/ja/cron.json',
  'src/i18n/locales/ja/dashboard.json',
  'src/i18n/locales/ja/dreams.json',
  'src/i18n/locales/ja/skills.json',
  'src/i18n/locales/ru/settings.json',
  'src/i18n/locales/ru/setup.json',
  'src/i18n/locales/ru/common.json',
  'src/i18n/locales/ru/chat.json',
  'src/i18n/locales/ru/agents.json',
  'src/i18n/locales/ru/channels.json',
  'src/i18n/locales/ru/cron.json',
  'src/i18n/locales/ru/dashboard.json',
  'src/i18n/locales/ru/dreams.json',
  'src/i18n/locales/ru/skills.json',
  // Electron main process
  'electron/main/tray.ts',
  // Context files
  'resources/context/AGENTS.clawx.md',
  'resources/context/TOOLS.clawx.md',
];

// Files where only string-literal occurrences should be replaced (not identifiers)
// Uses regex to match only within quotes or after // comments
const TS_STRING_ONLY_TARGETS = [
  'electron/main/index.ts',
];

// ─── Text replacement ───────────────────────────────────────────────────────

let filesModified = 0;
let totalReplacements = 0;

for (const relPath of TEXT_TARGETS) {
  const filePath = join(ROOT, relPath);
  if (!existsSync(filePath)) {
    continue;
  }

  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  let fileReplacements = 0;

  // Apply replacements in order from longest key to shortest to avoid partial matches
  const sortedEntries = Object.entries(replaceMap).sort(([a], [b]) => b.length - a.length);

  for (const [search, replace] of sortedEntries) {
    if (content.includes(search)) {
      const count = content.split(search).length - 1;
      content = content.replaceAll(search, replace);
      modified = true;
      fileReplacements += count;
    }
  }

  if (modified) {
    filesModified++;
    totalReplacements += fileReplacements;
    if (isDryRun) {
      console.log(`  📝 Would modify: ${relPath} (${fileReplacements} replacements)`);
    } else {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ Modified: ${relPath} (${fileReplacements} replacements)`);
    }
  }
}

// ─── String-literal-only replacement for TS source files ────────────────────
// For TypeScript files with code identifiers that should NOT be renamed,
// only replace brand names inside string literals (quoted) and comments.
// Exclude "Claw X" (space-separated) to prevent corrupting camelCase identifiers.

const tsReplaceMap = Object.fromEntries(
  Object.entries(replaceMap).filter(([key]) => !key.includes(' ')),
);
const sortedEntriesForTs = Object.entries(tsReplaceMap).sort(([a], [b]) => b.length - a.length);

for (const relPath of TS_STRING_ONLY_TARGETS) {
  const filePath = join(ROOT, relPath);
  if (!existsSync(filePath)) continue;

  const lines = readFileSync(filePath, 'utf-8').split('\n');
  let modified = false;
  let fileReplacements = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only replace within string literals (single/double/backtick quotes) and // comments
    const newLine = line.replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\/\/.*$)/g,
      (match) => {
        let replaced = match;
        for (const [search, replace] of sortedEntriesForTs) {
          if (replaced.includes(search)) {
            const count = replaced.split(search).length - 1;
            replaced = replaced.replaceAll(search, replace);
            fileReplacements += count;
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
    filesModified++;
    totalReplacements += fileReplacements;
    if (isDryRun) {
      console.log(`  📝 Would modify: ${relPath} (${fileReplacements} string-literal replacements)`);
    } else {
      writeFileSync(filePath, lines.join('\n'), 'utf-8');
      console.log(`  ✅ Modified: ${relPath} (${fileReplacements} string-literal replacements)`);
    }
  }
}

// ─── Logo file copying ──────────────────────────────────────────────────────

const LOGO_COPIES = [
  { configKey: 'svg', target: 'src/assets/logo.svg' },
  { configKey: 'iconSvg', target: 'resources/icons/icon.svg' },
  { configKey: 'iconPlainSvg', target: 'resources/icons/icon-plain.svg' },
  { configKey: 'trayIconSvg', target: 'resources/icons/tray-icon-template.svg' },
];

let logosCopied = 0;

if (config.logo && !isRevert) {
  for (const { configKey, target } of LOGO_COPIES) {
    const sourcePath = config.logo[configKey];
    if (!sourcePath) continue;

    const fullSource = join(ROOT, sourcePath);
    const fullTarget = join(ROOT, target);

    if (existsSync(fullSource)) {
      if (isDryRun) {
        console.log(`  🖼️  Would copy logo: ${sourcePath} → ${target}`);
      } else {
        mkdirSync(dirname(fullTarget), { recursive: true });
        copyFileSync(fullSource, fullTarget);
        console.log(`  🖼️  Copied logo: ${sourcePath} → ${target}`);
      }
      logosCopied++;
    }
  }
}

// ─── Summary ────────────────────────────────────────────────────────────────

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total text replacements: ${totalReplacements}`);
console.log(`   Logo files copied: ${logosCopied}`);

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply changes.\n');
} else {
  console.log('\n✨ Branding applied successfully!');
  console.log('   💡 Run "pnpm run icons" to regenerate platform-specific icons from the new SVG.\n');
}

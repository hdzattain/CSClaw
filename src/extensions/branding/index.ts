/**
 * Branding Extension (Renderer)
 *
 * A configurable plugin that allows replacing all ClawX logos and brand text
 * at runtime in the renderer process. Configuration is read from branding.config.json
 * at build time and injected as a module constant.
 *
 * Usage:
 *   1. Edit branding.config.json in project root
 *   2. Place custom logo files in branding/ directory (optional)
 *   3. Run: node scripts/apply-branding.mjs
 *   4. Run: pnpm run icons (to regenerate platform icons)
 *   5. Start dev or build
 */

import type { RendererExtension } from '../types';
import { brandingConfig, type BrandingConfig } from './config';

export { brandingConfig, type BrandingConfig };

/**
 * Get the current app name from branding config
 */
export function getAppName(): string {
  return brandingConfig.appName;
}

/**
 * Get the current tagline for a given locale
 */
export function getTagline(locale: string): string {
  const taglines = brandingConfig.tagline as Record<string, string>;
  return taglines[locale] || taglines['en'] || '';
}

/**
 * Get the "based on" text for a given locale
 */
export function getBasedOn(locale: string): string {
  const basedOn = brandingConfig.basedOn as Record<string, string>;
  return basedOn[locale] || basedOn['en'] || '';
}

/**
 * Replace brand text in a given string
 */
export function replaceBrandText(text: string): string {
  if (!brandingConfig.replaceMap) return text;
  let result = text;
  // Sort by length descending to avoid partial matches
  const entries = Object.entries(brandingConfig.replaceMap).sort(
    ([a], [b]) => b.length - a.length,
  );
  for (const [search, replace] of entries) {
    if (result.includes(search)) {
      result = result.replaceAll(search, replace as string);
    }
  }
  return result;
}

/**
 * Create the branding renderer extension
 */
export function createBrandingExtension(): RendererExtension {
  return {
    id: 'builtin/branding',

    setup() {
      // Update document title with branding
      if (typeof document !== 'undefined') {
        document.title = brandingConfig.appName;
      }
    },

    teardown() {
      // No cleanup needed
    },
  };
}

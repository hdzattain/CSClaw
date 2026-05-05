/**
 * Branding Extension (Main Process)
 *
 * Provides runtime branding constants for the Electron main process.
 * Used by tray, window title, and other system-level UI elements.
 *
 * Configuration is kept in sync with branding.config.json via apply-branding.mjs.
 */

import type { Extension, ExtensionContext } from '../types';

export interface MainBrandingConfig {
  appName: string;
  appNameLower: string;
  description: string;
}

/**
 * Main-process branding configuration.
 * Keep in sync with branding.config.json by running: node scripts/apply-branding.mjs
 */
export const mainBrandingConfig: MainBrandingConfig = {
  appName: 'CSClaw',
  appNameLower: 'csclaw',
  description: 'CSClaw - Graphical AI Assistant based on OpenClaw',
};

/**
 * Get the branded app name for use in menus, tooltips, etc.
 */
export function getBrandedAppName(): string {
  return mainBrandingConfig.appName;
}

class BrandingExtension implements Extension {
  readonly id = 'builtin/branding';

  setup(_ctx: ExtensionContext): void {
    // Branding is stateless config — no setup needed.
    // The config values are consumed directly by other modules via import.
  }
}

export function createBrandingExtension(): Extension {
  return new BrandingExtension();
}

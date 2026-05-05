/**
 * Branding configuration module.
 *
 * This file exports the branding config as a typed constant.
 * The values here are the SOURCE OF TRUTH for runtime branding.
 * They match branding.config.json and are kept in sync by the
 * apply-branding.mjs script.
 *
 * To customize: edit branding.config.json then run:
 *   node scripts/apply-branding.mjs
 */

export interface BrandingConfig {
  appName: string;
  appNameLower: string;
  appId: string;
  description: string;
  author: string;
  copyright: string;
  tagline: Record<string, string>;
  basedOn: Record<string, string>;
  userAgent: string;
  website: string;
  repository: string;
  replaceMap: Record<string, string>;
}

/**
 * Runtime branding configuration.
 * These values are used throughout the renderer for dynamic branding.
 */
export const brandingConfig: BrandingConfig = {
  appName: 'CSClaw',
  appNameLower: 'csclaw',
  appId: 'app.csclaw.desktop',
  description: 'CSClaw - Graphical AI Assistant based on OpenClaw',
  author: 'CSClaw Team',
  copyright: 'Copyright \u00a9 2026 CSClaw',
  tagline: {
    en: 'Graphical AI Assistant',
    zh: '\u56fe\u5f62\u5316 AI \u52a9\u624b',
    ja: '\u30b0\u30e9\u30d5\u30a3\u30ab\u30eb AI \u30a2\u30b7\u30b9\u30bf\u30f3\u30c8',
    ru: '\u0413\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043a\u0438\u0439 AI-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043d\u0442',
  },
  basedOn: {
    en: 'Based on OpenClaw',
    zh: '\u57fa\u4e8e OpenClaw',
    ja: 'OpenClaw \u30d9\u30fc\u30b9',
    ru: '\u041d\u0430 \u0431\u0430\u0437\u0435 OpenClaw',
  },
  userAgent: 'CSClaw/1.0',
  website: 'https://csclaw.example.com',
  repository: 'https://github.com/example/CSClaw',
  replaceMap: {
    ClawX: 'CSClaw',
    clawx: 'csclaw',
    CLAWX: 'CSCLAW',
    'Claw X': 'CSClaw',
    'app.clawx.desktop': 'app.csclaw.desktop',
  },
};

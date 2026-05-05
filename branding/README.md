# Branding Assets Directory

Place your custom logo and icon files here. The `apply-branding.mjs` script
will copy them to the appropriate locations in the project.

## Expected files

| File | Description | Used for |
|------|-------------|----------|
| `logo.svg` | Main application logo (vector) | Sidebar, Setup wizard, README |
| `icon.svg` | App icon source (vector, square) | Generated into .ico/.icns/PNG |
| `icon-plain.svg` | Plain/monochrome icon variant | Alternative contexts |
| `tray-icon-template.svg` | System tray icon (monochrome) | macOS/Windows/Linux tray |

## Workflow

1. Place your SVG files in this directory
2. Run `pnpm run branding` to apply text + logo replacements
3. Run `pnpm run icons` to regenerate platform-specific icons (ico, icns, png)
4. Run `pnpm dev` to verify

## Notes

- Logo SVG should be around 550x450 viewBox (matching original)
- Icon SVG should be square (e.g., 512x512 or 1024x1024 viewBox)
- Tray icon SVG should be monochrome (single color, black) for macOS template images
- If a file is missing here, the original will be kept in place

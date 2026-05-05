import { registerBuiltinExtension } from '../loader';
import { createClawHubMarketplaceExtension } from './clawhub-marketplace';
import { createDiagnosticsExtension } from './diagnostics';
import { createBrandingExtension } from './branding';

export function registerAllBuiltinExtensions(): void {
  registerBuiltinExtension('builtin/clawhub-marketplace', createClawHubMarketplaceExtension);
  registerBuiltinExtension('builtin/diagnostics', createDiagnosticsExtension);
  registerBuiltinExtension('builtin/branding', createBrandingExtension);
}

/**
 * Legacy Package Database
 *
 * This file is kept for backward compatibility.
 * The source of truth is now:
 * - CTAN data: src/assets/CTANpackageDatabase.json
 * - Wizard config: ./wizardRegistry.ts
 * - Merged data: src/services/packageService.ts
 *
 * New code should use packageService.ts instead.
 */

import { WIZARD_REGISTRY, WizardCategory } from "./wizardRegistry";

// Re-export types for backward compatibility
export type Category = WizardCategory;

export interface LatexPackage {
  id: string;
  name: string;
  category: Category;
  description: string;
  command?: string;
  hasWizard?: boolean;
}

/**
 * @deprecated Use packageService for async data. This contains only local wizard metadata.
 * Legacy list of packages with wizard support
 */
export const PACKAGES_DB: LatexPackage[] = Object.entries(WIZARD_REGISTRY).map(
  ([id, config]) => ({
    id,
    name: config.displayName || id,
    category: config.category,
    description: "Configurable package", // Placeholder as we don't have descriptions synchronously
    command: `\\usepackage{${id}}`,
    hasWizard: true,
  })
);

import type { SourceFile } from "ts-morph";

/**
 * List of Ionic components by tag name.
 */
export const IONIC_COMPONENTS = [
  "ion-app",
  "ion-action-sheet",
  "ion-alert",
  "ion-accordion",
  "ion-accordion-group",
  "ion-avatar",
  "ion-backdrop",
  "ion-back-button",
  "ion-badge",
  "ion-breadcrumb",
  "ion-breadcrumbs",
  "ion-button",
  "ion-buttons",
  "ion-card",
  "ion-card-content",
  "ion-card-header",
  "ion-card-subtitle",
  "ion-card-title",
  "ion-checkbox",
  "ion-chip",
  "ion-col",
  "ion-content",
  "ion-datetime",
  "ion-datetime-button",
  "ion-fab",
  "ion-fab-button",
  "ion-fab-list",
  "ion-footer",
  "ion-grid",
  "ion-header",
  "ion-icon",
  "ion-img",
  "ion-infinite-scroll",
  "ion-infinite-scroll-content",
  "ion-input",
  "ion-item",
  "ion-item-divider",
  "ion-item-group",
  "ion-item-sliding",
  "ion-item-options",
  "ion-item-option",
  "ion-label",
  "ion-list",
  "ion-list-header",
  "ion-loading",
  "ion-menu",
  "ion-menu-button",
  "ion-menu-toggle",
  "ion-modal",
  "ion-nav",
  "ion-nav-link",
  "ion-note",
  "ion-picker",
  "ion-popover",
  "ion-progress-bar",
  "ion-radio",
  "ion-radio-group",
  "ion-range",
  "ion-refresher",
  "ion-refresher-content",
  "ion-reorder",
  "ion-reorder-group",
  "ion-ripple-effect",
  "ion-router",
  "ion-router-link",
  "ion-router-outlet",
  "ion-route",
  "ion-route-redirect",
  "ion-row",
  "ion-searchbar",
  "ion-segment",
  "ion-segment-button",
  "ion-select",
  "ion-select-option",
  "ion-skeleton-text",
  "ion-spinner",
  "ion-split-pane",
  "ion-tab",
  "ion-tabs",
  "ion-tab-bar",
  "ion-tab-button",
  "ion-text",
  "ion-textarea",
  "ion-thumbnail",
  "ion-toolbar",
  "ion-toast",
  "ion-toggle",
  "ion-title",
]; // TODO can we generate this from @ionic/core and import it here?

export const migrateProvideIonicAngularImportDeclarations = (
  sourceFile: SourceFile,
) => {
  const importDeclaration = sourceFile.getImportDeclaration("@ionic/angular");

  if (!importDeclaration) {
    // If the @ionic/angular import does not exist, then this is not an @ionic/angular application.
    // This migration only applies to @ionic/angular applications.
    return;
  }

  // Update the import statement to import from @ionic/angular/standalone
  importDeclaration.setModuleSpecifier("@ionic/angular/standalone");

  const namedImports = importDeclaration.getNamedImports();
  const importSpecifier = namedImports.find(
    (n) => n.getName() === "IonicModule",
  );

  if (importSpecifier) {
    // Remove the IonicModule import specifier
    importSpecifier.remove();
  }

  // Add the provideIonicAngular import specifier
  importDeclaration.addNamedImport("provideIonicAngular");
};

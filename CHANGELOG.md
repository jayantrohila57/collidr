# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Production deploy**: [docs/PRODUCTION_DEPLOY.md](./docs/PRODUCTION_DEPLOY.md) (Vercel rate-limit mitigations, flag/redeploy checklist, schema sign-off); Settings → Deploy runbook UI; Turbo `globalEnv` guard test in `@loftlancer/env`
- **Documentation**: README, AGENTS.md, platform plan (PLAN_PLATFORM_APPS §14 SSO), and doc index aligned with orgs, actions, flags, main-only deploy, and db:reset-seed policy

- **Project Management**: Complete project editing functionality
  - Added project edit dialog with form validation
  - Implemented project edit page with client-side state management
  - Added project actions component for edit/delete operations
- **Environment Management**: Enhanced environment editing capabilities
  - Added edit environment dialog with real-time validation
  - Improved environment panel UI with better layout
  - Enhanced environments tabs view with improved navigation
- **Variable Management**: Full CRUD operations for environment variables
  - Added edit variable dialog with encryption support
  - Enhanced variables table view with sorting and filtering
  - Improved variable hooks with better error handling
- **Dashboard**: Updated dashboard stats component with improved metrics

### Changed

- Refactored project components to use consistent UI patterns
- Improved error handling across all environment and variable components
- Updated API router for variables with better security and validation
- Enhanced TypeScript types for better type safety

### Fixed

- Resolved variable table CRUD functionality issues
- Fixed TypeScript build errors in environment hooks
- Improved form validation in edit dialogs

## [1.1.0] - 2025-01-19

### Added

- Environment management core infrastructure
- Projects, environments, and variables database schema
- New API routers for environment management
- Database migrations for environment management features
- Comprehensive project plan and development roadmap

### Changed

- Refactored from todo-based to environment management system
- Updated authentication flow for new use case
- Removed placeholder todo functionality
- Updated database schema to support environment variables
- Modified API structure for environment management endpoints

### Fixed

- Updated imports and dependencies after schema changes
- Fixed authentication integration with new project structure

---

## [1.4.0] - 2026-01-19

### Added

- **Environment Templates**: Reusable templates for environment variables.
  - Create and manage templates with default variables.
  - Apply templates to project environments with conflict detection (skips existing keys).
  - Bulk management UI for template variables.
- **Audit Logs Enhancement**:
  - Implemented server-side search by action and entity type.
  - Added frontend search bar and project-based filtering for audit logs.
  - Improved data security by removing `any` types in audit log tables.

### Changed

- Landing page UI with modern hero section and better messaging.
- Sign-in form styling and layout for better user experience.
- Refactored `environment-panel.tsx` to integrate with templates and audit logs.
- Centralized `trpc` utils for better type safety and TanStack Query integration.

## [1.5.0] - 2026-01-20

### Added

- **Domain-Driven Architecture**: Refactored `apps/web/src` into a domain-centric structure (`auth`, `projects`, `environments`, `templates`, `audit`).
- **Server Components Migration**: Converted all main pages (`login`, `dashboard`, `audit`, `templates`) to React Server Components (RSC).
- **Dynamic Loading**: Implemented `next/dynamic` with dedicated skeleton loading states for all major feature views.
- **Strict tRPC Invalidation**: Standardized on object-based `.queryKey()` invalidation for TanStack Query v5 compatibility.

### Changed

- Migrated 700+ line components into modular, hook-driven domain components.
- Standardized interactive elements with explicit `type="button"` for linting compliance.
- Improved error handling and loading states across all feature domains.

### Removed

- Redundant legacy components in `src/components/projects`, `src/components/templates`, etc.

## [1.6.0] - 2026-02-02

### Added

- **Complete UI Component Library**: Added comprehensive shadcn/ui components including accordion, alert-dialog, aspect-ratio, avatar, breadcrumb, button-group, calendar, collapsible, command, context-menu, drawer, field, form, hover-card, input-group, input-otp, item, kbd, menubar, navigation-menu, pagination, progress, radio-group, sheet, sidebar, slider, spinner, switch, toggle-group, and toggle
- **Enhanced Layout Components**: New shell component, app-sidebar with navigation, breadcrumbs, go-back functionality, and section-dashboard components
- **Mobile Responsiveness**: Added use-mobile hooks for better mobile experience
- **Navigation System**: Complete nav-header and nav-main components with improved navigation structure
- **Enhanced Authentication**: GitHub login component and dropdown sign-out component
- **Domain Architecture**: Auth domain components with better separation of concerns

### Changed

- **UI Modernization**: Updated existing UI components (badge, button, card, checkbox, dialog, dropdown-menu, empty, input, label, scroll-area, select, separator, skeleton, sonner, table, tabs, textarea, tooltip) with latest shadcn/ui patterns
- **Component Structure**: Refactored header, mode-toggle, and user-menu components for better consistency
- **Styling Updates**: Enhanced index.css and lib/utils.ts with improved utility functions
- **Workspace Configuration**: Updated pnpm-workspace.yaml and pnpm-lock.yaml for new dependencies

### Removed

- **Legacy Page Components**: Removed old page.tsx and replaced with modern server component architecture
- **Deprecated Auth Components**: Replaced sign-in-form, sign-in-view, and use-auth hook with new domain-driven architecture

## [1.7.0] - 2026-02-04

### Added

- **New Footer Component**: Created modern footer with brand section and copyright information
- **Enhanced Project Creation**: Added dedicated project creation page with improved UX
- **Public Layout**: Added public layout for better page organization
- **New UI Components**: Added carousel, combobox, direction, native-select, and resizable components
- **Cookie Management**: Added cookie utilities for better state management

### Changed

- **Navigation Cleanup**: Removed template and audit navigation links from sidebar
- **User Menu Refactor**: Simplified user menu component and removed settings option
- **Avatar Styling**: Updated avatar components with consistent styling across the app
- **Dashboard Layout**: Improved dashboard section padding and layout consistency
- **Breadcrumbs**: Enhanced breadcrumbs with responsive design (hidden on mobile, shown in dedicated section on desktop)
- **Component Cleanup**: Removed deprecated components including input-group, input-otp, slider, and user-menu
- **Project Management**: Refactored project components for better modularity
- **Environment Variables**: Updated environment panel and project detail components

## [1.7.1] - 2026-02-04

### Fixed

- **Build Issues**: Resolved TypeScript compilation errors for Next.js 16 compatibility
- **Redirect Function**: Fixed redirect calls in dashboard pages with proper type handling
- **SignOut Function**: Fixed authentication sign-out callback parameters
- **Component Dependencies**: Removed unused components causing build failures
- **Import Issues**: Cleaned up unused imports in navigation components

### Changed

- **Dependencies**: Added @base-ui/react for combobox component support
- **Type Safety**: Improved Promise handling in environment creation flow

## [1.7.3] - 2026-02-04

### Fixed

- Fixed sidebar active state logic to properly handle nested routes
- Improved menu item rendering with centralized configuration array

## [1.7.4] - 2026-02-04

### Added

- **Enhanced Project Creation Form**: Added new fields to project creation
  - Repository URL field for linking to project source code
  - Website URL field for project deployment links  
  - Public/Private toggle for project visibility settings
  - Auto-generated slugs from project names for URL-friendly identifiers

### Changed

- **API Schema Updates**: Extended project and environment schemas with new fields
- **Database Integration**: Updated create mutations to handle new project fields
- **Code Cleanup**: Removed deprecated templates domain and components
- **Build Fixes**: Resolved TypeScript compilation errors and lint issues

### Fixed

- Database schema regeneration after dropping all tables
- Generated new migration (0002_neat_ender_wiggin.sql) with updated schema
- Applied database migrations successfully with proper indexes and constraints
- Fixed environment creation missing required slug field
- Removed broken template references and components

## [Unreleased]

## [1.2.0] - 2026-01-19

### Added

- Comprehensive Environment Management Dashboard
- Project Management: Create, edit, and delete projects with Card-based UI
- Environment Management: Multi-environment support with Tab-based navigation
- Advanced Variable Editor: Masked/Reveal values, Copy to Clipboard functionality
- Bulk Variable Management: Import multiple variables from .env paste; Export to clipboard
- Real-time Variable Search and Filtering by key
- Core API: Added `bulkImport` and `export` endpoints for environment variables
- UI: Refactored Header with centralized `siteConfig` and glassmorphism styling
- UI: Interactive micro-animations and loading states with Skeleton components

### Fixed

- Critical bug in `variables.update` mutation preventing unintentional data overwrites

### Changed

- Centralized Branding: Integrated `siteConfig` across the application header
- Migrated Dashboard to a project-centric view

## [1.0.2] - 2025-01-19

### Added

- Version management and commit workflow scripts
- Automated release scripts with semantic versioning
- Comprehensive documentation for development workflow
- CHANGELOG.md with proper formatting
- Environment validation skip option via SKIP_ENV_VALIDATION flag

### Fixed

- Fixed turbo.json configuration with duplicate build tasks
- Updated environment validation logic to use string comparison
- Resolved Vercel build environment variable issues

### Changed

---

## [1.0.0] - 2025-01-19

### Added

- Initial project structure with Better-T-Stack
- TypeScript configuration
- Next.js full-stack application
- TailwindCSS and shadcn/ui components
- tRPC for type-safe APIs
- Drizzle ORM with PostgreSQL
- Better-Auth authentication
- Biome for linting and formatting
- Husky git hooks
- PWA support
- Turborepo monorepo setup

---

## How to Update This Changelog

1. Add new entries under the `[Unreleased]` section
2. When releasing a new version:
   - Move changes from `[Unreleased]` to the new version section
   - Add the release date
   - Update the version number following semantic versioning
   - Remove the empty `[Unreleased]` header if no changes remain

## Version Format

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

Example: `1.2.3` means MAJOR=1, MINOR=2, PATCH=3

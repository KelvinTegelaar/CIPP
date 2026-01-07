# CIPP UI Architecture Documentation

This directory contains comprehensive documentation of the CIPP (CyberDrain Improved Partner Portal) UI component architecture.

## Documentation Files

### 📘 [UI-COMPONENT-ARCHITECTURE.md](./UI-COMPONENT-ARCHITECTURE.md)
**High-level overview of the UI architecture**

Covers:
- Technology stack and framework details
- Application entry point and wrapper hierarchy
- Navigation and routing structure
- Component organization by category
- Common page structure patterns
- Data flow and state management
- Active vs unused component analysis

**Read this first** for a comprehensive understanding of the codebase structure.

### 📊 [COMPONENT-HIERARCHY.md](./COMPONENT-HIERARCHY.md)
**Detailed visual mapping of component relationships**

Includes:
- Complete directory structure with file counts
- Visual flow diagrams for rendering
- Provider and layout hierarchies
- Detailed page pattern architectures
- Component usage statistics
- State management flows
- Data and navigation flows

**Reference this** for understanding specific patterns and relationships.

## Quick Reference

### Codebase Statistics
- **Framework**: Next.js 15.2.2 (React 19.1.1)
- **Total Pages**: 270 files
- **Total Components**: 238 files
- **Active Code**: ~97%
- **Template/Unused**: ~3% (93 files in `/src/sections/`)

### Main Component Categories
1. **CippTable** - Data table components (~25 files)
2. **CippCards** - Card-based displays (~20 files)
3. **CippComponents** - General utilities (~100 files)
4. **CippFormPages** - Form templates (~15 files)
5. **CippWizard** - Multi-step wizards (~10 files)
6. **CippSettings** - Settings UI (~10 files)
7. **CippStandards** - Standards UI (~10 files)
8. **CippIntegrations** - Integration UI (~10 files)

### Common Page Patterns

#### 1. List/Table Pages (~100 pages)
```javascript
// Uses CippTablePage wrapper
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => (
  <CippTablePage
    title="Title"
    apiUrl="/api/endpoint"
    columns={[...]}
    actions={[...]}
  />
);
```

#### 2. Form Pages (~80 pages)
```javascript
// Uses CippFormPage or CippFormComponent
import CippFormPage from "/src/components/CippFormPages/CippFormPage";

const Page = () => (
  <CippFormPage
    title="Title"
    formSchema={...}
    postUrl="/api/endpoint"
  />
);
```

#### 3. Dashboard Pages (~15 pages)
```javascript
// Uses CippCards components
import { CippChartCard } from "../components/CippCards/CippChartCard";
import { CippPropertyListCard } from "../components/CippCards/CippPropertyListCard";

const Page = () => (
  <Container>
    <Grid container spacing={3}>
      <Grid item><CippChartCard {...} /></Grid>
      <Grid item><CippPropertyListCard {...} /></Grid>
    </Grid>
  </Container>
);
```

#### 4. Detail/Tabbed Pages (~30 pages)
```javascript
// Uses TabbedLayout
import { TabbedLayout } from "/src/layouts/TabbedLayout";

const Page = () => (
  <TabbedLayout tabs={[...]}>
    {/* Tab content with cards, tables, forms */}
  </TabbedLayout>
);
```

### Application Entry Point

```
/src/pages/_app.js
  → Provider Stack (Redux, TanStack Query, Settings, Theme)
    → /src/layouts/index.js (Layout with navigation)
      → Page Component
        → CippTablePage / CippFormPage / Custom layout
```

### State Management

1. **Component State** - Local UI state (useState)
2. **React Context** - App settings, release notes
3. **TanStack Query** - API data caching
4. **Redux Store** - Global app state (tenant selection, user settings)
5. **LocalStorage** - Persistent cache

### Navigation Structure

Defined in `/src/layouts/config.js`:

1. Dashboard (`/`)
2. Identity Management (`/identity/*`)
3. Tenant Administration (`/tenant/*`)
4. Security & Compliance (`/security/*`)
5. Intune (`/endpoint/*`)
6. Teams & SharePoint (`/teams-share/*`)
7. Email & Exchange (`/email/*`)
8. Tools (`/tools/*`)
9. CIPP Settings (`/cipp/*`)

## Template Code to Remove

### `/src/sections/` Directory (93 files - 0% usage)
This directory contains template code from a starter kit that is **NOT used** in production:
- Calendar components
- Product management UI
- Generic data states
- Template dashboard components

**Status**: Can be safely removed

## Architecture Highlights

### ✅ Strengths
- **High modularity** - Well-separated, reusable components
- **Consistent patterns** - Predictable page structures
- **Strong typing** - Well-defined prop interfaces
- **Performance** - Efficient caching and lazy loading
- **Scalability** - Easy to extend with new features
- **97% active code** - Minimal technical debt

### 🔄 Opportunities
1. Remove `/src/sections/` template code (93 files)
2. Add component documentation (Storybook)
3. Implement full TypeScript migration
4. Add component unit tests
5. Optimize bundle size with code splitting

## Most Used Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| CippTablePage | 60+ pages | Complete table page wrapper |
| CippFormComponent | 50+ pages | Form wrapper with validation |
| CippDataTable | 40+ pages | Standalone table component |
| CippApiResults | 40+ pages | API response display |
| CippPropertyListCard | 30+ pages | Property list display |
| CippChartCard | 15+ pages | Data visualization |

## Getting Started

1. **Read** [UI-COMPONENT-ARCHITECTURE.md](./UI-COMPONENT-ARCHITECTURE.md) for overall understanding
2. **Reference** [COMPONENT-HIERARCHY.md](./COMPONENT-HIERARCHY.md) for specific patterns
3. **Explore** `/src/components/` directories for reusable components
4. **Check** `/src/layouts/config.js` for navigation structure
5. **Review** example pages in each section for patterns

## Adding New Features

### Adding a New List Page
1. Create page file in appropriate directory (e.g., `/src/pages/identity/administration/new-entity/index.js`)
2. Import and use `CippTablePage` component
3. Define columns and API endpoint
4. Add route to `/src/layouts/config.js` with permissions
5. Test with appropriate user permissions

### Adding a New Form Page
1. Create page file (e.g., `/src/pages/identity/administration/new-entity/add.jsx`)
2. Import and use `CippFormPage` or `CippFormComponent`
3. Define form schema and validation
4. Set up API endpoint for submission
5. Add navigation link in parent list page

### Adding a New Dashboard
1. Create page file (e.g., `/src/pages/dashboards/new-dashboard.js`)
2. Import card components (`CippChartCard`, `CippPropertyListCard`, etc.)
3. Set up API calls with `ApiGetCall` hook
4. Arrange cards in MUI Grid layout
5. Add route to config.js

## Key Files Reference

- **Entry Point**: `/src/pages/_app.js`
- **Main Layout**: `/src/layouts/index.js`
- **Navigation Config**: `/src/layouts/config.js`
- **API Layer**: `/src/api/ApiCall.jsx`
- **Redux Store**: `/src/store/`
- **Settings Context**: `/src/contexts/settings-context.js`
- **Main Dashboard**: `/src/pages/index.js`

## Component Naming Conventions

- **Cipp\*Page**: Full page components (CippTablePage, CippFormPage)
- **Cipp\*Card**: Card-based display components
- **Cipp\*Drawer**: Slide-out drawer components
- **Cipp\*Dialog**: Modal dialog components
- **Cipp\*Form\***: Form-related components

## Permission System

Components and routes are filtered based on user permissions:

```javascript
// In config.js
{
  title: "Users",
  path: "/identity/administration/users",
  permissions: ["Identity.User.*"]  // Pattern matching supported
}
```

Permissions are checked in the Layout component and filter the navigation menu dynamically.

## Support & Questions

For questions about the architecture or adding new features:
1. Refer to these documentation files
2. Check existing similar pages for patterns
3. Review component source code in `/src/components/`
4. Look at the navigation config in `/src/layouts/config.js`

---

**Last Updated**: 2026-01-07  
**Codebase Version**: 8.8.2  
**Documentation Version**: 1.0

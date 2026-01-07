# CIPP Component Hierarchy and Architecture Map

This document provides a detailed visual mapping of how components are structured and used throughout the CIPP application.

## Component Directory Structure

```
/src/
├── api/                    # API integration layer
│   └── ApiCall.jsx         # TanStack Query wrappers
│
├── components/             # Reusable UI components (238 files)
│   ├── CippCards/          # Card-based displays (~20 files)
│   ├── CippComponents/     # General utilities (~100 files)
│   ├── CippFormPages/      # Form page templates (~15 files)
│   ├── CippIntegrations/   # Integration UI (~10 files)
│   ├── CippSettings/       # Settings UI (~10 files)
│   ├── CippStandards/      # Standards UI (~10 files)
│   ├── CippTable/          # Table components (~25 files)
│   └── CippWizard/         # Multi-step wizards (~10 files)
│
├── contexts/               # React Context providers
│   ├── settings-context.js
│   └── release-notes-context.js
│
├── layouts/                # Page layouts (13 files)
│   ├── index.js            # Main layout wrapper
│   ├── config.js           # Navigation configuration
│   ├── side-nav.js
│   ├── top-nav.js
│   └── [other nav components]
│
├── pages/                  # Next.js pages (270 files)
│   ├── _app.js             # Application root
│   ├── _document.js        # HTML document
│   ├── index.js            # Dashboard
│   ├── identity/           # Identity management (~30 files)
│   ├── tenant/             # Tenant admin (~80 files)
│   ├── security/           # Security (~15 files)
│   ├── endpoint/           # Intune (~25 files)
│   ├── teams-share/        # Teams/SharePoint (~8 files)
│   ├── email/              # Exchange (~50 files)
│   ├── tools/              # Tools (~15 files)
│   └── cipp/               # CIPP settings (~40 files)
│
├── sections/               # ⚠️ TEMPLATE CODE - NOT USED (93 files)
│   └── dashboard/          # Generic dashboard components
│
├── store/                  # Redux store
│   └── [Redux slices]
│
└── [other directories]
```

## Application Rendering Flow

### 1. Application Entry Point

```
User Request
    ↓
Next.js Router
    ↓
/src/pages/_app.js
    ↓
Provider Stack (Nested wrapping)
    ↓
Page Component
    ↓
Layout (via getLayout)
    ↓
Rendered UI
```

### 2. Provider Hierarchy (Outermost to Innermost)

```
<CacheProvider>                         # Emotion CSS-in-JS cache
  <ReduxProvider>                       # Redux global state
    <QueryClientProvider>               # TanStack Query (API cache)
      <SettingsProvider>                # App settings context
        <LocalizationProvider>          # Date/time i18n
          <SettingsConsumer>            # Settings consumer
            <ThemeProvider>             # MUI theme
              <RTL>                     # RTL language support
                <CssBaseline />         # CSS reset
                <ErrorBoundary>         # Error catching
                  <PrivateRoute>        # Auth guard
                    <ReleaseNotesProvider>  # Release notes state
                      {page}            # Page content
                <Toaster />             # Toast notifications
                <CippSpeedDial />       # Help menu
```

### 3. Layout Structure

```
<Layout> (DashboardLayout)
  │
  ├── <TopNav>
  │   ├── Logo
  │   ├── Mobile Menu Button
  │   ├── <OrganizationPopover>  (Tenant Selector)
  │   ├── <NotificationsPopover>  (Notification Bell)
  │   └── <AccountPopover>  (User Menu)
  │
  ├── <SideNav> (Desktop) / <MobileNav> (Mobile)
  │   └── Menu Items (from config.js)
  │       ├── Filtered by user permissions
  │       └── Hierarchical structure
  │
  └── <LayoutRoot>
      └── <LayoutContainer>
          ├── <CippBreadcrumbNav />  (Breadcrumbs)
          ├── <Divider />
          ├── {children}  (Page Content)
          └── <Footer />
```

## Page Pattern Architectures

### Pattern 1: List/Table Pages (~100 pages)

```
Page Component
  └── <DashboardLayout>
      └── <CippTablePage>
          ├── Title & Description
          ├── Action Buttons
          │   ├── Add New
          │   ├── Bulk Actions
          │   └── Export
          │
          └── <CippDataTable>
              ├── Column Definitions
              ├── Data Fetching (ApiGetCall)
              ├── Filtering & Search
              ├── Sorting
              ├── Pagination
              └── Row Actions
                  ├── Edit
                  ├── View Details
                  ├── Delete
                  └── Custom Actions

API Layer: ApiGetCall → TanStack Query → Table Data
```

**Example Pages:**
- `/identity/administration/users/index.js`
- `/tenant/administration/tenants/index.js`
- `/email/administration/mailboxes/index.js`

### Pattern 2: Form/Add/Edit Pages (~80 pages)

```
Page Component
  └── <DashboardLayout>
      └── <CippFormPage> or <CippFormComponent>
          ├── Form Title
          ├── Form Schema (Formik/React Hook Form)
          ├── Form Fields
          │   ├── Text Inputs
          │   ├── Selects/Dropdowns
          │   ├── Checkboxes
          │   ├── <CippFormTenantSelector>
          │   └── Custom Field Components
          │
          ├── Validation
          ├── Submit Handler
          └── <CippApiResults>  (API Response Display)

API Layer: Form Submit → ApiPostCall → TanStack Query → Result Display
```

**Example Pages:**
- `/identity/administration/users/add.jsx`
- `/tenant/administration/tenants/add.js`
- `/email/administration/contacts/edit.jsx`

### Pattern 3: Dashboard/Overview Pages (~15 pages)

```
Page Component
  └── <DashboardLayout>
      └── <Container>
          └── <Grid container>
              ├── <Grid item>
              │   └── <CippChartCard>
              │       ├── Chart Title
              │       ├── Chart Type (pie/bar/donut)
              │       └── Data Series (from API)
              │
              ├── <Grid item>
              │   └── <CippPropertyListCard>
              │       ├── Card Title
              │       └── Property Items (key-value pairs)
              │
              ├── <Grid item>
              │   └── <CippInfoBar>
              │       └── Info Items (status indicators)
              │
              └── <Grid item>
                  └── <CippUniversalSearch>
                      └── Global search functionality

API Layer: Multiple ApiGetCall hooks → Dashboard Data
```

**Example Pages:**
- `/index.js` (main dashboard)
- `/dashboardv2/index.js`
- `/dashboardv2/identity/index.js`

### Pattern 4: Detail/Tabbed View Pages (~30 pages)

```
Page Component
  └── <DashboardLayout>
      └── <TabbedLayout> or <HeaderedTabbedLayout>
          ├── Header
          │   ├── Entity Name/Title
          │   └── Quick Actions
          │
          └── Tabs
              ├── Tab 1: Overview
              │   ├── <CippPropertyListCard>
              │   ├── <CippChartCard>
              │   └── <CippInfoBar>
              │
              ├── Tab 2: Details
              │   └── <CippDataTable>
              │
              ├── Tab 3: Related Items
              │   └── <CippPropertyListCard>
              │
              └── Tab N: Edit
                  └── <CippFormComponent>

API Layer: Multiple ApiGetCall hooks (one per tab) → Tab Data
```

**Example Pages:**
- `/identity/administration/users/user/index.jsx`
- `/tenant/gdap-management/relationships/relationship/index.js`

### Pattern 5: Wizard/Multi-Step Pages (~10 pages)

```
Page Component
  └── <DashboardLayout>
      └── <CippWizard>
          ├── Step Indicator
          ├── Step 1
          │   └── Form Fields
          │
          ├── Step 2
          │   └── Form Fields
          │
          ├── Step N
          │   └── Review & Confirm
          │
          └── Navigation
              ├── Back Button
              ├── Next Button
              └── Submit Button

API Layer: Step-by-step data collection → Final Submit → ApiPostCall
```

**Example Pages:**
- `/onboardingv2.js`
- `/identity/administration/offboarding-wizard/index.js`

## Component Usage Matrix

### High-Usage Components (50+ imports)

| Component | Usage | Primary Purpose |
|-----------|-------|-----------------|
| `CippTablePage` | 60+ pages | Complete table page wrapper |
| `CippFormComponent` | 50+ pages | Form wrapper with validation |
| `CippDataTable` | 40+ pages | Standalone table component |
| `CippApiResults` | 40+ pages | API response display |
| `CippPropertyListCard` | 30+ pages | Property list display |
| Layout (via getLayout) | 270 pages | Page structure wrapper |

### Medium-Usage Components (10-49 imports)

| Component | Usage | Primary Purpose |
|-----------|-------|-----------------|
| `CippChartCard` | 15+ pages | Data visualization |
| `CippApiDialog` | 20+ pages | Modal dialogs |
| `CippFormPage` | 25+ pages | Form page wrapper |
| `CippInfoBar` | 15+ pages | Status/info bars |
| `CippBreadcrumbNav` | All pages | Navigation breadcrumbs |

### Specialized Components (1-9 imports)

| Component | Usage | Primary Purpose |
|-----------|-------|-----------------|
| `CippUserActions` | 5+ pages | User management actions |
| `CippBulkUserDrawer` | 3 pages | Bulk user operations |
| `CippCADeployDrawer` | 2 pages | Conditional Access deploy |
| `CippPolicyDeployDrawer` | 3 pages | Policy deployment |
| `CippTemplateEditor` | 5+ pages | Template editing |
| `CippSchedulerDrawer` | 2 pages | Scheduled task editor |
| `CippSharedMailboxDrawer` | 1 page | Shared mailbox creation |
| `ExecutiveReportButton` | 1 page | Executive report generation |

## State Management Architecture

### State Layer Hierarchy

```
┌─────────────────────────────────────────┐
│  Component Local State (useState)       │  ← UI-specific state
├─────────────────────────────────────────┤
│  React Context (Settings, ReleaseNotes) │  ← App-wide settings
├─────────────────────────────────────────┤
│  TanStack Query Cache                   │  ← API data cache
├─────────────────────────────────────────┤
│  Redux Store                            │  ← Global app state
├─────────────────────────────────────────┤
│  LocalStorage Persistence               │  ← Persistent cache
└─────────────────────────────────────────┘
```

### State Flow Examples

#### API Data Flow
```
Component Request
    ↓
ApiGetCall hook
    ↓
TanStack Query
    ↓
Check Cache (localStorage)
    ├─ Hit: Return cached data
    └─ Miss: Fetch from API
        ↓
    Cache result
        ↓
    Return to component
        ↓
    Re-render with data
```

#### Settings Flow
```
User Changes Setting
    ↓
settings.handleUpdate()
    ↓
Redux Store Update
    ↓
Persist to API (/api/UpdateUserSettings)
    ↓
Update LocalStorage
    ↓
Re-render affected components
```

#### Tenant Selection Flow
```
User Selects Tenant
    ↓
OrganizationPopover onChange
    ↓
Redux: Update currentTenant
    ↓
All pages re-render
    ↓
API calls use new tenant filter
    ↓
Tables/Cards refresh with new data
```

## Permission-Based Component Rendering

### Permission Checking Flow

```
Page Load
    ↓
Layout reads user permissions
    ↓
Filter nativeMenuItems by permissions
    ↓
Generate filtered menu
    ↓
Render accessible navigation items

Component Render
    ↓
Check required permissions
    ↓
    ├─ Has Permission: Render component
    └─ No Permission: Hide or disable
```

### Permission Pattern Examples

```javascript
// Exact match
permissions: ["Identity.User.Read"]

// Pattern match (wildcard)
permissions: ["CIPP.*"]  // Matches all CIPP permissions

// Multiple required (OR logic)
permissions: ["Identity.User.*", "Identity.Group.*"]
```

## Data Flow Patterns

### Read (GET) Flow
```
Component Mount
    ↓
ApiGetCall({
  url: "/api/endpoint",
  queryKey: "unique-key",
  data: { filters }
})
    ↓
TanStack Query
    ↓
HTTP GET Request
    ↓
API Response
    ↓
Update Query Cache
    ↓
Component Re-render
    ↓
Display Data in CippTable/CippCard
```

### Write (POST) Flow
```
User Action (Form Submit/Button Click)
    ↓
ApiPostCall({
  url: "/api/endpoint",
  data: { payload }
})
    ↓
HTTP POST Request
    ↓
API Response
    ↓
<CippApiResults> displays result
    ↓
Invalidate related queries
    ↓
Affected components refresh
```

## Component Communication Patterns

### Parent-Child Communication
```
Parent Component
    ├─ Props down ↓
    └─ Child Component
        └─ Callbacks up ↑
```

### Sibling Communication (via shared state)
```
Component A → Update Redux/Query Cache
                    ↓
            Component B detects change
                    ↓
            Component B re-renders
```

### Global Communication (via events/context)
```
Component A → Dispatch toast
                ↓
        Redux Store Update
                ↓
        Toaster Component
                ↓
        Display notification
```

## Navigation Flow

### Menu Navigation
```
User Clicks Menu Item
    ↓
Router Push (Next.js)
    ↓
Page Component Load
    ↓
getLayout wraps page
    ↓
Layout renders
    ↓
Page content renders
```

### Programmatic Navigation
```
Component Action
    ↓
router.push('/path')
    ↓
Next.js Router
    ↓
New Page Load
```

### Breadcrumb Navigation
```
Current Route (pathname)
    ↓
CippBreadcrumbNav
    ↓
Parse path segments
    ↓
Generate breadcrumb links
    ↓
Render clickable breadcrumbs
```

## Template/Unused Code Summary

### Confirmed Unused (Can be removed)

**`/src/sections/` Directory - 93 files**
- Contains generic template components
- Zero imports in production code
- Includes:
  - Calendar components
  - Product management UI
  - Generic data states
  - Template dashboard components

### Verification Needed

**`/src/pages/onboarding.js`**
- Potentially superseded by onboardingv2.js
- Requires verification before removal

## Architecture Strengths

1. **High Modularity**: Components are well-separated and reusable
2. **Consistent Patterns**: Pages follow predictable structures
3. **Clear Hierarchy**: Obvious component relationships
4. **Strong Typing**: Well-defined prop interfaces
5. **Performance**: Efficient data caching and lazy loading
6. **Scalability**: Easy to add new pages following existing patterns
7. **Maintainability**: Clear naming and organization

## Architecture Opportunities

1. Remove template code (`/src/sections/`)
2. Add component documentation (Storybook)
3. Implement TypeScript for type safety
4. Add component unit tests
5. Document permission patterns
6. Create component usage guidelines
7. Optimize bundle size with code splitting

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-07  
**Codebase Version**: 8.8.2

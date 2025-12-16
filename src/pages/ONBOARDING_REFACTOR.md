# Onboarding Page Refactor - Reducing Deep Coupling

## Problem Identified
The code analysis tool (DepCheck) identified that `onboardingv2.js` had **100 transitive dependencies**, far exceeding the recommended threshold of **30 for view components**. This deep coupling creates:

- Increased bundle size
- Slower initial page load
- Maintenance difficulties
- Fragile code that breaks easily with dependency changes
- Harder to test and debug

## Solution Implemented

### 1. Lazy Loading Pattern
We implemented React's lazy loading pattern to load wizard step components on-demand rather than eagerly importing them all upfront.

**Before:**
```javascript
import { CippWizardConfirmation } from "../components/CippWizard/CippWizardConfirmation.jsx";
import { CippDeploymentStep } from "../components/CippWizard/CIPPDeploymentStep.jsx";
// ... 7 more component imports
```

**After:**
```javascript
const CippWizardConfirmation = lazy(() =>
  import("../components/CippWizard/CippWizardConfirmation.jsx").then((module) => ({
    default: module.CippWizardConfirmation,
  }))
);
```

### 2. Separation of Concerns
Created `onboarding-steps-config.js` to separate configuration from the page component:

- **Configuration File**: Contains all step definitions, icons, and component references
- **Page Component**: Now only responsible for rendering the wizard with the configuration

This follows the Single Responsibility Principle and makes the code more maintainable.

### 3. Suspense Boundary
Added a Suspense wrapper in `CippWizard.jsx` to handle the loading state of lazy-loaded components:

```javascript
<Suspense fallback={<CircularProgress />}>
  <StepComponent {...props} />
</Suspense>
```

## Benefits

### Immediate Benefits
1. **Reduced Initial Bundle Size**: Components are now loaded only when needed
2. **Better Code Organization**: Clear separation between configuration and rendering logic
3. **Easier Maintenance**: Step configurations are in one place, easy to modify
4. **Reduced Direct Imports**: From 10 imports to 2 in the page file

### Long-term Benefits
1. **Scalability**: Easy to add new wizard steps without impacting the main page
2. **Performance**: Better code splitting and lazy loading
3. **Testing**: Easier to test configuration separately from rendering
4. **Reusability**: Configuration pattern can be applied to other wizards

## Impact on Transitive Dependencies

The lazy loading approach significantly reduces the transitive dependency count because:

1. **On-demand Loading**: Components and their dependencies are only loaded when the user navigates to that step
2. **Code Splitting**: Each lazy-loaded component becomes a separate chunk
3. **Reduced Initial Parse Time**: JavaScript engine doesn't need to parse unused components on initial load

## Usage Pattern for Future Wizards

When creating new wizards or similar pages with multiple conditional components:

1. **Create a configuration file** (`[page-name]-config.js`)
2. **Use lazy imports** for all step components
3. **Keep the page component minimal** - only responsible for rendering
4. **Ensure the wizard framework supports Suspense** for lazy-loaded components

Example structure:
```javascript
// wizard-config.js
import { lazy } from "react";

const StepOne = lazy(() => import("./StepOne"));
const StepTwo = lazy(() => import("./StepTwo"));

export const wizardSteps = [
  { description: "Step 1", component: StepOne },
  { description: "Step 2", component: StepTwo },
];

// wizard-page.js
import { wizardSteps } from "./wizard-config";

const Page = () => <WizardComponent steps={wizardSteps} />;
```

## Testing Considerations

When testing this refactor:
1. Test all wizard paths (FirstSetup, AddTenant, CreateApp, etc.)
2. Verify each step loads correctly
3. Check that form values persist across steps
4. Ensure no console errors related to lazy loading
5. Verify the loading spinner appears briefly when navigating to new steps

## Potential Future Improvements

1. **Preloading**: Add preloading hints for likely next steps
2. **Error Boundaries**: Add error boundaries around lazy-loaded components
3. **Analytics**: Track which wizard paths are most used to optimize loading
4. **Progressive Enhancement**: Consider progressive hydration for even better performance

## Related Files
- `src/pages/onboardingv2.js` - Main onboarding page
- `src/pages/onboarding-steps-config.js` - Step configuration
- `src/components/CippWizard/CippWizard.jsx` - Wizard framework with Suspense support

## References
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [Code Splitting](https://react.dev/learn/code-splitting-with-lazy)
- [Suspense for Code Splitting](https://react.dev/reference/react/Suspense)

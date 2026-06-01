UI & DESIGN SYSTEM RULES
DESIGN SYSTEM
Define CSS variables in 
src/styles/variables.css or via Tailwind config. Never hardcode
colors or spacing values in component files.
Color Tokens (adapt to chosen design system):
css
:root {--color-primary: #0F6FDE;--color-primary-dark: #0A56B0;--color-primary-light: #EBF3FD;--color-success: #16A34A;--color-warning: #D97706;--color-danger: #DC2626;--color-neutral-50: #F9FAFB;--color-neutral-100: #F3F4F6;--color-neutral-200: #E5E7EB;--color-neutral-500: #6B7280;--color-neutral-700: #374151;--color-neutral-900: #111827;--color-white: #FFFFFF;
}
COMPONENT LIBRARY RULES
Use a consistent component library across the entire project.
Options (pick ONE, do not mix):
Tailwind CSS (utility-first) — preferred
shadcn/ui + Tailwind
Chakra UI
Material UI
Document the choice in Step 01 and NEVER switch mid-project.
LOADING STATES
Every async operation MUST show a loading state.
Use Skeleton components (not just spinners) for content areas.
Patterns:
Button: disable + show spinner inside button
Full page: 
<PageLoader /> component
Card list: 
<SkeletonCard /> repeated
Table: 
<SkeletonRow /> repeated
ERROR STATES
Every async content area MUST show an error state.
Error states must include:
Clear message (user-friendly, not technical)
Retry action when applicable
EMPTY STATES
Every list or data view MUST handle empty state.
Empty states must include:
Icon or illustration
Descriptive message
Call-to-action when applicable (e.g., "Start shopping" button)
TOAST NOTIFICATIONS
Use a single toast system (react-hot-toast recommended).
Placement: top-right.
When to use toast:
Success: after successful mutation (create, update, delete)
Error: after failed mutation
Info: for non-blocking informational messages
When NOT to use toast:
Validation errors (show inline in form)
Page-level data loading errors (show inline error state)
RESPONSIVE DESIGN
All pages MUST be responsive.
Mobile-first approach.
Breakpoints:
Mobile: < 768px
Tablet: 768px – 1024px
Desktop: > 1024px
Layouts that change by breakpoint:
Navigation: hamburger menu on mobile
Sidebar: drawer on mobile, fixed on desktop
Grid: 1 col mobile → 2 col tablet → 3-4 col desktop
Tables: horizontal scroll on mobile
ACCESSIBILITY
Every interactive element MUST have:
Accessible label (aria-label or visible label)
Keyboard navigation support
Focus visible style
Images MUST have alt text.
Form fields MUST have associated labels.
Error messages MUST be linked to their field via aria-describedby.
═══════════════════════════════════════════
BLOCO 4 — STEP EXECUTION TEMPLATE
Envie junto com CADA STEP
═══════════════════════════════════════════
STEP EXECUTION INSTRUCTIONS
Apply rules from:
core-frontend-rules.md
architecture-rules.md
ui-design-rules.md
Implement ONLY what this step describes.
MANDATORY BEFORE CODING
Step 1 — Full src audit
Scan the entire src folder.
Produce a complete inventory of:
Pages
Components
Hooks
Stores
APIs
Types
Utils
Routes
Layouts
Step 2 — Existing implementation audit
For every item requested:
State:
Already exists
Partially exists
Similar implementation exists
Does not exist
Step 3 — Reuse analysis
For each item explain:
Reuse
Extend
Modify
Create
Step 4 — Duplication analysis
Explicitly prove that no duplicate implementation is being created.
Step 5 — Conflict check
If any architecture conflict exists:
STOP.
Explain.
Wait.
Step 6 — Implementation plan
Describe implementation in plain text.
Step 7 — File list
Files to reuse (with full relative path from src/)
Files to extend (with full path and what changes)
Files to modify (with full path and what changes)
Files to create (with full path — only if justified)
Step 8 — Generate code
Only after all previous steps are complete.
COMPLETION CHECKLIST
After implementing, verify:
[ ] Entire src folder was scanned before writing any code
[ ] Verification table was shown (Requested Item / Exists / File Path / Reuse / Extend / Create)
[ ] No component was created that already existed
[ ] No hook was created that already existed
[ ] No store was created that already existed
[ ] No API service was created that already existed
[ ] No utility was created that already existed
[ ] No type was created that already existed
[ ] Existing implementations were reused or extended wherever possible
[ ] No API call made directly inside a component (always via hook)
[ ] All async operations show loading state
[ ] All async operations handle error state
[ ] All lists handle empty state
[ ] All forms use React Hook Form + Zod validation
[ ] All types are properly defined in src/types/
[ ] No hardcoded API URLs (use axiosInstance)
[ ] Protected routes use correct route wrapper
[ ] No console.log left in code
[ ] No any type in TypeScript
[ ] No inline styles for layout/design
[ ] Responsive design implemented
[ ] Toast notifications on success mutations
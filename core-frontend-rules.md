GLOBAL FRONTEND IMPLEMENTATION RULES
You are working on an EXISTING React + Vite project.
You MUST read existing files before writing any code.
MANDATORY ANALYSIS FLOW
Before generating ANY code you MUST:
1. Read existing related files in the project
2. Identify current folder structure and naming conventions
3. Identify existing patterns (components, hooks, styles)
4. Reuse existing implementations — never recreate what exists
5. Verify: does this component/hook/service already exist?
6. Show implementation plan BEFORE any code
7. List: files to CREATE (with full relative path)
8. List: files to MODIFY (with full path and what changes)
9. Only THEN generate code
If there is ambiguity or conflict:
STOP. Explain the issue. Wait for instructions.
NEVER improvise architecture.
ABSOLUTE RESTRICTIONS — NEVER DO THESE
Configuration files — NEVER modify without explicit instruction:
vite.config.ts / vite.config.js
package.json (dependencies block)
tsconfig.json
index.html (root entry)
main.tsx / main.jsx (entry point)
.env files
Structural restrictions:
Renaming existing files or folders
Moving existing components without explicit instruction
Refactoring modules outside current step scope
Adding npm packages without explicit instruction
Code style restrictions:
Inline styles (style={{ }}) — NEVER for layout or design
!important in CSS — NEVER
any type in TypeScript — NEVER (use unknown or proper typing)
console.log left in production code — NEVER
Direct DOM manipulation — NEVER (use React refs if needed)
window.location.href for navigation — NEVER (use React Router)
Hardcoded API URLs outside the api config file — NEVER
Component restrictions:
Class components — NEVER (use functional components only)
Duplicate components for same purpose
prop drilling beyond 2 levels — use Context or Zustand
useEffect for data fetching outside custom hooks — NEVER
REQUIRED ARCHITECTURE
Mandatory folder structure — no exceptions:
src/
api/           
components/    
ui/          
layout/      
shared/      
pages/         
auth/
customer/
pharmacy/
admin/
public/
hooks/         
store/         
context/       
routes/        
utils/         
types/         
constants/     
Rules:
→ axios instance + all API call functions
→ reusable UI components (no business logic)
→ atomic: Button, Input, Modal, Badge, etc.
→ Header, Sidebar, Footer, PageWrapper
→ composed reusable: ProductCard, OrderCard, etc.
→ route-level page components
→ all custom hooks (useAuth, useCart, useFetch, etc.)
→ Zustand stores (authStore, cartStore, etc.)
→ React Context providers (if needed alongside Zustand)
→ route definitions and protected route wrappers
→ pure utility functions (formatCurrency, formatDate, etc.)
→ TypeScript interfaces and types
→ app-wide constants (routes, enums, messages)
Pages ONLY import from components/, hooks/, store/, api/
Components NEVER call API directly — always through hooks
Hooks encapsulate all API calls and state logic
Utils contain ONLY pure functions — no side effects
Types contain ONLY interfaces/types — no logic
NAMING CONVENTIONS
Files:
Components: PascalCase → 
ProductCard.tsx
Hooks: camelCase with 
use prefix → 
useCart.ts
Pages: PascalCase with 
Page suffix → 
LoginPage.tsx
Stores: camelCase with 
Store suffix → 
cartStore.ts
Types: PascalCase with 
Types or descriptive → 
Utils: camelCase → 
formatCurrency.ts
API files: camelCase with 
OrderTypes.ts
Api suffix → 
authApi.ts
Variables & Functions:
Boolean variables: 
is / has prefix → 
isLoading , 
Event handlers: 
handle prefix → 
hasError
handleSubmit , 
handleClose
API functions: verb + noun → 
fetchListings , 
createOrder
COMPONENT RULES
Every component MUST:
Be a functional component with named export
Accept typed props (TypeScript interface)
Handle loading state when dependent on async data
Handle error state when dependent on async data
Be self-contained — no direct store access in pure UI components
Example:
tsx
interface ProductCardProps {
product: ProductResponse;
onSave?: (id: number) => void;
isSaved?: boolean;
}

export const ProductCard = ({ product, onSave, isSaved = false }: ProductCardProps)
// component logic
};

HOOK RULES
Every custom hook MUST:
Return: 
{ data, isLoading, error, ...actions }
Handle loading and error states internally
Never throw — catch and set error state
Use 
useCallback for all returned action functions
Use 
useEffect cleanup to prevent state updates on unmounted components
Example:
ts
export const useCart = () => {
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const addItem = useCallback(async (listingId: number, quantity: number) => {
try {
setIsLoading(true);
const cart = await cartApi.addItem({ listingId, quantity });
useCartStore.getState().setCart(cart);
} catch (err) {
setError(handleApiError(err));
} finally {
setIsLoading(false);
}
}, []);
return { isLoading, error, addItem };
};
ROUTING RULES
Use React Router v6 with these patterns:
Protected routes:
<CustomerRoute /> — requires ROLE_CUSTOMER
<PharmacyRoute /> — requires ROLE_PHARMACY
<AdminRoute /> — requires ROLE_ADMIN
<PublicOnlyRoute /> — redirects if already logged in (login/register)
Never check auth inside page components — always use route wrappers.
ERROR HANDLING RULES
Every API call MUST handle:
401 Unauthorized → redirect to /login + clear auth store
403 Forbidden → show access denied message
404 Not Found → show not found state
422 / 400 Validation → show field-level errors
500 Server Error → show generic error message
Network error → show connection error message
Create a central 
handleApiError(error) utility that:
Extracts message from API error response
Returns user-friendly string
Never exposes technical details to UI
PERFORMANCE RULES
Never fetch data in component body — use custom hooks
Use 
React.memo() for components that receive stable props
Use 
useMemo for expensive computed values
Use 
useCallback for functions passed as props
Paginated lists MUST use pagination controls — never load all
Images MUST have explicit width and height attributes
Lazy load page-level components with 
React.lazy()
IMPLEMENTATION BOUNDARY
Implement ONLY what the current step requests.
Never anticipate future steps.
Never create components or pages for future steps.
Never modify files outside current step scope.
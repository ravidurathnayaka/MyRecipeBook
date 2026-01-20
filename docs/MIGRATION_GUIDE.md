# Migration Guide: Folder Structure Improvements

This guide documents the improvements made to the project structure following Next.js 14+ best practices.

## ✅ Completed Improvements

### 1. Utilities Moved from `app/utils/` to `lib/`

**Before:**
```
app/utils/
├── auth.ts
├── db.ts
├── requireUser.ts
└── requireAdmin.ts
```

**After:**
```
lib/
├── auth.ts           # NextAuth configuration
├── db.ts             # Prisma client
└── auth-helpers.ts   # requireUser, requireAdmin
```

**Why?**
- `app/` directory should only contain routes and route-specific code
- `lib/` is the standard location for shared utilities in Next.js
- Better separation of concerns

### 2. Types Centralized in `lib/types/`

**Added:**
```
lib/types/
└── index.ts          # Category, RecipeStatus, UserRole, User, Recipe
```

**Benefits:**
- Single source of truth for types
- Prevents type duplication
- Easier to maintain

### 3. Constants Extracted to `lib/constants/`

**Added:**
```
lib/constants/
├── index.ts          # General constants (RECIPES_PER_PAGE, etc.)
└── routes.ts         # Route constants and helpers
```

**Benefits:**
- Consistent route usage across the app
- Easier refactoring of routes
- Type-safe route helpers

### 4. Server Actions Organized in `app/actions/`

**Before:**
```
app/action.ts         # Single file
```

**After:**
```
app/actions/
└── auth.ts           # Grouped by feature
```

**Benefits:**
- Better organization as actions grow
- Clear separation by feature
- Follows Next.js conventions

### 5. Route Groups Improved

**Added:**
```
app/(auth)/           # Authentication-related routes
└── login/
```

**Benefits:**
- Clear separation of auth routes
- Can have different layouts for auth pages
- Better organization

## 📝 Import Changes

### Updated Imports

All imports from `@/app/utils/*` have been updated to `@/lib/*`:

```typescript
// ❌ Old imports
import { auth } from "@/app/utils/auth";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireUser";
import { requireAdmin } from "@/app/utils/requireAdmin";

// ✅ New imports
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/auth-helpers";
```

### Updated Files

All files using old imports have been updated:
- ✅ API routes (`app/api/**/*.ts`)
- ✅ Server components (`app/**/*.tsx`)
- ✅ Client components (`components/**/*.tsx`)
- ✅ Scripts (`scripts/*.ts`)

## 🚀 Route Naming Best Practices

### Recommended Route Structure

While current routes work, consider these improvements:

**Current:**
- `/recipe/[id]` → Consider `/recipes/[id]` (plural, RESTful)
- `/my-recipe` → Consider `/recipes/me` or `/my-recipes`
- `/create-recipe` → Consider `/recipes/new`

**Best Practice:**
```typescript
// RESTful routes
/recipes              # List all recipes
/recipes/[id]         # Recipe detail
/recipes/new          # Create recipe
/recipes/[id]/edit    # Edit recipe
/recipes/me           # User's own recipes
```

### Using Route Constants

Instead of hardcoding routes, use constants:

```typescript
import { ROUTES } from "@/lib/constants/routes";

// ✅ Good
router.push(ROUTES.RECIPES.DETAIL(id));
router.push(ROUTES.RECIPES.EDIT(id));
router.push(ROUTES.RECIPES.NEW);

// ❌ Bad
router.push(`/recipe/${id}`);
router.push(`/recipe/${id}/edit`);
router.push("/create-recipe");
```

## 📁 Folder Structure Best Practices

### Components Organization

```
components/
├── form/              # Form-specific components
├── general/           # Reusable general components
│   ├── navbar/       # Navigation components
│   └── ...
└── ui/                # UI primitives (shadcn/ui)
```

### What Goes Where?

- **`app/`** - Routes, layouts, API routes, server actions
- **`components/`** - React components (UI)
- **`lib/`** - Utilities, types, constants, database
- **`prisma/`** - Database schema and migrations
- **`public/`** - Static assets
- **`scripts/`** - Utility scripts

## ✅ Checklist for Future Development

When adding new features:

- [ ] Put utilities in `lib/`, not `app/utils/`
- [ ] Add types to `lib/types/index.ts`
- [ ] Add constants to `lib/constants/`
- [ ] Use route constants instead of hardcoded paths
- [ ] Group server actions by feature in `app/actions/`
- [ ] Use route groups `(name)` for logical grouping
- [ ] Follow RESTful conventions for routes
- [ ] Use plural nouns for resource routes

## 🔄 Next Steps (Optional Future Improvements)

1. **Route Standardization**
   - Update routes to use plural RESTful conventions
   - Migrate `/recipe/[id]` → `/recipes/[id]`
   - Migrate `/my-recipe` → `/recipes/me`

2. **Component Consolidation**
   - Review navbar components (NavBar.tsx vs NavbarClient.tsx)
   - Consider using a single component pattern

3. **Error Handling**
   - Create error boundaries
   - Standardize error handling patterns

4. **Testing**
   - Add unit tests for utilities
   - Add integration tests for API routes

## 📚 Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Project Structure](https://nextjs.org/docs/app/building-your-application/routing/colocating-files)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

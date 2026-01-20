# Project Structure

This document describes the project structure and organization following Next.js 14+ best practices.

## Directory Structure

```
myrecipebook/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Route group for authentication pages
│   │   └── login/           # Login page
│   ├── (mainlayout)/       # Route group for pages with main layout
│   │   ├── admin/           # Admin dashboard routes
│   │   ├── favorites/       # User favorites page
│   │   ├── profile/         # User profile page
│   │   ├── recipe/          # Recipe detail pages
│   │   ├── recipes/         # Recipe listing, create, edit
│   │   └── layout.tsx       # Main layout with navbar/footer
│   ├── actions/             # Server actions
│   │   └── auth.ts          # Authentication server actions
│   ├── api/                 # API routes
│   │   ├── admin/           # Admin API endpoints
│   │   ├── auth/            # Authentication API
│   │   ├── favorites/       # Favorites API
│   │   ├── recipes/         # Recipes API
│   │   └── user/            # User API endpoints
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
│
├── components/              # React components
│   ├── form/               # Form components
│   ├── general/            # General reusable components
│   │   └── navbar/         # Navigation components
│   └── ui/                 # UI primitives (shadcn/ui)
│
├── lib/                     # Shared libraries and utilities
│   ├── auth.ts             # NextAuth configuration
│   ├── auth-helpers.ts     # Authentication helper functions
│   ├── constants/          # Application constants
│   │   ├── index.ts        # General constants
│   │   └── routes.ts       # Route constants
│   ├── db.ts               # Prisma database client
│   ├── generated/          # Generated Prisma client
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types and enums
│   └── utils.ts            # Utility functions (cn, etc.)
│
├── prisma/                  # Prisma schema and migrations
│   └── schema.prisma       # Database schema
│
├── public/                  # Static assets
│
└── scripts/                 # Utility scripts
    └── create-super-admin.ts
```

## Route Organization

### Public Routes
- `/` - Home page (recipe listing)
- `/recipes/[id]` - Recipe detail page
- `/login` - Authentication page

### Protected Routes (require authentication)
- `/recipes/me` - User's own recipes
- `/recipes/new` - Create new recipe
- `/recipes/[id]/edit` - Edit recipe
- `/favorites` - User's favorite recipes
- `/profile` - User profile management

### Admin Routes (require SUPER_ADMIN role)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/recipes` - Recipe moderation

## API Routes

### Public APIs
- `GET /api/recipes` - List recipes (with filters)
- `GET /api/recipes/[id]` - Get recipe details

### Protected APIs (require authentication)
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites?recipeId=...` - Remove favorite
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Admin APIs (require SUPER_ADMIN role)
- `GET /api/admin/users` - List users
- `PUT /api/admin/users` - Update user role
- `GET /api/admin/recipes` - List all recipes (with filters)
- `PATCH /api/admin/recipes` - Update recipe status
- `DELETE /api/admin/recipes?recipeId=...` - Delete recipe

## Code Organization Best Practices

### 1. Utilities (`lib/`)
- **Never** put utilities in `app/utils/` - use `lib/` instead
- `lib/auth.ts` - Authentication configuration
- `lib/db.ts` - Database client
- `lib/auth-helpers.ts` - Authentication middleware helpers

### 2. Types (`lib/types/`)
- Centralized TypeScript type definitions
- Shared enums (Category, RecipeStatus, UserRole)
- Interface definitions (User, Recipe)

### 3. Constants (`lib/constants/`)
- Route constants in `lib/constants/routes.ts`
- Use constants instead of hardcoding route paths
- Helper functions for dynamic routes

### 4. Server Actions (`app/actions/`)
- All server actions in `app/actions/` directory
- Group by feature (e.g., `auth.ts`, `recipes.ts`)

### 5. Route Groups
- `(auth)` - Authentication-related routes
- `(mainlayout)` - Routes with main layout (navbar/footer)

## Naming Conventions

### Routes
- Use **plural** for resource routes: `/recipes`, `/users`
- Use **RESTful** conventions: `/recipes/[id]`, `/recipes/new`, `/recipes/[id]/edit`
- Use **kebab-case** for multi-word routes: `/my-recipes`, `/create-recipe`

### Files
- **Components**: PascalCase (e.g., `UserDropdown.tsx`)
- **Utilities**: camelCase (e.g., `auth-helpers.ts`)
- **Constants**: camelCase (e.g., `routes.ts`)

### API Endpoints
- Use RESTful HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Use consistent naming: `/api/resource` (plural)

## Import Patterns

```typescript
// ❌ Bad - Old structure
import { auth } from "@/app/utils/auth";
import prisma from "@/app/utils/db";

// ✅ Good - New structure
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/auth-helpers";
import { ROUTES } from "@/lib/constants/routes";
import { Category, Recipe } from "@/lib/types";
```

## Migration Notes

### From `app/utils/` to `lib/`
- `app/utils/auth.ts` → `lib/auth.ts`
- `app/utils/db.ts` → `lib/db.ts`
- `app/utils/requireUser.ts` → `lib/auth-helpers.ts` (as `requireUser`)
- `app/utils/requireAdmin.ts` → `lib/auth-helpers.ts` (as `requireAdmin`)

### Route Constants
Use route constants instead of hardcoding paths:
```typescript
// ❌ Bad
router.push(`/recipe/${id}`);

// ✅ Good
import { ROUTES } from "@/lib/constants/routes";
router.push(ROUTES.RECIPES.DETAIL(id));
```

## Component Organization

### Structure
```
components/
├── form/          # Form-specific components
├── general/       # Reusable general components
│   ├── navbar/   # Navigation components (consolidated)
│   └── ...       # Other general components
└── ui/           # UI primitives (shadcn/ui)
```

### Component Guidelines
- Group related components in subdirectories
- Use index files for cleaner imports when appropriate
- Keep components focused and reusable

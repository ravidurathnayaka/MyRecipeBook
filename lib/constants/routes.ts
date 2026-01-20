/**
 * Application route constants
 * Use these constants for navigation to ensure consistency
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  FAVORITES: "/favorites",
  
  // Recipe routes
  RECIPES: {
    BASE: "/recipes",
    LIST: "/recipes",
    ME: "/recipes/me", // User's own recipes
    NEW: "/recipes/new",
    DETAIL: (id: string) => `/recipes/${id}`,
    EDIT: (id: string) => `/recipes/${id}/edit`,
  },
  
  // Admin routes
  ADMIN: {
    BASE: "/admin",
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    RECIPES: "/admin/recipes",
  },
} as const;

/**
 * Helper function to get recipe detail URL
 */
export function getRecipeUrl(id: string): string {
  return ROUTES.RECIPES.DETAIL(id);
}

/**
 * Helper function to get recipe edit URL
 */
export function getRecipeEditUrl(id: string): string {
  return ROUTES.RECIPES.EDIT(id);
}

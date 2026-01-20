// Pagination constants
export const RECIPES_PER_PAGE = 6;
export const ADMIN_ITEMS_PER_PAGE = 10;

// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  FAVORITES: "/favorites",
  MY_RECIPES: "/recipes/me",
  RECIPES: {
    BASE: "/recipes",
    NEW: "/recipes/new",
    DETAIL: (id: string) => `/recipes/${id}`,
    EDIT: (id: string) => `/recipes/${id}/edit`,
  },
  ADMIN: {
    BASE: "/admin",
    USERS: "/admin/users",
    RECIPES: "/admin/recipes",
  },
} as const;

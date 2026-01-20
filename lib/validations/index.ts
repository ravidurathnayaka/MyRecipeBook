import { z } from "zod";

// Recipe validation schemas
export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  makeTime: z.number().int().positive().max(1440).optional().nullable(), // Max 24 hours in minutes
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "At least one ingredient is required").max(50, "Maximum 50 ingredients"),
  steps: z.array(z.string().min(1, "Step cannot be empty")).min(1, "At least one step is required").max(100, "Maximum 100 steps"),
  tips: z.string().max(1000).optional().nullable(),
  category: z.enum(["BREAKFAST", "LUNCH", "DINNER", "DESSERT", "SNACK"]),
  imageUrl: z.string().url("Invalid image URL").max(500).optional().nullable(),
  authorId: z.string().min(1, "Author ID is required"),
});

export const updateRecipeSchema = createRecipeSchema.partial().extend({
  authorId: z.string().min(1).optional(),
});

export const recipeStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

// User validation schemas
export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["USER", "SUPER_ADMIN"]),
});

export const updateUserProfileSchema = z.object({
  name: z.string().max(100, "Name must be less than 100 characters").nullable().optional(),
  image: z.string().url("Invalid image URL").max(500).nullable().optional(),
});

// Favorite validation schemas
export const favoriteRecipeSchema = z.object({
  recipeId: z.string().uuid("Invalid recipe ID"),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const recipeQuerySchema = paginationSchema.extend({
  category: z.enum(["BREAKFAST", "LUNCH", "DINNER", "DESSERT", "SNACK"]).optional(),
  authorId: z.string().optional(),
  search: z.string().max(200).optional(),
  status: recipeStatusSchema.optional(),
});

export const userQuerySchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  role: z.enum(["USER", "SUPER_ADMIN"]).optional(),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const recipeIdParamSchema = z.object({
  recipeId: z.string().uuid("Invalid recipe ID format"),
});

// Type exports
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type FavoriteRecipeInput = z.infer<typeof favoriteRecipeSchema>;
export type RecipeQueryInput = z.infer<typeof recipeQuerySchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;

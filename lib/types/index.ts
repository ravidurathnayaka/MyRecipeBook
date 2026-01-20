// Recipe types
export enum Category {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

export enum RecipeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum UserRole {
  USER = "USER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    recipes?: number;
  };
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  makeTime?: number | null;
  ingredients: string[];
  steps: string[];
  tips?: string | null;
  category: Category;
  imageUrl?: string | null;
  status?: RecipeStatus;
  author?: User | null;
  authorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware to validate request body with Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> => {
    try {
      const body = await req.json();
      const data = schema.parse(body);
      return { success: true, data };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          response: NextResponse.json(
            {
              message: "Validation failed",
              errors: error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }
      return {
        success: false,
        response: NextResponse.json(
          { message: "Invalid request body" },
          { status: 400 }
        ),
      };
    }
  };
}

/**
 * Middleware to validate query parameters with Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: NextRequest): { success: true; data: T } | { success: false; response: NextResponse } => {
    try {
      const searchParams: Record<string, string> = {};
      req.nextUrl.searchParams.forEach((value, key) => {
        // Only add non-empty values to avoid validation issues
        if (value && value.trim()) {
          searchParams[key] = value;
        }
      });
      const data = schema.parse(searchParams);
      return { success: true, data };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          response: NextResponse.json(
            {
              message: "Invalid query parameters",
              errors: error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }
      return {
        success: false,
        response: NextResponse.json(
          { message: "Invalid query parameters" },
          { status: 400 }
        ),
      };
    }
  };
}

/**
 * Middleware to validate route parameters with Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return async (params: Promise<Record<string, string>>): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> => {
    try {
      const resolvedParams = await params;
      const data = schema.parse(resolvedParams);
      return { success: true, data };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          response: NextResponse.json(
            {
              message: "Invalid route parameters",
              errors: error.errors.map((err) => ({
                path: err.path.join("."),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }
      return {
        success: false,
        response: NextResponse.json(
          { message: "Invalid route parameters" },
          { status: 400 }
        ),
      };
    }
  };
}

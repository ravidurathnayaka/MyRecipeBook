"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Upload,
  Save,
  ArrowLeft,
  Trash2,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

export enum Category {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

export interface RecipeFormData {
  title: string;
  description: string;
  makeTime: string;
  ingredients: string[];
  steps: string[];
  tips: string;
  category: Category;
  imageUrl: string;
}

interface RecipeFormProps {
  mode: "create" | "edit";
  initialData?: RecipeFormData | null;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onCancel: () => void;
  headerTitle: string;
  headerDescription: string;
  submitLabel: string;
  submittingLabel: string;
}

const DEFAULT_FORM_DATA: RecipeFormData = {
  title: "",
  description: "",
  makeTime: "",
  ingredients: [""],
  steps: [""],
  tips: "",
  category: Category.DINNER,
  imageUrl: "",
};

function getCategoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    [Category.BREAKFAST]:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    [Category.LUNCH]:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    [Category.DINNER]:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    [Category.DESSERT]:
      "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    [Category.SNACK]:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };
  return colors[category];
}

export function RecipeForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  headerTitle,
  headerDescription,
  submitLabel,
  submittingLabel,
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploadThingUrl = (url: string) => {
    try {
      const host = new URL(url).hostname;
      return host === "utfs.io" || host.endsWith(".ufs.sh");
    } catch {
      return false;
    }
  };

  const handleRemoveImage = async () => {
    const url = formData.imageUrl;
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
    if (!url || !isUploadThingUrl(url)) return;
    setIsRemovingImage(true);
    try {
      const res = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete image");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove image from storage");
    } finally {
      setIsRemovingImage(false);
    }
  };

  const { startUpload, isUploading } = useUploadThing("recipeImage", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        setImagePreview(url);
        toast.success("Image uploaded successfully");
      }
    },
    onUploadError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    } else if (mode === "create") {
      setFormData(DEFAULT_FORM_DATA);
      setImagePreview("");
    }
  }, [initialData, mode]);

  const updateField = (field: keyof RecipeFormData, value: RecipeFormData[keyof RecipeFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (formData.makeTime && isNaN(Number(formData.makeTime))) {
      newErrors.makeTime = "Must be a valid number";
    }

    const validIngredients = formData.ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    const validSteps = formData.steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      newErrors.steps = "At least one step is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: "" }));
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : "Something went wrong",
      }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">
              {headerTitle}
            </h1>
            <p className="text-muted-foreground">{headerDescription}</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-3 transition-colors hover:bg-secondary disabled:opacity-50"
            disabled={isSubmitting}
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-6 rounded-lg border-2 border-destructive/20 bg-destructive/10 p-4 dark:bg-destructive/20">
            <p className="font-medium text-destructive">{errors.submit}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Homemade Margherita Pizza"
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background transition-colors focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.title ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your recipe in a few sentences..."
                  rows={3}
                  disabled={isSubmitting}
                  className={`w-full resize-none rounded-lg border-2 px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background transition-colors focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.description ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Category).map((cat) => (
                      <Badge
                        key={cat}
                        className={`cursor-pointer border-2 transition-all ${
                          isSubmitting ? "cursor-not-allowed opacity-50" : ""
                        } ${
                          formData.category === cat
                            ? getCategoryColor(cat)
                            : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                        onClick={() =>
                          !isSubmitting && updateField("category", cat)
                        }
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.makeTime}
                    onChange={(e) => updateField("makeTime", e.target.value)}
                    placeholder="30"
                    min="0"
                    disabled={isSubmitting}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background transition-colors focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.makeTime ? "border-destructive" : "border-input"
                    }`}
                  />
                  {errors.makeTime && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.makeTime}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Image URL
                </label>
                <div className="flex items-stretch gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        startUpload([file]);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 shrink-0 !px-4 rounded-lg border-2 border-input min-w-[100px]"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4 shrink-0" />
                        Upload
                      </>
                    )}
                  </Button>
                  <div className="relative flex-1 min-w-0">
                    <Upload className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground shrink-0" />
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
                      className="h-12 w-full rounded-lg border-2 border-input py-3 pr-4 pl-11 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="relative mt-4 inline-block w-full">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting || isRemovingImage}
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-destructive/90 text-white shadow-md transition-colors hover:bg-destructive disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Remove image"
                    >
                      {isRemovingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full rounded-lg object-cover"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg border-2 border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="rounded-lg p-3 text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={formData.ingredients.length === 1 || isSubmitting}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {errors.ingredients && (
                <p className="text-sm text-destructive">{errors.ingredients}</p>
              )}
              <button
                type="button"
                onClick={addIngredient}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                Add Ingredient
              </button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1} instructions...`}
                    rows={2}
                    disabled={isSubmitting}
                    className="flex-1 resize-none rounded-lg border-2 border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="self-start rounded-lg p-3 text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={formData.steps.length === 1 || isSubmitting}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {errors.steps && (
                <p className="text-sm text-destructive">{errors.steps}</p>
              )}
              <button
                type="button"
                onClick={addStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                Add Step
              </button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Pro Tips (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.tips}
                onChange={(e) => updateField("tips", e.target.value)}
                placeholder="Share your expert tips and tricks for making this recipe perfect..."
                rows={4}
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border-2 border-input px-4 py-3 text-foreground placeholder:text-muted-foreground bg-background focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground shadow-md transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-8 py-3 font-semibold shadow-md transition-colors hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {submittingLabel}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

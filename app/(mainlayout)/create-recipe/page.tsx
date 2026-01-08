"use client";

import React, { useState } from "react";
import { Plus, X, Upload, Save, ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Prisma enums and types
enum Category {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  DESSERT = "DESSERT",
  SNACK = "SNACK",
}

interface RecipeFormData {
  title: string;
  description: string;
  makeTime: string;
  ingredients: string[];
  steps: string[];
  tips: string;
  category: Category;
  imageUrl: string;
}

interface RecipeCreatePageProps {
  onSubmit?: (data: RecipeFormData) => void;
  onCancel?: () => void;
}

const RecipeCreatePage: React.FC<RecipeCreatePageProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    makeTime: "",
    ingredients: [""],
    steps: [""],
    tips: "",
    category: Category.DINNER,
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");

  const updateField = (field: keyof RecipeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, steps: newSteps }));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Filter out empty ingredients and steps
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter((i) => i.trim()),
        steps: formData.steps.filter((s) => s.trim()),
      };

      if (onSubmit) {
        onSubmit(cleanedData);
      } else {
        console.log("Recipe submitted:", cleanedData);
        alert("Recipe created successfully! (This is a demo)");
      }
    }
  };

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      [Category.BREAKFAST]: "bg-amber-100 text-amber-800 border-amber-300",
      [Category.LUNCH]: "bg-emerald-100 text-emerald-800 border-emerald-300",
      [Category.DINNER]: "bg-blue-100 text-blue-800 border-blue-300",
      [Category.DESSERT]: "bg-pink-100 text-pink-800 border-pink-300",
      [Category.SNACK]: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[category];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Create New Recipe
            </h1>
            <p className="text-slate-600">
              Share your culinary masterpiece with the world
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-3 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g., Homemade Margherita Pizza"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your recipe in a few sentences..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.description ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Category and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(Category).map((cat) => (
                      <Badge
                        key={cat}
                        className={`cursor-pointer border-2 transition-all ${
                          formData.category === cat
                            ? getCategoryColor(cat)
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => updateField("category", cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.makeTime}
                    onChange={(e) => updateField("makeTime", e.target.value)}
                    placeholder="30"
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.makeTime ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {errors.makeTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.makeTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="shadow-lg border-0">
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
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={formData.ingredients.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {errors.ingredients && (
                <p className="text-sm text-red-600">{errors.ingredients}</p>
              )}
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Ingredient
              </button>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold mt-2">
                    {index + 1}
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1} instructions...`}
                    rows={2}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                    disabled={formData.steps.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {errors.steps && (
                <p className="text-sm text-red-600">{errors.steps}</p>
              )}
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Step
              </button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Pro Tips (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.tips}
                onChange={(e) => updateField("tips", e.target.value)}
                placeholder="Share your expert tips and tricks for making this recipe perfect..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-slate-700 bg-white hover:bg-slate-50 rounded-lg font-semibold transition-colors shadow-md"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
            >
              <Save className="w-5 h-5" />
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeCreatePage;

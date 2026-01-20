"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShoppingListButtonProps {
  ingredients: string[];
  recipeTitle: string;
}

export function ShoppingListButton({
  ingredients,
  recipeTitle,
}: ShoppingListButtonProps) {
  const [open, setOpen] = useState(false);
  const [listItems, setListItems] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    const initial = new Map();
    ingredients.forEach((_, index) => {
      initial.set(index, false);
    });
    setListItems(initial);
  }, [ingredients]);

  const toggleItem = (index: number) => {
    setListItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, !prev.get(index));
      return newMap;
    });
  };

  const printList = () => {
    const printContent = `
      <html>
        <head>
          <title>Shopping List - ${recipeTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; }
            li.checked { text-decoration: line-through; color: #999; }
          </style>
        </head>
        <body>
          <h1>Shopping List: ${recipeTitle}</h1>
          <ul>
            ${ingredients
              .map(
                (ing, idx) =>
                  `<li class="${listItems.get(idx) ? "checked" : ""}">${
                    listItems.get(idx) ? "✓" : "☐"
                  } ${ing}</li>`
              )
              .join("")}
          </ul>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        Shopping List
      </Button>
    );
  }

  return (
    <Card className="fixed inset-x-4 top-20 z-50 max-h-[80vh] overflow-y-auto shadow-2xl md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shopping List: {recipeTitle}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={printList}>
              <Download className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {ingredients.map((ingredient, index) => {
            const checked = listItems.get(index) || false;
            return (
              <li
                key={index}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  checked
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                onClick={() => toggleItem(index)}
              >
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    checked
                      ? "bg-emerald-600 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-500"
                      : "border-border"
                  }`}
                >
                  {checked && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`flex-1 ${checked ? "line-through" : ""}`}>
                  {ingredient}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Download, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShoppingListButtonProps {
  ingredients: string[];
  recipeTitle: string;
  /** When true, renders as icon-only for use as a floating action button */
  fab?: boolean;
}

export function ShoppingListButton({
  ingredients,
  recipeTitle,
  fab = false,
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const checkedCount = Array.from(listItems.values()).filter(Boolean).length;
  const totalCount = ingredients.length;

  const toggleItem = (index: number) => {
    setListItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, !prev.get(index));
      return newMap;
    });
  };

  const allSelected = totalCount > 0 && checkedCount === totalCount;

  const toggleSelectAll = () => {
    if (allSelected) {
      setListItems((prev) => {
        const newMap = new Map(prev);
        ingredients.forEach((_, index) => newMap.set(index, false));
        return newMap;
      });
    } else {
      setListItems((prev) => {
        const newMap = new Map(prev);
        ingredients.forEach((_, index) => newMap.set(index, true));
        return newMap;
      });
    }
  };

  const printList = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Shopping List - ${recipeTitle.replace(/</g, "&lt;")}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 24px 20px 32px;
              color: #1a1a1a;
              font-size: 14px;
              line-height: 1.5;
            }
            @media print {
              body { padding: 16px 12px 24px; }
              .page-break { page-break-after: always; }
            }
            .header {
              text-align: center;
              margin-bottom: 28px;
              padding-bottom: 20px;
              border-bottom: 2px dashed #cbd5e1;
            }
            .header h1 {
              margin: 0 0 4px;
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
            }
            .header .recipe {
              margin: 0;
              font-size: 15px;
              font-weight: 500;
              color: #475569;
            }
            .header .date {
              margin: 8px 0 0;
              font-size: 12px;
              color: #94a3b8;
            }
            .list { list-style: none; margin: 0; padding: 0; }
            .item {
              display: flex;
              align-items: center;
              gap: 12px;
              min-height: 44px;
              padding: 12px 14px;
              margin-bottom: 2px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              background: #f8fafc;
              page-break-inside: avoid;
            }
            @media print {
              .item {
                border: 1px solid #cbd5e1;
                background: #fff;
                box-shadow: none;
                margin-bottom: 0;
                border-radius: 6px;
                min-height: 40px;
                padding: 10px 12px;
              }
              .item + .item { margin-top: 6px; }
            }
            .item .checkbox {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
              border: 2px solid #64748b;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              color: #0f172a;
            }
            .item.checked .checkbox {
              border-color: #059669;
              background: #059669;
              color: #fff;
            }
            .item.checked .ingredient { text-decoration: line-through; color: #64748b; }
            .item .ingredient {
              flex: 1;
              font-size: 15px;
              font-weight: 500;
              color: #1e293b;
            }
            .cut-hint {
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px dashed #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Shopping List</h1>
            <p class="recipe">${recipeTitle.replace(/</g, "&lt;")}</p>
            <p class="date">${dateStr}</p>
          </div>
          <ul class="list">
            ${ingredients
              .map((ing, index) => ({ ing, index }))
              .filter(({ index }) => listItems.get(index))
              .map(({ ing }) => {
                const safeIng = (ing || "")
                  .replace(/</g, "&lt;")
                  .replace(/&/g, "&amp;");
                return `<li class="item">
                    <span class="checkbox"> </span>
                    <span class="ingredient">${safeIng}</span>
                  </li>`;
              })
              .join("")}
          </ul>
          <p class="cut-hint">Cut along the lines to separate items • Check off as you shop</p>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  if (!open) {
    return (
      <Button
        variant="default"
        size={fab ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        className={
          fab
            ? "h-14 w-14 shrink-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg transition-all hover:scale-105 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl"
            : "shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-700 !px-4 whitespace-nowrap text-white shadow-md transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
        }
        aria-label="Open shopping list"
      >
        <ShoppingCart
          className={fab ? "h-6 w-6 shrink-0" : "mr-2 h-4 w-4 shrink-0"}
        />
        {!fab && "Shopping List"}
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="no-print animate-in fade-in fixed inset-0 z-40 bg-black/50 backdrop-blur-sm duration-200"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Modal - modern card */}
      <div
        className="no-print animate-in zoom-in-95 slide-in-from-bottom-4 border-border bg-card fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shopping-list-title"
      >
        {/* Header */}
        <div className="border-border bg-muted/30 shrink-0 border-b px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="shopping-list-title"
                  className="text-foreground text-lg font-semibold"
                >
                  Shopping List
                </h2>
                <p className="text-muted-foreground truncate text-sm">
                  {recipeTitle}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 shrink-0 rounded-full"
              aria-label="Close shopping list"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress + Print */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${totalCount ? (checkedCount / totalCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-muted-foreground text-xs font-medium">
                {checkedCount}/{totalCount} done
              </span>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={printList}
              className="h-9 gap-2 rounded-lg px-4 text-sm font-medium shadow-sm"
            >
              <Download className="h-4 w-4 shrink-0" />
              Print List
            </Button>
          </div>

          {/* Select All / Clear toggle */}
          {ingredients.length > 0 && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className={
                  allSelected
                    ? "border-border bg-muted/50 text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-8 gap-2 rounded-xl border px-3.5 text-xs font-medium shadow-sm transition-all duration-200"
                    : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary h-8 gap-2 rounded-xl border px-3.5 text-xs font-medium shadow-sm transition-all duration-200"
                }
              >
                {allSelected ? (
                  <>
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    Clear
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {ingredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <ShoppingCart className="text-muted-foreground h-7 w-7" />
              </div>
              <p className="text-foreground text-sm font-medium">
                No ingredients yet
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Add ingredients to your recipe to see them here.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {ingredients.map((ingredient, index) => {
                const checked = listItems.get(index) || false;
                return (
                  <li
                    key={index}
                    className={`group focus-within:ring-primary focus-within:ring-offset-card flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 ${
                      checked
                        ? "bg-primary/5 border-primary/10"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => toggleItem(index)}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleItem(index);
                      }
                    }}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 group-hover:border-primary/50"
                      }`}
                    >
                      {checked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`flex-1 text-sm leading-snug transition-all duration-200 ${
                        checked
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {ingredient}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

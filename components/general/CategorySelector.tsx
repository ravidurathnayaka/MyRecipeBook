import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategorySelector() {
  return (
    <Select>
      <SelectTrigger className="w-[200px] ">
        <SelectValue placeholder="Select a recipe category" />
      </SelectTrigger>
      <SelectContent className="text-xl">
        <SelectGroup>
          <SelectLabel>Categories</SelectLabel>
          <SelectItem value="BREAKFAST">Breakfast</SelectItem>
          <SelectItem value="LUNCH">Launch</SelectItem>
          <SelectItem value="DINNER">Dinner</SelectItem>
          <SelectItem value="DESSERT"> Dessert</SelectItem>
          <SelectItem value="SNACK"> Snack</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Search() {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="recipe" placeholder="Search recipe by name" />
      <Button type="submit" variant="outline">
        Search
      </Button>
    </div>
  );
}

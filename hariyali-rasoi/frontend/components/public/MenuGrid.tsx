import type { MenuItem } from "@/lib/api/types";
import { MenuCard } from "./MenuCard";
import { EmptyState } from "@/components/ui/empty-state";

interface MenuGridProps {
  items: MenuItem[];
}

export function MenuGrid({ items }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        motif="pot"
        title="No dishes here yet"
        description="Try a different category or search term. Our kitchen may still be plating up — check back soon."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
          <MenuCard item={item} />
        </div>
      ))}
    </div>
  );
}

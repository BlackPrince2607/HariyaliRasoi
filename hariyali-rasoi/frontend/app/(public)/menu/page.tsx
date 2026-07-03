"use client";

import { useEffect, useState } from "react";
import { getMenuItems, getCategories } from "@/lib/api/menu";
import type { MenuItem, Category } from "@/lib/api/types";
import { MenuFilters } from "@/components/public/MenuFilters";
import { MenuGrid } from "@/components/public/MenuGrid";
import { SectionHeader } from "@/components/public/SectionHeader";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiDisplayUrl } from "@/lib/api/base-url";
import { useMenuPageStore } from "@/store/menuPageStore";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const activeCategory = useMenuPageStore((s) => s.activeCategory);
  const setStoreCategories = useMenuPageStore((s) => s.setCategories);
  const resetMenuPage = useMenuPageStore((s) => s.reset);
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setStoreCategories(categories);
  }, [categories, setStoreCategories]);

  useEffect(() => {
    return () => resetMenuPage();
  }, [resetMenuPage]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string | boolean> = { is_available: true };
    if (activeCategory) params.category_id = activeCategory;
    if (vegOnly) params.is_veg = true;
    if (search) params.search = search;

    getMenuItems(params)
      .then(setItems)
      .catch(() => {
        setItems([]);
        setError(
          `Could not load the menu. Ensure the API is running at ${getApiDisplayUrl()} and reachable from this device.`
        );
      })
      .finally(() => setLoading(false));
  }, [activeCategory, vegOnly, search]);

  return (
    <div className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Full menu"
          title="Our menu"
          subtitle="121 homestyle dishes across breakfast, lunch, snacks & more — all 100% vegetarian."
          align="left"
        />

        <div className="mt-8">
          <MenuFilters
            vegOnly={vegOnly}
            onVegToggle={() => setVegOnly(!vegOnly)}
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <p className="mt-4 font-hand text-lg text-brand-muted">
          {loading ? "plating up…" : `${items.length} dish${items.length !== 1 ? "es" : ""} ready`}
        </p>

        <div className="mt-6">
          {loading ? (
            <SkeletonGrid count={8} />
          ) : error ? (
            <EmptyState motif="pot" title="Menu couldn't load" description={error} />
          ) : (
            <MenuGrid items={items} />
          )}
        </div>
      </div>
    </div>
  );
}

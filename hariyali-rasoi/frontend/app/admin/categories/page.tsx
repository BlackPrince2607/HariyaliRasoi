"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "@/lib/api/menu";
import type { Category } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const refresh = () => getCategories().then(setCategories).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createCategory({ name, display_order: categories.length + 1 });
      setName("");
      refresh();
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Categories</h1>
      <div className="mt-6 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
        <Button onClick={handleCreate}>Add</Button>
      </div>
      <div className="mt-6 space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]">
            <span className="font-medium text-brand-charcoal">{cat.name}</span>
            <Button size="sm" variant="destructive" onClick={async () => { await deleteCategory(cat.id); refresh(); }}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

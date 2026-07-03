"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMenuItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItem,
  toggleOutOfStock,
  toggleTodaysSpecial,
} from "@/lib/api/menu";
import type { MenuItem, Category } from "@/lib/api/types";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { MenuBulkImport } from "@/components/admin/MenuBulkImport";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/price";
import api from "@/lib/api/client";
import { toast } from "sonner";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const refresh = () => {
    getMenuItems({}).then(setItems).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [items, search]);

  const handleSave = async (data: Partial<MenuItem>) => {
    try {
      if (editing) {
        await updateMenuItem(editing.id, data);
        toast.success("Item updated");
      } else {
        await createMenuItem(data);
        toast.success("Item created");
      }
      setEditing(null);
      setCreating(false);
      refresh();
    } catch {
      toast.error("Failed to save item");
    }
  };

  const handleAddImage = async (itemId: string, url: string) => {
    try {
      await api.post(`/api/menu/${itemId}/images`, { url, is_primary: true });
      toast.success("Image added");
      refresh();
    } catch {
      toast.error("Failed to add image");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Menu Items</h1>
        <Button onClick={() => { setCreating(true); setEditing(null); }}>Add Item</Button>
      </div>

      <div className="mt-6">
        <MenuBulkImport onComplete={refresh} />
      </div>

      {(creating || editing) && (
        <div className="mt-6 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
          <MenuItemForm
            item={editing || undefined}
            categories={categories}
            onSubmit={handleSave}
            onCancel={() => { setCreating(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="mt-6">
        <Input
          placeholder="Search items by name, description, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="mt-2 text-sm text-brand-muted">
          {filteredItems.length} of {items.length} items
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-brand-charcoal">{item.name}</p>
              <p className="text-sm font-semibold text-brand-leaf">{formatPrice(Number(item.price))}</p>
              <p className="text-xs text-brand-muted">
                {item.category_id ? categoryMap[item.category_id] : "Uncategorized"} · {item.slug}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {!item.is_available && <Badge variant="warning">Hidden</Badge>}
                {item.is_out_of_stock && <Badge variant="destructive">Out of Stock</Badge>}
                {item.is_todays_special && <Badge>Today&apos;s Special</Badge>}
                {item.is_bestseller && <Badge variant="secondary">Bestseller</Badge>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ImageUploader onUpload={(url) => handleAddImage(item.id, url)} />
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setEditing(item); setCreating(false); }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await toggleMenuItem(item.id); refresh(); }}
              >
                {item.is_available ? "Hide" : "Show"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await toggleOutOfStock(item.id); refresh(); }}
              >
                {item.is_out_of_stock ? "In Stock" : "Out of Stock"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await toggleTodaysSpecial(item.id); refresh(); }}
              >
                {item.is_todays_special ? "Unspecial" : "Special"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (confirm(`Delete "${item.name}"?`)) {
                    await deleteMenuItem(item.id);
                    toast.success("Item deleted");
                    refresh();
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

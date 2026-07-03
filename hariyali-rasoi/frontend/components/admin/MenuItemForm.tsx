"use client";

import { useForm } from "react-hook-form";
import type { MenuItem, Category } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenuItemFormProps {
  item?: MenuItem;
  categories: Category[];
  onSubmit: (data: Partial<MenuItem>) => Promise<void>;
  onCancel: () => void;
}

export function MenuItemForm({ item, categories, onSubmit, onCancel }: MenuItemFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: item || {
      name: "",
      description: "",
      tags: [],
      price: 0,
      is_veg: true,
      is_available: true,
      is_out_of_stock: false,
      is_bestseller: false,
      is_new: false,
      is_todays_special: false,
      preparation_time: 30,
    },
  });

  const flags = [
    "is_veg",
    "is_available",
    "is_out_of_stock",
    "is_bestseller",
    "is_new",
    "is_todays_special",
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input {...register("name", { required: true })} className="mt-1" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} className="mt-1" />
      </div>
      <div>
        <Label>Tags (comma-separated)</Label>
        <Input
          className="mt-1"
          defaultValue={(item?.tags || []).join(", ")}
          onChange={(e) =>
            setValue(
              "tags",
              e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price (₹)</Label>
          <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="mt-1" />
        </div>
        <div>
          <Label>Original Price (₹)</Label>
          <Input type="number" step="0.01" {...register("original_price", { valueAsNumber: true })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <Select
          defaultValue={item?.category_id || ""}
          onValueChange={(v) => setValue("category_id", v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {flags.map((flag) => (
          <div key={flag} className="flex items-center justify-between rounded-xl border p-3">
            <Label>{flag.replace("is_", "").replace("_", " ")}</Label>
            <Switch checked={watch(flag)} onCheckedChange={(v) => setValue(flag, v)} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

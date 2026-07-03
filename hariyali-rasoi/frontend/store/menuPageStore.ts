import { create } from "zustand";
import type { Category } from "@/lib/api/types";

interface MenuPageStore {
  categories: Category[];
  activeCategory: string | null;
  setCategories: (categories: Category[]) => void;
  setActiveCategory: (id: string | null) => void;
  reset: () => void;
}

export const useMenuPageStore = create<MenuPageStore>((set) => ({
  categories: [],
  activeCategory: null,
  setCategories: (categories) => set({ categories }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  reset: () => set({ categories: [], activeCategory: null }),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  is_veg: boolean;
}

interface CartStore {
  items: CartItem[];
  coupon: { code: string; discount_amount: number } | null;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  applyCoupon: (c: CartStore["coupon"]) => void;
  removeCoupon: () => void;
  setDeliverySettings: (fee: number, threshold: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  subtotal: () => number;
  total: () => number;
}

function normalizeItem(item: CartItem): CartItem {
  return {
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryFee: 30,
      freeDeliveryThreshold: 300,

      addItem: (item) =>
        set((state) => {
          const normalized = normalizeItem(item);
          const existing = state.items.find((i) => i.id === normalized.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === normalized.id
                  ? { ...i, quantity: i.quantity + normalized.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, normalized] };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: Number(qty) } : i
                ),
        })),

      applyCoupon: (c) =>
        set({
          coupon: c
            ? { code: c.code, discount_amount: Number(c.discount_amount) }
            : null,
        }),

      removeCoupon: () => set({ coupon: null }),

      setDeliverySettings: (fee, threshold) =>
        set({
          deliveryFee: Number(fee),
          freeDeliveryThreshold: Number(threshold),
        }),

      clearCart: () => set({ items: [], coupon: null }),

      setItems: (items) => set({ items: items.map((i) => normalizeItem(i)) }),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        ),

      total: () => {
        const sub = get().subtotal();
        const discount = Number(get().coupon?.discount_amount ?? 0);
        const threshold = Number(get().freeDeliveryThreshold);
        const delivery = sub >= threshold ? 0 : Number(get().deliveryFee);
        return Math.max(0, sub - discount + delivery);
      },
    }),
    {
      name: "hariyali-cart",
      merge: (persisted, current) => {
        const p = persisted as Partial<CartStore> | undefined;
        return {
          ...current,
          ...p,
          items: (p?.items ?? []).map((i) => normalizeItem(i as CartItem)),
          deliveryFee: Number(p?.deliveryFee ?? current.deliveryFee),
          freeDeliveryThreshold: Number(
            p?.freeDeliveryThreshold ?? current.freeDeliveryThreshold
          ),
          coupon: p?.coupon
            ? {
                code: p.coupon.code,
                discount_amount: Number(p.coupon.discount_amount),
              }
            : null,
        };
      },
    }
  )
);

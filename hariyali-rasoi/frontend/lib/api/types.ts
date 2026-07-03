export interface MenuImage {
  id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  price: number;
  original_price?: number;
  is_veg: boolean;
  is_available: boolean;
  is_out_of_stock: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_todays_special: boolean;
  preparation_time: number;
  category_id?: string;
  display_order: number;
  created_at?: string;
  images: MenuImage[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  menu_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  order_notes?: string;
  payment_method: "cod" | "upi";
  payment_status: "pending" | "paid" | "failed";
  payment_screenshot_url?: string;
  status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  coupon_code?: string;
  created_at: string;
  items: OrderItem[];
}

export interface StoreSettings {
  id?: string;
  is_open: boolean;
  store_name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  google_maps_url?: string;
  opening_time?: string;
  closing_time?: string;
  lunch_start?: string;
  lunch_end?: string;
  dinner_start?: string;
  dinner_end?: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  min_order_amount: number;
  upi_id?: string;
  upi_qr_url?: string;
  closed_message: string;
  whatsapp_greeting?: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review: string;
  is_approved: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  alt?: string;
  album: "food" | "kitchen" | "events";
  display_order: number;
}

export interface CouponValidateResponse {
  valid: boolean;
  discount_amount: number;
  message: string;
}

export interface AnalyticsOverview {
  orders_today: number;
  revenue_today: number;
  pending_orders: number;
  total_items: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

export interface MenuImportResult {
  categories_created: number;
  categories_updated: number;
  items_created: number;
  items_updated: number;
  total_items: number;
}

export interface BhandaraInquiry {
  id: string;
  name: string;
  phone: string;
  event_date: string;
  guest_count: number;
  food_requirements?: string;
  budget?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface NgoInquiry {
  id: string;
  name: string;
  organization: string;
  phone: string;
  required_date: string;
  quantity_needed?: number;
  notes?: string;
  status: string;
  created_at: string;
}

export interface CateringInquiry {
  id: string;
  name: string;
  phone: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  budget?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface OrderCreatePayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  order_notes?: string;
  payment_method: "cod" | "upi";
  coupon_code?: string;
  items: { menu_item_id: string; quantity: number }[];
}

import api from "./client";
import type {
  StoreSettings,
  Review,
  Banner,
  Coupon,
  GalleryItem,
  CouponValidateResponse,
  AnalyticsOverview,
  RevenueDataPoint,
  TopItem,
  BhandaraInquiry,
  NgoInquiry,
  CateringInquiry,
} from "./types";

export async function getStoreSettings() {
  const { data } = await api.get<StoreSettings>("/api/store/settings");
  return data;
}

export async function updateStoreSettings(payload: Partial<StoreSettings>) {
  const { data } = await api.put<StoreSettings>("/api/store/settings", payload);
  return data;
}

export async function toggleStore() {
  const { data } = await api.patch<{ is_open: boolean }>("/api/store/toggle");
  return data;
}

export async function getBanners(activeOnly = true) {
  const { data } = await api.get<Banner[]>("/api/banners", { params: { active_only: activeOnly } });
  return data;
}

export async function createBanner(payload: Partial<Banner>) {
  const { data } = await api.post<Banner>("/api/banners", payload);
  return data;
}

export async function updateBanner(id: string, payload: Partial<Banner>) {
  const { data } = await api.put<Banner>(`/api/banners/${id}`, payload);
  return data;
}

export async function deleteBanner(id: string) {
  await api.delete(`/api/banners/${id}`);
}

export async function getReviews(approvedOnly = true) {
  const { data } = await api.get<Review[]>("/api/reviews", { params: { approved_only: approvedOnly } });
  return data;
}

export async function getAllReviews() {
  const { data } = await api.get<Review[]>("/api/reviews/admin");
  return data;
}

export async function createReview(payload: { customer_name: string; rating: number; review: string }) {
  const { data } = await api.post<Review>("/api/reviews", payload);
  return data;
}

export async function approveReview(id: string, is_approved: boolean) {
  const { data } = await api.patch<Review>(`/api/reviews/${id}/approve`, { is_approved });
  return data;
}

export async function deleteReview(id: string) {
  await api.delete(`/api/reviews/${id}`);
}

export async function getCoupons() {
  const { data } = await api.get<Coupon[]>("/api/coupons");
  return data;
}

export async function createCoupon(payload: Partial<Coupon>) {
  const { data } = await api.post<Coupon>("/api/coupons", payload);
  return data;
}

export async function updateCoupon(id: string, payload: Partial<Coupon>) {
  const { data } = await api.put<Coupon>(`/api/coupons/${id}`, payload);
  return data;
}

export async function deleteCoupon(id: string) {
  await api.delete(`/api/coupons/${id}`);
}

export async function validateCoupon(code: string, subtotal: number) {
  const { data } = await api.post<CouponValidateResponse>("/api/coupons/validate", { code, subtotal });
  return data;
}

export async function getGallery(album?: string) {
  const { data } = await api.get<GalleryItem[]>("/api/gallery", { params: album ? { album } : {} });
  return data;
}

export async function createGalleryItem(payload: Partial<GalleryItem>) {
  const { data } = await api.post<GalleryItem>("/api/gallery", payload);
  return data;
}

export async function deleteGalleryItem(id: string) {
  await api.delete(`/api/gallery/${id}`);
}

export async function uploadImage(file: File, bucket = "menu") {
  const form = new FormData();
  form.append("file", file);
  form.append("bucket", bucket);
  const { data } = await api.post<{ url: string }>("/api/upload/image", form);
  return data;
}

export async function getAnalyticsOverview() {
  const { data } = await api.get<AnalyticsOverview>("/api/analytics/overview");
  return data;
}

export async function getRevenueAnalytics() {
  const { data } = await api.get<RevenueDataPoint[]>("/api/analytics/revenue");
  return data;
}

export async function getTopItems() {
  const { data } = await api.get<TopItem[]>("/api/analytics/top-items");
  return data;
}

export async function getCouponUsage() {
  const { data } = await api.get("/api/analytics/coupon-usage");
  return data;
}

export async function submitBhandaraRequest(payload: Record<string, unknown>) {
  const { data } = await api.post("/api/inquiries/bhandara", payload);
  return data;
}

export async function submitNgoRequest(payload: Record<string, unknown>) {
  const { data } = await api.post("/api/inquiries/ngo", payload);
  return data;
}

export async function submitCateringRequest(payload: Record<string, unknown>) {
  const { data } = await api.post("/api/inquiries/catering", payload);
  return data;
}

export async function getBhandaraRequests() {
  const { data } = await api.get<BhandaraInquiry[]>("/api/inquiries/bhandara");
  return data;
}

export async function getNgoRequests() {
  const { data } = await api.get<NgoInquiry[]>("/api/inquiries/ngo");
  return data;
}

export async function getCateringRequests() {
  const { data } = await api.get<CateringInquiry[]>("/api/inquiries/catering");
  return data;
}

export async function updateBhandaraInquiry(
  id: string,
  payload: { status: string; notes?: string }
) {
  const { data } = await api.patch<BhandaraInquiry>(`/api/inquiries/bhandara/${id}`, payload);
  return data;
}

export async function updateNgoInquiry(id: string, payload: { status: string }) {
  const { data } = await api.patch<NgoInquiry>(`/api/inquiries/ngo/${id}`, payload);
  return data;
}

export async function updateCateringInquiry(id: string, payload: { status: string }) {
  const { data } = await api.patch<CateringInquiry>(`/api/inquiries/catering/${id}`, payload);
  return data;
}

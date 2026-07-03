import api from "./client";
import type { Order, OrderCreatePayload } from "./types";

export async function createOrder(payload: OrderCreatePayload) {
  const { data } = await api.post<Order>("/api/orders", payload);
  return data;
}

export async function getOrders(status?: string) {
  const { data } = await api.get<Order[]>("/api/orders", { params: status ? { status } : {} });
  return data;
}

export async function getOrder(id: string) {
  const { data } = await api.get<Order>(`/api/orders/${id}`);
  return data;
}

export async function lookupOrder(orderNumber: string, phone: string) {
  const { data } = await api.get<Order>("/api/orders/lookup", {
    params: { order_number: orderNumber, phone },
  });
  return data;
}

export async function updateOrderStatus(id: string, status: string) {
  const { data } = await api.patch<Order>(`/api/orders/${id}/status`, { status });
  return data;
}

export async function verifyPayment(id: string, payment_status = "paid") {
  const { data } = await api.patch<Order>(`/api/orders/${id}/verify-payment`, { payment_status });
  return data;
}

export async function uploadPaymentScreenshot(orderId: string, phone: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string }>(
    `/api/orders/${orderId}/upload-screenshot`,
    form,
    { params: { phone } }
  );
  return data;
}

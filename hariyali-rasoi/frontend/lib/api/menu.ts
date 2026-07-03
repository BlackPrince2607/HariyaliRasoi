import api from "./client";
import type { MenuItem, Category, MenuImportResult } from "./types";

export async function getMenuItems(params?: Record<string, string | boolean>) {
  const { data } = await api.get<MenuItem[]>("/api/menu", { params });
  return data;
}

export async function getMenuItem(id: string) {
  const { data } = await api.get<MenuItem>(`/api/menu/${id}`);
  return data;
}

export async function createMenuItem(payload: Partial<MenuItem>) {
  const { data } = await api.post<MenuItem>("/api/menu", payload);
  return data;
}

export async function updateMenuItem(id: string, payload: Partial<MenuItem>) {
  const { data } = await api.put<MenuItem>(`/api/menu/${id}`, payload);
  return data;
}

export async function deleteMenuItem(id: string) {
  await api.delete(`/api/menu/${id}`);
}

export async function toggleMenuItem(id: string) {
  const { data } = await api.patch<MenuItem>(`/api/menu/${id}/toggle`);
  return data;
}

export async function toggleOutOfStock(id: string) {
  const { data } = await api.patch<MenuItem>(`/api/menu/${id}/out-of-stock`);
  return data;
}

export async function toggleTodaysSpecial(id: string) {
  const { data } = await api.patch<MenuItem>(`/api/menu/${id}/todays-special`);
  return data;
}

export async function importDefaultMenuSeed(replaceExisting = false) {
  const { data } = await api.post<MenuImportResult>("/api/menu/import/seed", {
    replace_existing: replaceExisting,
  });
  return data;
}

export async function importMenuFile(file: File, replaceExisting = false) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<MenuImportResult>(
    `/api/menu/import?replace_existing=${replaceExisting}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function getCategories() {
  const { data } = await api.get<Category[]>("/api/categories");
  return data;
}

export async function createCategory(payload: Partial<Category>) {
  const { data } = await api.post<Category>("/api/categories", payload);
  return data;
}

export async function updateCategory(id: string, payload: Partial<Category>) {
  const { data } = await api.put<Category>(`/api/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/api/categories/${id}`);
}

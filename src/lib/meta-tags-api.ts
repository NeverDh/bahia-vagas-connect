/**
 * Meta tags SEO — público + admin (NestJS).
 */

import api from "@/services/api";

export type MetaTagRow = {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  keywords: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SaveMetaTagPayload = {
  page_path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  keywords: string | null;
};

export async function fetchMetaTagsForPath(
  pagePath: string,
): Promise<MetaTagRow | null> {
  const q = new URLSearchParams({ path: pagePath });
  return api.get<MetaTagRow | null>(`/api/meta-tags?${q.toString()}`);
}

export async function fetchAdminMetaTags(): Promise<MetaTagRow[]> {
  return api.get<MetaTagRow[]>("/api/admin/meta-tags");
}

export async function createAdminMetaTag(
  payload: SaveMetaTagPayload,
): Promise<MetaTagRow> {
  return api.post<MetaTagRow>("/api/admin/meta-tags", payload);
}

export async function updateAdminMetaTag(
  id: string,
  payload: SaveMetaTagPayload,
): Promise<MetaTagRow> {
  return api.patch<MetaTagRow>(`/api/admin/meta-tags/${id}`, payload);
}

export async function deleteAdminMetaTag(id: string): Promise<void> {
  await api.delete(`/api/admin/meta-tags/${id}`);
}

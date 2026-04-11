/**
 * Blog — painel admin (NestJS).
 */

import api from "@/services/api";

export type AdminBlogRow = {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: string;
  views: number;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

export type BlogPostPayload = {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string;
  category: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  status: string;
  published_at: string | null;
};

export async function fetchAdminBlogPosts(): Promise<AdminBlogRow[]> {
  return api.get<AdminBlogRow[]>("/api/admin/blog/posts");
}

export async function fetchAdminBlogPost(
  id: string,
): Promise<Record<string, unknown>> {
  return api.get(`/api/admin/blog/posts/${id}`);
}

export async function createBlogPost(
  payload: BlogPostPayload,
): Promise<Record<string, unknown>> {
  return api.post("/api/admin/blog/posts", payload);
}

export async function updateBlogPost(
  id: string,
  payload: BlogPostPayload,
): Promise<Record<string, unknown>> {
  return api.patch(`/api/admin/blog/posts/${id}`, payload);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await api.delete(`/api/admin/blog/posts/${id}`);
}

export async function uploadAdminBlogImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  const res = await api.postFormData<{ url: string }>(
    "/api/admin/blog/upload-image",
    fd,
  );
  return res.url;
}

/**
 * Blog público (NestJS).
 */

import api from "@/services/api";

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
};

export type BlogPostDetail = BlogListItem & {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  views: number;
};

export async function fetchPublishedBlogPosts(): Promise<BlogListItem[]> {
  return api.get<BlogListItem[]>("/api/blog");
}

export async function fetchBlogPostBySlug(
  slug: string,
): Promise<BlogPostDetail> {
  return api.get<BlogPostDetail>(`/api/blog/${encodeURIComponent(slug)}`);
}

export async function recordBlogPostView(slug: string): Promise<void> {
  await api.post(`/api/blog/${encodeURIComponent(slug)}/view`);
}

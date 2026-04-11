/**
 * Tipos e helpers para GET /api/jobs (NestJS).
 */

import api from "@/services/api";

export type JobsListResponse = {
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type JobCarouselPayload = {
  recent: {
    id: string;
    title: string;
    location: string;
    company_name: string | null;
  }[];
  popular: {
    id: string;
    title: string;
    location: string;
    company_name: string | null;
  }[];
};

export type AppliedJobIdsResponse = { jobIds: string[] };

export function buildJobsListQuery(params: {
  page: number;
  limit: number;
  search?: string;
  remoteOnly?: boolean;
  contractTypes?: string[];
  experienceLevels?: string[];
  location?: string;
  sortOrder?: "newest" | "oldest";
  titleKeywords?: string[];
}): string {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("limit", String(params.limit));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.remoteOnly) q.set("remote_only", "true");
  if (params.contractTypes?.length)
    q.set("contract_types", params.contractTypes.join(","));
  if (params.experienceLevels?.length)
    q.set("experience_levels", params.experienceLevels.join(","));
  if (params.location?.trim()) q.set("location", params.location.trim());
  q.set("sort", params.sortOrder === "oldest" ? "oldest" : "newest");
  if (params.titleKeywords?.length)
    q.set("title_keywords", params.titleKeywords.join(","));
  return `/api/jobs?${q.toString()}`;
}

export async function fetchJobsList(
  params: Parameters<typeof buildJobsListQuery>[0],
): Promise<JobsListResponse> {
  return api.get<JobsListResponse>(buildJobsListQuery(params));
}

export async function fetchAppliedJobIds(): Promise<string[]> {
  const res = await api.get<AppliedJobIdsResponse>(
    "/api/jobs/candidate/applied-ids",
  );
  return res.jobIds ?? [];
}

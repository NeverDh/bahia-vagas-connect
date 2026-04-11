/**
 * Tipos e helpers para painel da empresa (NestJS): /api/companies/me, /api/companies/me/jobs.
 */

import api, { type PaginatedResponse } from "@/services/api";

export type CompanyMe = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
  cnpj: string | null;
  is_freelancer: boolean;
  is_verified: boolean;
  phone: string | null;
};

export type CompanyJobRow = {
  id: string;
  title: string;
  location: string;
  contract_type: string;
  experience_level: string;
  status: string;
  created_at: string;
  description?: string;
  requirements?: string | null;
  benefits?: string | null;
  category?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  remote_option?: boolean;
};

export type UpdateCompanyProfilePayload = {
  name: string;
  description?: string | null;
  location?: string | null;
  website?: string | null;
  phone?: string | null;
  cnpj?: string | null;
  is_freelancer: boolean;
};

export type CreateCompanyJobPayload = {
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  location: string;
  category: string;
  contract_type: string;
  experience_level: string;
  salary_min?: number | null;
  salary_max?: number | null;
  remote_option?: boolean;
};

export async function fetchMyCompany(): Promise<CompanyMe> {
  return api.get<CompanyMe>("/api/companies/me");
}

export async function fetchMyJobs(
  page: number,
  limit: number,
): Promise<PaginatedResponse<CompanyJobRow>> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return api.get<PaginatedResponse<CompanyJobRow>>(
    `/api/companies/me/jobs?${q.toString()}`,
  );
}

export async function updateMyCompany(
  body: UpdateCompanyProfilePayload,
): Promise<CompanyMe> {
  return api.patch<CompanyMe>("/api/companies/me", body);
}

export async function fetchMyJob(jobId: string): Promise<CompanyJobRow> {
  return api.get<CompanyJobRow>(`/api/companies/me/jobs/${jobId}`);
}

export async function createMyJob(
  body: CreateCompanyJobPayload,
): Promise<CompanyJobRow> {
  return api.post<CompanyJobRow>("/api/companies/me/jobs", body);
}

export async function updateMyJob(
  jobId: string,
  body: Partial<CreateCompanyJobPayload>,
): Promise<CompanyJobRow> {
  return api.patch<CompanyJobRow>(`/api/companies/me/jobs/${jobId}`, body);
}

export async function deleteMyJob(jobId: string): Promise<void> {
  await api.delete(`/api/companies/me/jobs/${jobId}`);
}

export async function patchMyJobStatus(
  jobId: string,
  status: "active" | "closed",
): Promise<CompanyJobRow> {
  return api.patch<CompanyJobRow>(
    `/api/companies/me/jobs/${jobId}/status`,
    { status },
  );
}

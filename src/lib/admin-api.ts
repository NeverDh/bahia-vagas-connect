/**
 * Tipos e helpers para painel admin (NestJS): /api/admin/*.
 */

import api, { type PaginatedResponse } from "@/services/api";

export type AdminJobRow = {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  companies?: { name: string } | null;
};

export type AdminCompanyRow = {
  id: string;
  name: string;
  location: string | null;
  is_verified: boolean;
  created_at: string;
};

export type AdminDashboardResponse = {
  jobs: AdminJobRow[];
  companies: AdminCompanyRow[];
  stats: {
    jobs: number;
    companies: number;
    applications: number;
    candidates: number;
  };
};

export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  return api.get<AdminDashboardResponse>("/api/admin/dashboard");
}

export async function adminDeleteJob(jobId: string): Promise<void> {
  await api.delete(`/api/admin/jobs/${jobId}`);
}

export async function adminDeleteCompany(companyId: string): Promise<void> {
  await api.delete(`/api/admin/companies/${companyId}`);
}

export async function adminSetCompanyVerification(
  companyId: string,
  isVerified: boolean,
): Promise<void> {
  await api.patch(`/api/admin/companies/${companyId}/verification`, {
    is_verified: isVerified,
  });
}

/** Módulo 5 — listagens admin (candidatos / candidaturas). */
export type AdminCandidateRow = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  resume_url: string | null;
  created_at: string;
};

export type AdminApplicationRow = {
  id: string;
  status: string;
  created_at: string;
  job: { id: string; title: string; location: string } | null;
  company: { name: string } | null;
  candidate: { id: string; full_name: string } | null;
};

export async function fetchAdminCandidates(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<AdminCandidateRow>> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return api.get<PaginatedResponse<AdminCandidateRow>>(
    `/api/admin/candidates?${q.toString()}`,
  );
}

export async function fetchAdminApplications(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<AdminApplicationRow>> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return api.get<PaginatedResponse<AdminApplicationRow>>(
    `/api/admin/applications?${q.toString()}`,
  );
}

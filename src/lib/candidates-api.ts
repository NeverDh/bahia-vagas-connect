/**
 * Perfil do candidato e candidaturas (NestJS).
 */

import api, { type PaginatedResponse } from "@/services/api";

export type CandidateProfileMe = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  resume_url: string | null;
  bio: string | null;
  skills: string[] | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileApplicationRow = {
  id: string;
  status: string;
  created_at: string;
  cover_letter: string | null;
  jobs: {
    id: string;
    title: string;
    location: string;
    companies: {
      name: string;
      logo_url: string | null;
    } | null;
  } | null;
};

export async function fetchCandidateProfile(options?: {
  skipSessionInvalidOn401?: boolean;
}): Promise<CandidateProfileMe | null> {
  return api.get<CandidateProfileMe | null>("/api/candidates/me", {
    skipSessionInvalidOn401: options?.skipSessionInvalidOn401,
  });
}

export async function patchCandidateProfile(body: {
  full_name?: string;
  phone?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
}): Promise<CandidateProfileMe> {
  return api.patch<CandidateProfileMe>("/api/candidates/me", body);
}

export async function fetchCandidateApplications(
  page: number,
  limit: number,
): Promise<PaginatedResponse<ProfileApplicationRow>> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return api.get<PaginatedResponse<ProfileApplicationRow>>(
    `/api/candidates/me/applications?${q.toString()}`,
  );
}

export async function submitApplication(
  jobId: string,
  resumeFile: File,
  coverLetter: string,
): Promise<{ ok: true; application_id: string }> {
  const formData = new FormData();
  formData.append("job_id", jobId);
  formData.append("resume", resumeFile);
  if (coverLetter.trim()) {
    formData.append("cover_letter", coverLetter.trim());
  }
  return api.postFormData<{ ok: true; application_id: string }>(
    "/api/applications",
    formData,
  );
}

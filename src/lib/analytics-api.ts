/**
 * Analytics — tracking público e leitura admin via NestJS.
 */

import api from "@/services/api";

export type TrackVisitPayload = {
  page_url: string;
  page_title?: string;
  session_id?: string | null;
  referrer?: string | null;
  is_admin?: boolean;
};

export type TrackVisitResponse = {
  session_id: string;
  visitor_id: string;
};

export async function trackVisit(
  body: TrackVisitPayload,
): Promise<TrackVisitResponse> {
  return api.post<TrackVisitResponse>("/api/analytics/track", {
    page_url: body.page_url,
    page_title: body.page_title,
    session_id: body.session_id || undefined,
    referrer: body.referrer ?? undefined,
    is_admin: body.is_admin,
  });
}

export type AdminAnalyticsBundle = {
  visitors: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  page_views: Record<string, unknown>[];
};

export async function fetchAdminAnalytics(
  sinceIso: string,
): Promise<AdminAnalyticsBundle> {
  const q = new URLSearchParams({ since: sinceIso });
  return api.get<AdminAnalyticsBundle>(`/api/admin/analytics?${q.toString()}`);
}

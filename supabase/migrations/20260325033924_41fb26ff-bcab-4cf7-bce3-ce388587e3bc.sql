
-- Analytics tables
CREATE TABLE public.analytics_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  first_visit timestamptz NOT NULL DEFAULT now(),
  last_visit timestamptz NOT NULL DEFAULT now(),
  is_returning boolean NOT NULL DEFAULT false,
  visit_count integer NOT NULL DEFAULT 1,
  is_admin boolean NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX idx_analytics_visitors_ip_hash ON public.analytics_visitors(ip_hash);

CREATE TABLE public.analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES public.analytics_visitors(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  device text,
  browser text,
  os text,
  country text,
  city text,
  region text,
  referrer text,
  is_admin boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_analytics_sessions_started ON public.analytics_sessions(started_at);
CREATE INDEX idx_analytics_sessions_visitor ON public.analytics_sessions(visitor_id);

CREATE TABLE public.analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.analytics_sessions(id) ON DELETE CASCADE NOT NULL,
  page_url text NOT NULL,
  page_title text,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer DEFAULT 0
);

CREATE INDEX idx_analytics_page_views_session ON public.analytics_page_views(session_id);
CREATE INDEX idx_analytics_page_views_viewed ON public.analytics_page_views(viewed_at);
CREATE INDEX idx_analytics_page_views_url ON public.analytics_page_views(page_url);

-- RLS
ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (tracking)
CREATE POLICY "Anyone can insert visitors" ON public.analytics_visitors FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can insert sessions" ON public.analytics_sessions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can insert page views" ON public.analytics_page_views FOR INSERT TO public WITH CHECK (true);

-- Anyone can update visitors (for last_visit update)
CREATE POLICY "Anyone can update visitors" ON public.analytics_visitors FOR UPDATE TO public USING (true);
-- Anyone can update sessions (for ended_at)
CREATE POLICY "Anyone can update sessions" ON public.analytics_sessions FOR UPDATE TO public USING (true);
-- Anyone can update page views (for duration)
CREATE POLICY "Anyone can update page views" ON public.analytics_page_views FOR UPDATE TO public USING (true);

-- Only admins can read
CREATE POLICY "Admins can read visitors" ON public.analytics_visitors FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can read sessions" ON public.analytics_sessions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can read page views" ON public.analytics_page_views FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete (cleanup)
CREATE POLICY "Admins can delete visitors" ON public.analytics_visitors FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sessions" ON public.analytics_sessions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete page views" ON public.analytics_page_views FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

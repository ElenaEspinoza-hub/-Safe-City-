CREATE TABLE public.auth_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sign_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auth_session_events_user_created_at_idx
  ON public.auth_session_events (user_id, created_at DESC);

ALTER TABLE public.auth_session_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.auth_session_events FROM anon, authenticated;
GRANT SELECT, INSERT ON public.auth_session_events TO authenticated;

CREATE POLICY "users can read their session events"
  ON public.auth_session_events
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can record their own sign out"
  ON public.auth_session_events
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND event_type = 'sign_out'
  );

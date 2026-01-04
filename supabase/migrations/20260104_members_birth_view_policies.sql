-- Ensure RLS is enabled and allow SELECT via view for public read-only access

-- Enable Row Level Security on base table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow read-only (SELECT) access for anon and authenticated roles.
-- This is required for selecting from the view because RLS is enforced on the base table.
-- Direct table SELECT remains blocked by privileges unless explicitly granted.
CREATE POLICY members_view_read_policy
  ON public.members
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- View providing birth month/day, current age, and next birthday calculations
-- Uses local date semantics on the database side and ignores birth year for month filtering

CREATE OR REPLACE VIEW public.members_birth_view AS
WITH base AS (
  SELECT
    m.id,
    m.name,
    m.birth_date,
    EXTRACT(MONTH FROM m.birth_date)::int AS birth_month,
    EXTRACT(DAY FROM m.birth_date)::int AS birth_day,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.birth_date))::int AS age_years,
    CURRENT_DATE AS today,
    EXTRACT(YEAR FROM CURRENT_DATE)::int AS current_year
  FROM public.members m
),
-- compute target day in current year (handle Feb 29 -> Feb 28 on non-leap years)
adjusted AS (
  SELECT
    b.*,
    CASE
      WHEN b.birth_month = 2 AND b.birth_day = 29
           AND EXTRACT(DAY FROM (MAKE_DATE(b.current_year, 3, 1) - INTERVAL '1 day')) <> 29
        THEN 28
      ELSE b.birth_day
    END AS target_day_current,
    CASE
      WHEN b.birth_month = 2 AND b.birth_day = 29
           AND EXTRACT(DAY FROM (MAKE_DATE(b.current_year + 1, 3, 1) - INTERVAL '1 day')) <> 29
        THEN 28
      ELSE b.birth_day
    END AS target_day_next
  FROM base b
),
-- compute next birthday date in the current or next year
nexts AS (
  SELECT
    a.*,
    MAKE_DATE(a.current_year, a.birth_month, a.target_day_current) AS this_year_birthday,
    MAKE_DATE(a.current_year + 1, a.birth_month, a.target_day_next) AS next_year_birthday
  FROM adjusted a
)
SELECT
  n.id,
  n.name,
  n.birth_date,
  n.birth_month,
  n.birth_day,
  n.age_years,
  (n.birth_month = EXTRACT(MONTH FROM n.today)) AS birthday_this_month,
  CASE
    WHEN n.this_year_birthday >= n.today THEN n.this_year_birthday
    ELSE n.next_year_birthday
  END AS next_birthday,
  CASE
    WHEN n.this_year_birthday >= n.today THEN (n.this_year_birthday - n.today)
    ELSE (n.next_year_birthday - n.today)
  END AS days_until_birthday
FROM nexts n;

-- Optional: grant to anon/ authenticated roles if needed
-- Harden privileges: remove broad grants and only allow SELECT to intended role
REVOKE ALL ON public.members_birth_view FROM anon, authenticated;
GRANT SELECT ON public.members_birth_view TO authenticated;
GRANT SELECT ON public.members_birth_view TO anon;

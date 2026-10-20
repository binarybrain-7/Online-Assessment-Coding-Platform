CREATE SEQUENCE IF NOT EXISTS public.problems_problem_number_seq;

ALTER TABLE public.problems
  ADD COLUMN IF NOT EXISTS problem_number INTEGER;

WITH unnumbered_problems AS (
  SELECT
    id,
    COALESCE((SELECT MAX(problem_number) FROM public.problems), 0)
      + ROW_NUMBER() OVER (ORDER BY created_at, id) AS assigned_number
  FROM public.problems
  WHERE problem_number IS NULL
)
UPDATE public.problems AS problem
SET problem_number = unnumbered_problems.assigned_number
FROM unnumbered_problems
WHERE problem.id = unnumbered_problems.id;

ALTER TABLE public.problems
  ALTER COLUMN problem_number SET DEFAULT nextval('public.problems_problem_number_seq'),
  ALTER COLUMN problem_number SET NOT NULL;

ALTER SEQUENCE public.problems_problem_number_seq
  OWNED BY public.problems.problem_number;

SELECT setval(
  'public.problems_problem_number_seq',
  GREATEST(COALESCE((SELECT MAX(problem_number) FROM public.problems), 0) + 1, 1),
  false
);

CREATE UNIQUE INDEX IF NOT EXISTS problems_problem_number_unique
  ON public.problems (problem_number);

CREATE TABLE IF NOT EXISTS public.problem_code_templates (
  id BIGSERIAL PRIMARY KEY,
  problem_id BIGINT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  language VARCHAR(30) NOT NULL,
  starter_code TEXT NOT NULL,
  entry_class VARCHAR(100),
  entry_method VARCHAR(100),
  execution_mode VARCHAR(30) NOT NULL DEFAULT 'FUNCTION',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT problem_code_templates_language_unique
    UNIQUE (problem_id, language),
  CONSTRAINT problem_code_templates_execution_mode_check
    CHECK (execution_mode IN ('FUNCTION', 'STDIN'))
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_code_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published problems are readable by everyone"
  ON public.problems;
DROP POLICY IF EXISTS "Admins manage problems"
  ON public.problems;
CREATE POLICY "Published problems are readable by everyone"
  ON public.problems FOR SELECT
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admins manage problems"
  ON public.problems FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Published problem templates are readable by everyone"
  ON public.problem_code_templates;
DROP POLICY IF EXISTS "Admins manage problem templates"
  ON public.problem_code_templates;
CREATE POLICY "Published problem templates are readable by everyone"
  ON public.problem_code_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.problems
      WHERE problems.id = problem_code_templates.problem_id
        AND problems.is_published = true
    )
  );
CREATE POLICY "Admins manage problem templates"
  ON public.problem_code_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Visible test cases are readable by authenticated users"
  ON public.test_cases;
DROP POLICY IF EXISTS "Admins manage test cases"
  ON public.test_cases;
DROP POLICY IF EXISTS "Browser can read visible test cases"
  ON public.test_cases;
DROP POLICY IF EXISTS "Admins insert test cases"
  ON public.test_cases;
DROP POLICY IF EXISTS "Admins update test cases"
  ON public.test_cases;
DROP POLICY IF EXISTS "Admins delete test cases"
  ON public.test_cases;
CREATE POLICY "Browser can read visible test cases"
  ON public.test_cases FOR SELECT
  USING (is_hidden = false);
CREATE POLICY "Admins insert test cases"
  ON public.test_cases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admins update test cases"
  ON public.test_cases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE POLICY "Admins delete test cases"
  ON public.test_cases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

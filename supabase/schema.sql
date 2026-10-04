-- ==========================================
-- Online Judge Platform Schema for Supabase
-- PostgreSQL Database Definition
-- ==========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_picture_url TEXT,
  bio TEXT,
  problems_solved INT DEFAULT 0,
  contests_played INT DEFAULT 0,
  contest_rating INT DEFAULT 1200,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Social Links
CREATE TABLE IF NOT EXISTS public.user_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Problem Types
CREATE TABLE IF NOT EXISTS public.problem_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL CHECK (name IN ('dsa', 'development', 'sql', 'bash')),
  description TEXT
);

-- Seed initial problem types
INSERT INTO public.problem_types (name, description) VALUES
('dsa', 'Data Structures and Algorithms problems requiring input/output verification.'),
('development', 'Full multi-file application development challenges.'),
('sql', 'Database querying and schema manipulation tasks.'),
('bash', 'Shell scripting and system command automation challenges.')
ON CONFLICT (name) DO NOTHING;

-- 4. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Problems Table
CREATE TABLE IF NOT EXISTS public.problems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  type_id INT NOT NULL REFERENCES public.problem_types(id) ON DELETE CASCADE,
  constraints TEXT,
  hints TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Problem Categories (Junction)
CREATE TABLE IF NOT EXISTS public.problem_categories (
  problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
  category_id INT REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, category_id)
);

-- 7. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- 8. Problem Tags (Junction)
CREATE TABLE IF NOT EXISTS public.problem_tags (
  problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
  tag_id INT REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- 9. Test Cases Table
CREATE TABLE IF NOT EXISTS public.test_cases (
  id SERIAL PRIMARY KEY,
  problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  input_data TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  weight NUMERIC(5,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Problem Execution Config
CREATE TABLE IF NOT EXISTS public.problem_execution_config (
  id SERIAL PRIMARY KEY,
  problem_id INT UNIQUE NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  time_limit_ms INT DEFAULT 2000,
  memory_limit_mb INT DEFAULT 256,
  allowed_languages TEXT[] DEFAULT ARRAY['javascript', 'typescript', 'python', 'cpp', 'java', 'sql', 'bash']
);

-- 11. Problem Files (For Dev & Multi-file problems)
CREATE TABLE IF NOT EXISTS public.problem_files (
  id SERIAL PRIMARY KEY,
  problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_content TEXT NOT NULL,
  language TEXT NOT NULL,
  is_editable BOOLEAN DEFAULT true,
  is_entry_point BOOLEAN DEFAULT false,
  UNIQUE(problem_id, file_path)
);

-- 12. Submissions Table (Latest per user per problem)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending')),
  tests_passed INT DEFAULT 0,
  tests_total INT DEFAULT 0,
  accuracy_score NUMERIC(5,2) DEFAULT 0.0,
  runtime_ms INT DEFAULT 0,
  memory_kb INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_problem UNIQUE (user_id, problem_id)
);

-- 13. Submission Test Results
CREATE TABLE IF NOT EXISTS public.submission_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  test_case_id INT NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actual_output TEXT,
  error_message TEXT,
  runtime_ms INT DEFAULT 0,
  memory_kb INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Code Analysis
CREATE TABLE IF NOT EXISTS public.code_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID UNIQUE NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  readability_score NUMERIC(5,2) DEFAULT 0.0,
  maintainability_score NUMERIC(5,2) DEFAULT 0.0,
  architecture_score NUMERIC(5,2) DEFAULT 0.0,
  naming_score NUMERIC(5,2) DEFAULT 0.0,
  modularity_score NUMERIC(5,2) DEFAULT 0.0,
  security_score NUMERIC(5,2) DEFAULT 0.0,
  design_patterns_score NUMERIC(5,2) DEFAULT 0.0,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Code Analysis Feedback
CREATE TABLE IF NOT EXISTS public.code_analysis_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.code_analysis(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  feedback TEXT NOT NULL,
  line_number INT
);

-- 16. Submission Scores (Combined Scores)
CREATE TABLE IF NOT EXISTS public.submission_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID UNIQUE NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  accuracy_score NUMERIC(5,2) DEFAULT 0.0,
  analysis_score NUMERIC(5,2) DEFAULT 0.0,
  overall_score NUMERIC(5,2) DEFAULT 0.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Contests Table
CREATE TABLE IF NOT EXISTS public.contests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Contest Problems
CREATE TABLE IF NOT EXISTS public.contest_problems (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  problem_order INT NOT NULL,
  score_weight NUMERIC(5,2) DEFAULT 100.0,
  UNIQUE(contest_id, problem_id)
);

-- 19. Contest Participants
CREATE TABLE IF NOT EXISTS public.contest_participants (
  id SERIAL PRIMARY KEY,
  contest_id INT NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  score NUMERIC(10,2) DEFAULT 0.0,
  UNIQUE(contest_id, user_id)
);

-- 20. Contest Submissions (Preserve full history)
CREATE TABLE IF NOT EXISTS public.contest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id INT NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id INT NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL,
  tests_passed INT DEFAULT 0,
  tests_total INT DEFAULT 0,
  score NUMERIC(5,2) DEFAULT 0.0,
  runtime_ms INT DEFAULT 0,
  memory_kb INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Post Media
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL
);

-- 23. User Activity
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  submission_count INT DEFAULT 1,
  UNIQUE(user_id, activity_date)
);

-- 24. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- 25. User Badges (Junction)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id INT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 26. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. Problem Uploads Table
CREATE TABLE IF NOT EXISTS public.problem_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processed',
  extracted_test_cases_count INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_analysis_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Social Links
CREATE POLICY "Public social links are readable" ON public.user_social_links FOR SELECT USING (true);
CREATE POLICY "Users manage their own social links" ON public.user_social_links FOR ALL USING (auth.uid() = user_id);

-- Problems Policies
CREATE POLICY "Published problems are readable by everyone" ON public.problems FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage problems" ON public.problems FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Test Cases Policies (CRITICAL: Hidden test cases are NOT publicly readable)
CREATE POLICY "Visible test cases are readable by authenticated users" ON public.test_cases FOR SELECT USING (is_hidden = false OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage test cases" ON public.test_cases FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Submissions Policies
CREATE POLICY "Users view own submissions and public leaderboards" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Users create/update own submissions" ON public.submissions FOR ALL USING (auth.uid() = user_id);

-- Code Analysis & Scores
CREATE POLICY "Submissions code analysis readable" ON public.code_analysis FOR SELECT USING (true);
CREATE POLICY "Submissions scores readable" ON public.submission_scores FOR SELECT USING (true);

-- Contests Policies
CREATE POLICY "Public contests readable" ON public.contests FOR SELECT USING (true);
CREATE POLICY "Admins manage contests" ON public.contests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Contest Participants
CREATE POLICY "Participants readable" ON public.contest_participants FOR SELECT USING (true);
CREATE POLICY "Users register for contests" ON public.contest_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Posts readable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors edit own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);

-- Notifications
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Problem Uploads
CREATE POLICY "Admins manage uploads" ON public.problem_uploads FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for Automatic Profile Creation on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, profile_picture_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Supabase / PostgreSQL schema for the coding platform
-- Based on the supplied schema document.
--
-- Run in Supabase Dashboard -> SQL Editor.
-- This script creates the 27 application tables.
-- Supabase Auth's auth.users table is provided by Supabase.
--
-- Note: CREATE TABLE IF NOT EXISTS does not alter an existing
-- table's columns. The ALTER TABLE statements below add the
-- problem_number column and relevant unique index if needed.
-- ============================================================

-- 1. Users & Authentication

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    profile_picture_url TEXT,
    bio TEXT,
    problems_solved INTEGER DEFAULT 0,
    contests_played INTEGER DEFAULT 0,
    contest_rating INTEGER DEFAULT 0,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    platform VARCHAR(30) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_social_links_user_platform_unique UNIQUE (user_id, platform)
);

-- 2. Problems

CREATE TABLE IF NOT EXISTS public.problem_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problems (
    id BIGSERIAL PRIMARY KEY,
    problem_number INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type_id BIGINT REFERENCES public.problem_types(id),
    difficulty VARCHAR(20),
    created_by UUID REFERENCES public.profiles(id),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure this column exists when public.problems was created earlier
-- without problem_number.
ALTER TABLE public.problems
    ADD COLUMN IF NOT EXISTS problem_number INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS problems_problem_number_unique
    ON public.problems(problem_number);

CREATE TABLE IF NOT EXISTS public.problem_code_templates (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT NOT NULL
        REFERENCES public.problems(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.problem_categories (
    problem_id BIGINT REFERENCES public.problems(id),
    category_id BIGINT REFERENCES public.categories(id),
    PRIMARY KEY (problem_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.problem_tags (
    problem_id BIGINT REFERENCES public.problems(id),
    tag_id BIGINT REFERENCES public.tags(id),
    PRIMARY KEY (problem_id, tag_id)
);

-- 3. Test Cases & Execution

CREATE TABLE IF NOT EXISTS public.test_cases (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES public.problems(id),
    input_data TEXT,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT TRUE,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problem_execution_config (
    problem_id BIGINT PRIMARY KEY REFERENCES public.problems(id),
    time_limit_ms INTEGER DEFAULT 2000,
    memory_limit_mb INTEGER DEFAULT 256,
    allowed_languages JSONB,
    execution_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problem_files (
    id BIGSERIAL PRIMARY KEY,
    problem_id BIGINT REFERENCES public.problems(id),
    file_path TEXT NOT NULL,
    file_content TEXT,
    language VARCHAR(50),
    is_editable BOOLEAN DEFAULT TRUE,
    is_entry_point BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Submissions

CREATE TABLE IF NOT EXISTS public.submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    problem_id BIGINT REFERENCES public.problems(id),
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    tests_passed INTEGER DEFAULT 0,
    tests_total INTEGER DEFAULT 0,
    accuracy_score NUMERIC(5,2),
    runtime_ms BIGINT,
    memory_kb BIGINT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT submissions_user_problem_unique UNIQUE (user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS public.submission_test_results (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT REFERENCES public.submissions(id),
    test_case_id BIGINT REFERENCES public.test_cases(id),
    status VARCHAR(20) NOT NULL,
    actual_output TEXT,
    expected_output TEXT,
    error_message TEXT,
    runtime_ms BIGINT,
    memory_kb BIGINT
);

-- 5. AI Code Analysis

CREATE TABLE IF NOT EXISTS public.code_analysis (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT UNIQUE REFERENCES public.submissions(id),
    readability_score NUMERIC(5,2),
    maintainability_score NUMERIC(5,2),
    architecture_score NUMERIC(5,2),
    naming_score NUMERIC(5,2),
    modularity_score NUMERIC(5,2),
    security_score NUMERIC(5,2),
    design_patterns_score NUMERIC(5,2),
    overall_score NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.code_analysis_feedback (
    id BIGSERIAL PRIMARY KEY,
    analysis_id BIGINT REFERENCES public.code_analysis(id),
    aspect VARCHAR(50) NOT NULL,
    score NUMERIC(5,2),
    explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.submission_scores (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT UNIQUE REFERENCES public.submissions(id),
    accuracy_score NUMERIC(5,2),
    analysis_score NUMERIC(5,2),
    overall_score NUMERIC(5,2),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contests

CREATE TABLE IF NOT EXISTS public.contests (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contest_problems (
    contest_id BIGINT REFERENCES public.contests(id),
    problem_id BIGINT REFERENCES public.problems(id),
    problem_order INTEGER,
    PRIMARY KEY (contest_id, problem_id)
);

CREATE TABLE IF NOT EXISTS public.contest_participants (
    id BIGSERIAL PRIMARY KEY,
    contest_id BIGINT REFERENCES public.contests(id),
    user_id UUID REFERENCES public.profiles(id),
    score NUMERIC(10,2) DEFAULT 0,
    rank INTEGER,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT contest_participants_contest_user_unique
        UNIQUE (contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.contest_submissions (
    id BIGSERIAL PRIMARY KEY,
    contest_id BIGINT REFERENCES public.contests(id),
    problem_id BIGINT REFERENCES public.problems(id),
    user_id UUID REFERENCES public.profiles(id),
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(30),
    tests_passed INTEGER DEFAULT 0,
    tests_total INTEGER DEFAULT 0,
    score NUMERIC(10,2) DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Community Posts

CREATE TABLE IF NOT EXISTS public.posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_media (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES public.posts(id),
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. User Activity & Gamification

CREATE TABLE IF NOT EXISTS public.user_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    activity_date DATE NOT NULL,
    problems_solved INTEGER DEFAULT 0,
    CONSTRAINT user_activity_user_date_unique UNIQUE (user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS public.badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria_type VARCHAR(50),
    criteria_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id),
    badge_id BIGINT REFERENCES public.badges(id),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- 9. Notifications

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Admin

CREATE TABLE IF NOT EXISTS public.problem_uploads (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    problem_id BIGINT REFERENCES public.problems(id),
    file_name VARCHAR(255),
    file_type VARCHAR(20),
    file_url TEXT,
    status VARCHAR(30),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful index for loading templates by problem.
CREATE INDEX IF NOT EXISTS problem_code_templates_problem_id_idx
    ON public.problem_code_templates(problem_id);

-- Initial problem type rows from the schema document.
INSERT INTO public.problem_types (id, name, description)
VALUES
    (1, 'DSA', 'Data Structures and Algorithms'),
    (2, 'Development', 'Software development problems'),
    (3, 'SQL', 'SQL problems'),
    (4, 'Bash', 'Bash scripting problems')
ON CONFLICT (id) DO NOTHING;

-- Keep the BIGSERIAL sequence aligned after explicit IDs were inserted.
SELECT setval(
    pg_get_serial_sequence('public.problem_types', 'id'),
    GREATEST(COALESCE((SELECT MAX(id) FROM public.problem_types), 1), 1),
    EXISTS (SELECT 1 FROM public.problem_types)
);

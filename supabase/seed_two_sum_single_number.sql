-- Seed two DSA problems into the existing Supabase schema:
-- 1. Two Sum
-- 2. Single Number (find the one value that does not repeat)
--
-- Assumptions:
-- - The schema tables already exist.
-- - public.problem_types contains a row named 'DSA'.
-- - Test inputs/outputs are stored as JSON text. Your execution backend
--   must parse this format and invoke the function described in the template.
-- - This script is re-runnable: it upserts problem metadata/templates/config,
--   and replaces test cases for these two problem slugs.

BEGIN;

-- Ensure categories exist.
INSERT INTO public.categories (name, slug, description)
VALUES
    ('Array', 'array', 'Problems involving arrays and array traversal.'),
    ('Hash Table', 'hash-table', 'Problems involving hash maps and lookup tables.'),
    ('Bit Manipulation', 'bit-manipulation', 'Problems involving bitwise operations.')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Ensure tags exist.
INSERT INTO public.tags (name, slug)
VALUES
    ('Array', 'array'),
    ('Hash Table', 'hash-table'),
    ('Bit Manipulation', 'bit-manipulation'),
    ('XOR', 'xor'),
    ('Two Pointers', 'two-pointers')
ON CONFLICT (slug) DO NOTHING;

-- Insert/update the problems. Public problem numbers are 1 and 2.
INSERT INTO public.problems
    (problem_number, title, slug, description, type_id, difficulty, is_published)
SELECT
    1,
    'Two Sum',
    'two-sum',
    $desc$
Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Return the indices in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 9.

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10000
- -1000000000 <= nums[i] <= 1000000000
- -2000000000 <= target <= 2000000000
- Exactly one valid answer exists.
$desc$,
    pt.id,
    'Easy',
    TRUE
FROM public.problem_types pt
WHERE pt.name = 'DSA'
ON CONFLICT (slug) DO UPDATE SET
    problem_number = EXCLUDED.problem_number,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    type_id = EXCLUDED.type_id,
    difficulty = EXCLUDED.difficulty,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();

INSERT INTO public.problems
    (problem_number, title, slug, description, type_id, difficulty, is_published)
SELECT
    2,
    'Single Number',
    'single-number',
    $desc$
Given a non-empty array of integers nums, every element appears twice except for one element that appears exactly once. Find and return that single element.

Example 1:
Input: nums = [2,2,1]
Output: 1

Example 2:
Input: nums = [4,1,2,1,2]
Output: 4

Example 3:
Input: nums = [1]
Output: 1

Constraints:
- 1 <= nums.length <= 30000
- -30000 <= nums[i] <= 30000
- Every element appears twice except for one element, which appears once.
$desc$,
    pt.id,
    'Easy',
    TRUE
FROM public.problem_types pt
WHERE pt.name = 'DSA'
ON CONFLICT (slug) DO UPDATE SET
    problem_number = EXCLUDED.problem_number,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    type_id = EXCLUDED.type_id,
    difficulty = EXCLUDED.difficulty,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();

-- Associate categories.
INSERT INTO public.problem_categories (problem_id, category_id)
SELECT p.id, c.id
FROM public.problems p
JOIN public.categories c ON
    (p.slug = 'two-sum' AND c.slug IN ('array', 'hash-table'))
    OR
    (p.slug = 'single-number' AND c.slug IN ('array', 'bit-manipulation'))
ON CONFLICT DO NOTHING;

-- Associate tags.
INSERT INTO public.problem_tags (problem_id, tag_id)
SELECT p.id, t.id
FROM public.problems p
JOIN public.tags t ON
    (p.slug = 'two-sum' AND t.slug IN ('array', 'hash-table', 'two-pointers'))
    OR
    (p.slug = 'single-number' AND t.slug IN ('array', 'bit-manipulation', 'xor'))
ON CONFLICT DO NOTHING;

-- Java function-based starter templates.
INSERT INTO public.problem_code_templates
    (problem_id, language, starter_code, entry_class, entry_method, execution_mode)
SELECT
    p.id,
    'java',
    $code$
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here

        return new int[]{};
    }
}
$code$,
    'Solution',
    'twoSum',
    'FUNCTION'
FROM public.problems p
WHERE p.slug = 'two-sum'
ON CONFLICT (problem_id, language) DO UPDATE SET
    starter_code = EXCLUDED.starter_code,
    entry_class = EXCLUDED.entry_class,
    entry_method = EXCLUDED.entry_method,
    execution_mode = EXCLUDED.execution_mode,
    updated_at = NOW();

INSERT INTO public.problem_code_templates
    (problem_id, language, starter_code, entry_class, entry_method, execution_mode)
SELECT
    p.id,
    'java',
    $code$
class Solution {
    public int singleNumber(int[] nums) {
        // Write your solution here

        return 0;
    }
}
$code$,
    'Solution',
    'singleNumber',
    'FUNCTION'
FROM public.problems p
WHERE p.slug = 'single-number'
ON CONFLICT (problem_id, language) DO UPDATE SET
    starter_code = EXCLUDED.starter_code,
    entry_class = EXCLUDED.entry_class,
    entry_method = EXCLUDED.entry_method,
    execution_mode = EXCLUDED.execution_mode,
    updated_at = NOW();

-- Execution configuration. Add more languages here only after the backend
-- can execute them. This seed enables Java only.
INSERT INTO public.problem_execution_config
    (problem_id, time_limit_ms, memory_limit_mb, allowed_languages, execution_config)
SELECT
    p.id,
    2000,
    256,
    '["java"]'::jsonb,
    '{"input_format":"json","runner_mode":"function"}'::jsonb
FROM public.problems p
WHERE p.slug IN ('two-sum', 'single-number')
ON CONFLICT (problem_id) DO UPDATE SET
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    allowed_languages = EXCLUDED.allowed_languages,
    execution_config = EXCLUDED.execution_config,
    updated_at = NOW();

-- Replace test cases for these two problems so rerunning this script
-- does not duplicate the seed test cases. These are JSON text strings.
DELETE FROM public.test_cases tc
USING public.problems p
WHERE tc.problem_id = p.id
  AND p.slug IN ('two-sum', 'single-number');

INSERT INTO public.test_cases
    (problem_id, input_data, expected_output, is_hidden, weight)
SELECT p.id, v.input_data, v.expected_output, v.is_hidden, v.weight
FROM public.problems p
JOIN (
    VALUES
        ('two-sum', '{"nums":[2,7,11,15],"target":9}', '[0,1]', FALSE, 1),
        ('two-sum', '{"nums":[3,2,4],"target":6}', '[1,2]', FALSE, 1),
        ('two-sum', '{"nums":[3,3],"target":6}', '[0,1]', FALSE, 1),
        ('two-sum', '{"nums":[-1,-2,-3,-4,-5],"target":-8}', '[2,4]', TRUE, 1),
        ('two-sum', '{"nums":[0,4,3,0],"target":0}', '[0,3]', TRUE, 1),
        ('single-number', '{"nums":[2,2,1]}', '1', FALSE, 1),
        ('single-number', '{"nums":[4,1,2,1,2]}', '4', FALSE, 1),
        ('single-number', '{"nums":[1]}', '1', FALSE, 1),
        ('single-number', '{"nums":[-1,-1,-7]}', '-7', TRUE, 1),
        ('single-number', '{"nums":[9,3,9,3,6]}', '6', TRUE, 1)
) AS v(slug, input_data, expected_output, is_hidden, weight)
    ON p.slug = v.slug;

COMMIT;

-- Verification: run after the transaction.
SELECT
    p.problem_number,
    p.title,
    p.slug,
    p.difficulty,
    p.is_published,
    COUNT(DISTINCT pct.id) AS code_templates,
    COUNT(DISTINCT tc.id) AS test_cases
FROM public.problems p
LEFT JOIN public.problem_code_templates pct ON pct.problem_id = p.id
LEFT JOIN public.test_cases tc ON tc.problem_id = p.id
WHERE p.slug IN ('two-sum', 'single-number')
GROUP BY p.id
ORDER BY p.problem_number;

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { Problem, Submission } from "@/types";

export interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: problemData } = await supabase
    .from("problems")
    .select(`
      *,
      problem_type:problem_types(*),
      categories:problem_categories(categories(*)),
      tags:problem_tags(tags(*))
    `)
    .eq("slug", slug)
    .single();

  const problem: Problem = problemData
    ? {
        ...problemData,
        categories: problemData.categories
          ? problemData.categories.map((c: { categories: unknown }) => c.categories)
          : [],
        tags: problemData.tags
          ? problemData.tags.map((t: { tags: unknown }) => t.tags)
          : [],
      }
    : {
        id: 1,
        title: slug === "two-sum" ? "Two Sum" : "Sample Coding Problem",
        slug: slug,
        description: `### Problem Description\n\nGiven an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have ***exactly one solution***, and you may not use the same element twice.\n\n### Example 1:\n\`\`\`\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\`\`\``,
        difficulty: "Easy",
        type_id: 1,
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        hints: ["Try using a hash map to look up complements in O(1) time."],
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        problem_type: { id: 1, name: "dsa", description: "DSA" },
      };

  if (!problem) {
    notFound();
  }

  const { data: testCases } = await supabase
    .from("test_cases")
    .select("*")
    .eq("problem_id", problem.id);

  const { data: problemFiles } = await supabase
    .from("problem_files")
    .select("*")
    .eq("problem_id", problem.id);

  let userSubmission: Submission | null = null;
  if (user) {
    const { data: sub } = await supabase
      .from("submissions")
      .select("*")
      .eq("problem_id", problem.id)
      .eq("user_id", user.id)
      .maybeSingle();
    userSubmission = sub;
  }

  const { data: publicSubmissions } = await supabase
    .from("submissions")
    .select(`
      *,
      profile:profiles(username, full_name, profile_picture_url)
    `)
    .eq("problem_id", problem.id)
    .order("accuracy_score", { ascending: false })
    .limit(10);

  const problemTypeName = problem.problem_type?.name ?? "dsa";

  return (
    <div className="py-2">
      <MonacoEditor
        problem={problem}
        problemId={problem.id}
        problemType={problemTypeName}
        initialFiles={problemFiles ?? []}
        testCases={testCases ?? []}
        previousSubmission={userSubmission}
        publicSubmissions={publicSubmissions ?? []}
      />
    </div>
  );
}

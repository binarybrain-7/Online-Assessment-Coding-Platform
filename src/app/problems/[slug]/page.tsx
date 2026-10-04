import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
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

  const difficultyVariant =
    problem.difficulty === "Easy"
      ? "easy"
      : problem.difficulty === "Medium"
      ? "medium"
      : "hard";

  const problemTypeName = problem.problem_type?.name ?? "dsa";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
      <div className="lg:col-span-5 glass-panel p-6 rounded-xl space-y-6 overflow-y-auto max-h-[750px]">
        <div className="space-y-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={difficultyVariant}>{problem.difficulty}</Badge>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
              {problemTypeName}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-100">
            {problem.title}
          </h1>

          {problem.categories && problem.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {problem.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br/>') }} />
        </div>

        {problem.constraints && (
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Constraints
            </h4>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
              {problem.constraints}
            </pre>
          </div>
        )}

        {problem.hints && problem.hints.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Hints
            </h4>
            <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
              {problem.hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="lg:col-span-7">
        <MonacoEditor
          problemId={problem.id}
          problemType={problemTypeName}
          initialFiles={problemFiles ?? []}
          testCases={testCases ?? []}
          previousSubmission={userSubmission}
          publicSubmissions={publicSubmissions ?? []}
        />
      </div>
    </div>
  );
}

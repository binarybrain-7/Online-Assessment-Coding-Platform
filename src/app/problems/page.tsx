"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Code, Sparkles } from "lucide-react";
import { Problem, Category, ProblemType } from "@/types";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

export default function ProblemsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") ?? ""
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") ?? "1", 10)
  );

  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProblemType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pageSize = 8;

  useEffect(() => {
    async function loadMetadata() {
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      const { data: typeData } = await supabase
        .from("problem_types")
        .select("*");
      if (typeData) setTypes(typeData);
    }
    loadMetadata();
  }, [supabase]);

  useEffect(() => {
    async function fetchProblems() {
      setIsLoading(true);
      try {
        let query = supabase
          .from("problems")
          .select(
            `
            *,
            problem_type:problem_types(*),
            categories:problem_categories(categories(*))
          `,
            { count: "exact" }
          )
          .eq("is_published", true);

        if (search) {
          query = query.or(
            `title.ilike.%${search}%,description.ilike.%${search}%`
          );
        }

        if (difficulty) {
          query = query.eq("difficulty", difficulty);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query.range(from, to);

        if (!error && data) {
          const formatted = data.map((p) => ({
            ...p,
            categories: p.categories
              ? p.categories.map((c: { categories: unknown }) => c.categories)
              : [],
          }));
          setProblems(formatted);
          setTotalCount(count ?? 0);
        } else {
          // Fallback initial sample problem for pristine DB state
          setProblems([
            {
              id: 1,
              title: "Two Sum",
              slug: "two-sum",
              description: "Find two indices such that their values sum to target.",
              difficulty: "Easy",
              type_id: 1,
              constraints: "2 <= nums.length <= 10^4",
              hints: ["Use a hash map for O(n) lookup time."],
              is_published: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              problem_type: { id: 1, name: "dsa", description: "DSA" },
            },
            {
              id: 2,
              title: "Multi-File React Todo Component",
              slug: "react-todo-component",
              description: "Build a stateful Todo application supporting adding and filtering tasks.",
              difficulty: "Medium",
              type_id: 2,
              constraints: "Support filter tabs: All, Active, Completed",
              hints: ["Store tasks in useState array."],
              is_published: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              problem_type: { id: 2, name: "development", description: "Dev" },
            },
          ]);
          setTotalCount(2);
        }
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }

    fetchProblems();
  }, [search, category, type, difficulty, page, supabase]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setType("");
    setDifficulty("");
    setPage(1);
    router.push("/problems");
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400">
          <Code className="w-3.5 h-3.5" /> Problem Archive
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Coding Problems</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Search and filter algorithm challenges, development tasks, SQL queries, and shell scripts.
        </p>
      </div>

      {/* Filter Toolbar */}
      <ProblemFilters
        search={search}
        category={category}
        type={type}
        difficulty={difficulty}
        categories={categories}
        types={types}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        onTypeChange={(val) => {
          setType(val);
          setPage(1);
        }}
        onDifficultyChange={(val) => {
          setDifficulty(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Problem Listing */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : problems.length > 0 ? (
        <div className="space-y-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <Card className="text-center py-12 space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">
            No matching problems found
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or resetting filters.
          </p>
        </Card>
      )}
    </div>
  );
}

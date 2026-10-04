import Link from "next/link";
import { BookOpen, FolderGit2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Default display categories if DB table is empty initial state
  const displayCategories =
    categories && categories.length > 0
      ? categories
      : [
          {
            id: 1,
            name: "Recursion & Backtracking",
            slug: "recursion",
            description: "Master recursive function call stacks, N-Queens, Sudoku solving, and tree traversals.",
            icon: "repeat",
          },
          {
            id: 2,
            name: "Trees & Binary Search Trees",
            slug: "trees",
            description: "Binary tree traversals, LCA, Segment Trees, Trie prefix trees, and Heap priority queues.",
            icon: "git-branch",
          },
          {
            id: 3,
            name: "Graphs & Shortest Paths",
            slug: "graphs",
            description: "BFS, DFS, Dijkstra, Bellman-Ford, Topological Sort, and Disjoint Set Union (DSU).",
            icon: "network",
          },
          {
            id: 4,
            name: "PostgreSQL & Relational SQL",
            slug: "sql",
            description: "Complex table joins, window functions, CTE expressions, and schema indexing challenges.",
            icon: "database",
          },
          {
            id: 5,
            name: "Bash & Linux Shell",
            slug: "bash",
            description: "Shell command pipelines, awk/sed text processing, grep, and process orchestration.",
            icon: "terminal",
          },
        ];

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-400">
          <BookOpen className="w-3.5 h-3.5" /> Topic Exploration
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Problem Categories</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Browse coding challenges categorized by specific algorithmic topics and tech stacks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCategories.map((cat) => (
          <Card key={cat.id} className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">{cat.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cat.description || "Explore problems under this category."}
              </p>
            </div>

            <Link
              href={`/problems?category=${cat.slug}`}
              className="inline-flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-3 border-t border-slate-800"
            >
              <span>View Problems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

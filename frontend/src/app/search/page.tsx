import Link from "next/link";
import { Search, Code, User, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ProblemCard } from "@/components/problems/ProblemCard";

export interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeTab = params.tab ?? "all";

  const supabase = await createClient();

  let problems: any[] = [];
  let profiles: any[] = [];
  let posts: any[] = [];

  if (query) {
    // Database search across problems
    const { data: probData } = await supabase
      .from("problems")
      .select(`
        *,
        problem_type:problem_types(*),
        categories:problem_categories(categories(*))
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(6);

    // Database search across profiles
    const { data: profData } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(6);

    // Database search across posts
    const { data: postData } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(username, full_name, profile_picture_url)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(6);

    problems = probData
      ? probData.map((p) => ({
          ...p,
          categories: p.categories
            ? p.categories.map((c: { categories: unknown }) => c.categories)
            : [],
        }))
      : [];
    profiles = profData ?? [];
    posts = postData ?? [];
  }

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400">
          <Search className="w-3.5 h-3.5" /> Global Search
        </div>
        <h1 className="text-3xl font-bold text-slate-100">
          Search Results for &quot;{query}&quot;
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <Link
          href={`/search?q=${query}&tab=all`}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          All Results
        </Link>
        <Link
          href={`/search?q=${query}&tab=problems`}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "problems" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Problems ({problems.length})
        </Link>
        <Link
          href={`/search?q=${query}&tab=users`}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "users" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Users ({profiles.length})
        </Link>
        <Link
          href={`/search?q=${query}&tab=posts`}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "posts" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Posts ({posts.length})
        </Link>
      </div>

      {/* Results Content */}
      <div className="space-y-8">
        {(activeTab === "all" || activeTab === "problems") && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" /> Problems
            </h3>
            {problems.length > 0 ? (
              problems.map((p) => <ProblemCard key={p.id} problem={p} />)
            ) : (
              <p className="text-xs text-slate-500">No matching problems found.</p>
            )}
          </div>
        )}

        {(activeTab === "all" || activeTab === "users") && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Users
            </h3>
            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profiles.map((prof) => (
                  <Card key={prof.id} className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {prof.full_name || prof.username}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">@{prof.username}</p>
                    </div>
                    <Link
                      href={`/profile/${prof.username}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Profile
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No matching user accounts found.</p>
            )}
          </div>
        )}

        {(activeTab === "all" || activeTab === "posts") && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Posts
            </h3>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="p-4 space-y-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-sm font-bold text-slate-100 hover:text-blue-400"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                </Card>
              ))
            ) : (
              <p className="text-xs text-slate-500">No matching posts found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

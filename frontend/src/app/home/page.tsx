import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Code,
  Trophy,
  Zap,
  BookOpen,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ContestCard } from "@/components/contests/ContestCard";
import { ActivityTracker } from "@/components/profile/ActivityTracker";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: userActivities } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", user.id);

  const { data: problems } = await supabase
    .from("problems")
    .select(`
      *,
      problem_type:problem_types(*),
      categories:problem_categories(categories(*))
    `)
    .eq("is_published", true)
    .limit(4);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .limit(6);

  const { data: contests } = await supabase
    .from("contests")
    .select("*")
    .eq("is_published", true)
    .order("start_time", { ascending: true })
    .limit(2);

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(username, full_name, profile_picture_url)
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  const formattedProblems = (problems ?? []).map((p) => ({
    ...p,
    categories: p.categories ? p.categories.map((c: { categories: unknown }) => c.categories) : [],
  }));

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-l-4 border-l-blue-500 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400">
            <Zap className="w-3.5 h-3.5" /> Welcome Back
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Hello, {profile?.full_name || profile?.username || "Coder"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your coding progress, join ongoing contests, and practice problem solving.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <p className="text-xs text-slate-400">Solved</p>
            <p className="text-xl font-bold text-blue-400">
              {profile?.problems_solved ?? 0}
            </p>
          </div>
          <div className="text-center px-3 border-r border-slate-800">
            <p className="text-xs text-slate-400">Rating</p>
            <p className="text-xl font-bold text-amber-400">
              {profile?.contest_rating ?? 1200}
            </p>
          </div>
          <div className="text-center px-3">
            <p className="text-xs text-slate-400">Contests</p>
            <p className="text-xl font-bold text-purple-400">
              {profile?.contests_played ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActivityTracker activities={userActivities ?? []} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Featured Problems
              </h2>
              <Link
                href="/problems"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {formattedProblems.length > 0 ? (
                formattedProblems.map((prob) => (
                  <ProblemCard key={prob.id} problem={prob} />
                ))
              ) : (
                <Card className="text-center py-8 text-xs text-slate-500">
                  No published problems available yet. Check back soon!
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Community Posts
              </h2>
              <Link
                href="/posts"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Explore Feed <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id} className="p-4 space-y-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Posted by @{post.author?.username ?? "user"}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-6 text-xs text-slate-500">
                  No community discussions created yet.
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Contests
              </h3>
              <Link
                href="/contests"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                All
              </Link>
            </div>

            {contests && contests.length > 0 ? (
              contests.map((c) => (
                <ContestCard key={c.id} contest={c} type="upcoming" />
              ))
            ) : (
              <Card className="text-center py-6 text-xs text-slate-500">
                No active contests scheduled right now.
              </Card>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Categories
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/problems?category=${cat.slug}`}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <span className="text-xs text-slate-500 col-span-2">
                  No categories configured yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

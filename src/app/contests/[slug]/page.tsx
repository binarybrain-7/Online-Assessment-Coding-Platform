import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy, Users, CheckCircle2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContestTimer } from "@/components/contests/ContestTimer";
import { Contest } from "@/types";
import { formatDate } from "@/lib/utils";

export interface ContestPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ContestDetailPage({ params }: ContestPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: contestData } = await supabase
    .from("contests")
    .select("*")
    .eq("slug", slug)
    .single();

  const contest: Contest = contestData ?? {
    id: 1,
    title: "Weekly Algorithmic Clash #42",
    slug: slug,
    description: "Welcome to Weekly Algorithmic Clash #42! Solve 4 programming challenges of increasing difficulty within 2 hours. Submissions are scored on test-case accuracy and runtime efficiency.",
    start_time: new Date(Date.now() - 1800000).toISOString(),
    end_time: new Date(Date.now() + 5400000).toISOString(),
    is_published: true,
    created_at: new Date().toISOString(),
  };

  if (!contest) {
    notFound();
  }

  const { data: contestProblems } = await supabase
    .from("contest_problems")
    .select(`
      *,
      problem:problems(*)
    `)
    .eq("contest_id", contest.id)
    .order("problem_order", { ascending: true });

  const { data: participants } = await supabase
    .from("contest_participants")
    .select(`
      *,
      profile:profiles(username, full_name, profile_picture_url)
    `)
    .eq("contest_id", contest.id)
    .order("score", { ascending: false });

  let isRegistered = false;
  if (user) {
    const { data: reg } = await supabase
      .from("contest_participants")
      .select("id")
      .eq("contest_id", contest.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (reg) isRegistered = true;
  }

  return (
    <div className="space-y-8 py-4">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald">Live Contest</Badge>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                {participants?.length ?? 0} registered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {contest.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ContestTimer endTime={contest.end_time} />

            {isRegistered ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> Registered
              </div>
            ) : (
              <form action={`/api/contests/${contest.id}/register`} method="POST">
                <Button type="submit" variant="gradient" size="md">
                  Register Now
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {contest.description}
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-400 pt-4 border-t border-slate-800">
          <div>
            Start: <span className="text-slate-200 font-mono">{formatDate(contest.start_time)}</span>
          </div>
          <div>
            End: <span className="text-slate-200 font-mono">{formatDate(contest.end_time)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Contest Problems</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contestProblems && contestProblems.length > 0 ? (
            contestProblems.map((cp) => (
              <Card key={cp.id} className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-xs text-indigo-400 font-bold font-mono">
                    Problem #{cp.problem_order} ({cp.score_weight} pts)
                  </span>
                  <h3 className="text-base font-semibold text-slate-100">
                    {cp.problem?.title ?? `Contest Challenge #${cp.problem_order}`}
                  </h3>
                </div>

                {isRegistered ? (
                  <Link
                    href={`/problems/${cp.problem?.slug ?? "two-sum"}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Solve
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Register to unlock
                  </span>
                )}
              </Card>
            ))
          ) : (
            <>
              <Card className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-xs text-indigo-400 font-bold font-mono">
                    Problem A (100 pts)
                  </span>
                  <h3 className="text-base font-semibold text-slate-100">
                    Two Sum & Array Hash Maps
                  </h3>
                </div>
                <Link
                  href="/problems/two-sum"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Solve
                </Link>
              </Card>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Contest Leaderboard
        </h2>

        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Rank</th>
                <th className="p-3.5 font-semibold">Participant</th>
                <th className="p-3.5 font-semibold text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {participants && participants.length > 0 ? (
                participants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold">#{idx + 1}</td>
                    <td className="p-3.5 font-semibold text-slate-100">
                      @{p.profile?.username ?? "user"}
                    </td>
                    <td className="p-3.5 text-right font-mono text-emerald-400 font-bold">
                      {p.score} pts
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-500">
                    Leaderboard will update dynamically as participants solve problems.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

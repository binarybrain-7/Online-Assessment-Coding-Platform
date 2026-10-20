import Link from "next/link";
import { Trophy, Medal, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Profile } from "@/types";

export interface LeaderboardPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 10;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("problems_solved", { ascending: false })
    .order("contest_rating", { ascending: false })
    .range(from, to);

  const profiles: Profile[] = profilesData ?? [
    {
      id: "1",
      username: "alex_coder",
      full_name: "Alex Rivera",
      profile_picture_url: null,
      bio: "Algorithm enthusiast & Competitive programmer",
      problems_solved: 342,
      contests_played: 28,
      contest_rating: 2150,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      username: "sarah_dev",
      full_name: "Sarah Chen",
      profile_picture_url: null,
      bio: "Full Stack Engineer & Open Source contributor",
      problems_solved: 289,
      contests_played: 22,
      contest_rating: 1980,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  let currentUserProfile: Profile | null = null;
  let currentUserRank: number | null = null;

  if (user) {
    const { data: currProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (currProfile) {
      currentUserProfile = currProfile;
      const { count: higherCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gt("problems_solved", currProfile.problems_solved);

      currentUserRank = (higherCount ?? 0) + 1;
    }
  }

  const getRankBadge = (rankIndex: number) => {
    if (rankIndex === 1) return <Medal className="w-5 h-5 text-amber-400" />;
    if (rankIndex === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rankIndex === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-mono text-xs font-bold text-slate-400">#{rankIndex}</span>;
  };

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400">
          <Trophy className="w-3.5 h-3.5" /> Hall of Fame
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Global Leaderboard</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Rankings based on total verified problem solutions and contest ratings.
        </p>
      </div>

      {currentUserProfile && (
        <Card className="glass-panel p-4 border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Your Current Rank</span>
              <p className="text-base font-bold text-slate-100">
                @{currentUserProfile.username}{" "}
                <span className="text-xs text-indigo-400 font-mono">
                  (Rank #{currentUserRank})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-400">Solved: </span>
              <span className="text-blue-400 font-bold">{currentUserProfile.problems_solved}</span>
            </div>
            <div>
              <span className="text-slate-400">Rating: </span>
              <span className="text-amber-400 font-bold">{currentUserProfile.contest_rating}</span>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold text-center">Problems Solved</th>
              <th className="p-4 font-semibold text-center">Contest Rating</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {profiles.map((p, idx) => {
              const rank = (page - 1) * pageSize + idx + 1;
              const isSelf = user?.id === p.id;

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSelf ? "bg-indigo-500/10" : ""
                  }`}
                >
                  <td className="p-4 flex items-center gap-2">
                    {getRankBadge(rank)}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/profile/${p.username}`}
                      className="font-bold text-slate-100 hover:text-blue-400 transition-colors"
                    >
                      {p.full_name || p.username}
                      <span className="text-slate-400 font-normal font-mono ml-1 text-[11px]">
                        @{p.username}
                      </span>
                    </Link>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-blue-400">
                    {p.problems_solved}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-amber-400">
                    {p.contest_rating}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/profile/${p.username}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

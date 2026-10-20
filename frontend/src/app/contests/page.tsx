import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ContestCard } from "@/components/contests/ContestCard";
import { Contest } from "@/types";

export default async function ContestsPage() {
  const supabase = await createClient();

  const { data: contestsData } = await supabase
    .from("contests")
    .select("*")
    .eq("is_published", true)
    .order("start_time", { ascending: true });

  const now = new Date();

  const upcoming: Contest[] = [];
  const ongoing: Contest[] = [];
  const past: Contest[] = [];

  if (contestsData && contestsData.length > 0) {
    contestsData.forEach((c) => {
      const start = new Date(c.start_time);
      const end = new Date(c.end_time);
      if (now < start) upcoming.push(c);
      else if (now >= start && now <= end) ongoing.push(c);
      else past.push(c);
    });
  } else {
    ongoing.push({
      id: 1,
      title: "Weekly Algorithmic Clash #42",
      slug: "weekly-algorithmic-clash-42",
      description: "Compete against global developers in 4 competitive programming challenges.",
      start_time: new Date(Date.now() - 3600000).toISOString(),
      end_time: new Date(Date.now() + 7200000).toISOString(),
      is_published: true,
      created_at: new Date().toISOString(),
      participants_count: 142,
    });

    upcoming.push({
      id: 2,
      title: "Full-Stack Development Hackathon 2026",
      slug: "full-stack-dev-hackathon-2026",
      description: "Multi-file React and Node backend project contest evaluated on architecture and accuracy.",
      start_time: new Date(Date.now() + 86400000).toISOString(),
      end_time: new Date(Date.now() + 172800000).toISOString(),
      is_published: true,
      created_at: new Date().toISOString(),
      participants_count: 89,
    });
  }

  return (
    <div className="space-y-10 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400">
          <Trophy className="w-3.5 h-3.5" /> Competitive Arena
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Contests</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Test your speed and problem-solving skills in timed competitive programming tournaments.
        </p>
      </div>

      {ongoing.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            Live & Ongoing Contests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoing.map((c) => (
              <ContestCard key={c.id} contest={c} type="ongoing" />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Upcoming Contests</h2>
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((c) => (
              <ContestCard key={c.id} contest={c} type="upcoming" />
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 glass-panel p-6 rounded-xl text-center">
            No upcoming contests scheduled at the moment.
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100">Past Contests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map((c) => (
              <ContestCard key={c.id} contest={c} type="past" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

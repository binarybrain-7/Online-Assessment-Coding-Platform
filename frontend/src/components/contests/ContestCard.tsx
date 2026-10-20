import Link from "next/link";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { Contest } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTimeRemaining } from "@/lib/utils";

export interface ContestCardProps {
  contest: Contest;
  type: "upcoming" | "ongoing" | "past";
}

export function ContestCard({ contest, type }: ContestCardProps) {
  const badgeVariant =
    type === "ongoing" ? "emerald" : type === "upcoming" ? "blue" : "outline";

  return (
    <Card className="hover:border-indigo-500/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={badgeVariant} className="uppercase tracking-wider">
            {type}
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {contest.participants_count ?? 0} participants
          </span>
        </div>

        <Link
          href={`/contests/${contest.slug}`}
          className="text-lg font-bold text-slate-100 hover:text-indigo-400 transition-colors block mb-2"
        >
          {contest.title}
        </Link>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {contest.description}
        </p>
      </div>

      <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDate(contest.start_time)}</span>
        </div>

        {type === "ongoing" ? (
          <span className="text-emerald-400 font-mono font-semibold animate-pulse">
            {formatTimeRemaining(contest.end_time)}
          </span>
        ) : (
          <Link
            href={`/contests/${contest.slug}`}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </Card>
  );
}

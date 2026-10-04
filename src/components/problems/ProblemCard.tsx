import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Problem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export interface ProblemCardProps {
  problem: Problem;
  isSolved?: boolean;
}

export function ProblemCard({ problem, isSolved }: ProblemCardProps) {
  const difficultyVariant =
    problem.difficulty === "Easy"
      ? "easy"
      : problem.difficulty === "Medium"
      ? "medium"
      : "hard";

  return (
    <Card className="hover:border-blue-500/40 transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isSolved && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/problems/${problem.slug}`}
              className="text-base font-semibold text-slate-100 hover:text-blue-400 transition-colors truncate block"
            >
              {problem.title}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={difficultyVariant}>{problem.difficulty}</Badge>

              {problem.problem_type && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {problem.problem_type.name.toUpperCase()}
                </span>
              )}

              {problem.categories &&
                problem.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    #{cat.name}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <Link
          href={`/problems/${problem.slug}`}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white transition-all shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </Card>
  );
}

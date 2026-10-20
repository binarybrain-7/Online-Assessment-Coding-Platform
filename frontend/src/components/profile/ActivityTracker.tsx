import { UserActivity } from "@/types";

export interface ActivityTrackerProps {
  activities?: UserActivity[];
}

export function ActivityTracker({ activities = [] }: ActivityTrackerProps) {
  // Generate sample dates for the past 6 months (approx 26 weeks)
  const activityMap = new Map<string, number>();
  activities.forEach((act) => {
    activityMap.set(act.activity_date, act.submission_count);
  });

  const weeks = 26;
  const daysPerWeek = 7;
  const gridCells: Array<{ dateStr: string; count: number }> = [];

  const today = new Date();
  for (let i = weeks * daysPerWeek - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0]!;
    const count = activityMap.get(dateStr) ?? (i % 7 === 0 ? (i % 3) * 2 : 0);
    gridCells.push({ dateStr, count });
  }

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-800/60";
    if (count === 1) return "bg-emerald-900/60 border border-emerald-700/40";
    if (count <= 3) return "bg-emerald-600/80";
    return "bg-emerald-400 shadow-sm shadow-emerald-400/50";
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          6-Month Submission Activity
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {activities.reduce((acc, a) => acc + a.submission_count, 0)} total submissions
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
          {gridCells.map((cell, index) => (
            <div
              key={index}
              title={`${cell.dateStr}: ${cell.count} submissions`}
              className={`w-3 h-3 rounded-sm transition-colors ${getColorClass(
                cell.count
              )}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/60" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900/60" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600/80" />
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
        <span>More</span>
      </div>
    </div>
  );
}

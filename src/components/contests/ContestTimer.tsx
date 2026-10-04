"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";

export interface ContestTimerProps {
  endTime: string;
}

export function ContestTimer({ endTime }: ContestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    setTimeLeft(formatTimeRemaining(endTime));
    const interval = setInterval(() => {
      setTimeLeft(formatTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm font-mono text-emerald-400 font-bold shadow-lg">
      <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
      <span>{timeLeft || "Calculating..."}</span>
    </div>
  );
}

"use client";

import { Search, RotateCcw } from "lucide-react";
import { Category, ProblemType } from "@/types";

export interface ProblemFiltersProps {
  search: string;
  category: string;
  type: string;
  difficulty: string;
  categories: Category[];
  types: ProblemType[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onReset: () => void;
}

export function ProblemFilters({
  search,
  category,
  type,
  difficulty,
  categories,
  types,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onDifficultyChange,
  onReset,
}: ProblemFiltersProps) {
  return (
    <div className="glass-panel p-4 rounded-xl space-y-4 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by problem title, slug, or keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full md:w-36 px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full md:w-36 px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Problem Types</option>
            {types.length > 0 ? (
              types.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name.toUpperCase()}
                </option>
              ))
            ) : (
              <>
                <option value="dsa">DSA</option>
                <option value="development">Development</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash</option>
              </>
            )}
          </select>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full md:w-40 px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={onReset}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

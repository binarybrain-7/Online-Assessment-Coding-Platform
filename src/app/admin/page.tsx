import Link from "next/link";
import { ShieldAlert, Code2, Trophy, FolderPlus, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400">
          <ShieldAlert className="w-3.5 h-3.5" /> Platform Control Center
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage platform problems, test cases, contests, and categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Problems Management */}
        <Card className="p-6 space-y-4 flex flex-col justify-between border-t-2 border-t-blue-500">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Problem Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create DSA, Development, SQL, and Bash problems. Upload test case files (CSV/JSON/XLSX) and configure starter files.
            </p>
          </div>

          <Link href="/admin/problems/create">
            <Button variant="gradient" className="w-full text-xs">
              <Plus className="w-4 h-4 mr-1.5" /> Create New Problem
            </Button>
          </Link>
        </Card>

        {/* Contests Management */}
        <Card className="p-6 space-y-4 flex flex-col justify-between border-t-2 border-t-amber-500">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Contest Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Schedule competitive programming tournaments, assign problem weights, and set start/end timestamps.
            </p>
          </div>

          <Link href="/admin/contests/create">
            <Button variant="secondary" className="w-full text-xs text-amber-400 border-amber-500/30">
              <Plus className="w-4 h-4 mr-1.5" /> Schedule Contest
            </Button>
          </Link>
        </Card>

        {/* Category Management */}
        <Card className="p-6 space-y-4 flex flex-col justify-between border-t-2 border-t-emerald-500">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Category Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define topic categories, icons, and descriptions to organize practice problems effectively.
            </p>
          </div>

          <Link href="/admin/categories/create">
            <Button variant="secondary" className="w-full text-xs text-emerald-400 border-emerald-500/30">
              <Plus className="w-4 h-4 mr-1.5" /> Add Category
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

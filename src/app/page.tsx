import Link from "next/link";
import {
  Code2,
  Terminal,
  Database,
  Sparkles,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative overflow-hidden py-12">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-purple-600/20 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Next-Gen Competitive Programming & AI Evaluation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Master Coding with <br />
          <span className="gradient-text">Real-Time Execution</span> & AI Insights
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Solve Data Structures, Development Projects, SQL Queries, and Bash Scripts. Compare against global leaderboards and get AI code analysis on readability and architecture.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/signup">
            <Button variant="gradient" size="lg">
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/problems">
            <Button variant="outline" size="lg">
              Explore Problems
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem Types Highlight Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Four Core Problem Domains
          </h2>
          <p className="text-sm text-slate-400">
            One unified platform designed for algorithm masters and full-stack software engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3 border-t-2 border-t-blue-500">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">DSA Algorithms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arrays, Trees, Dynamic Programming, Graphs, and Recursion with strict time & memory limits.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border-t-2 border-t-purple-500">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Development</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-file frontend & backend project starter setups evaluated with full workspace integration.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border-t-2 border-t-emerald-500">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">SQL Queries</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real PostgreSQL schema manipulation, joins, window functions, and database optimization.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border-t-2 border-t-amber-500">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Bash Scripts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              System automation, regex text processing, pipe commands, and Linux process management.
            </p>
          </div>
        </div>
      </section>

      {/* Features & AI Analysis Highlight */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Badge variant="purple">AI Code Analysis</Badge>
          <h2 className="text-3xl font-bold text-slate-100 leading-snug">
            Beyond Correct Output — Inspect Clean Code & Architecture
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            When all test cases pass, our automated AI analysis grades your code on Readability, Security, Naming Conventions, Modularity, and Design Patterns.
          </p>

          <ul className="space-y-3 text-xs text-slate-300 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Detailed line-by-line feedback & refactoring suggestions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Combined accuracy & quality scores on global leaderboards
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Persistent saved solutions for past solved challenges
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-slate-400 font-sans font-semibold">AI Evaluation Metrics</span>
            <span className="text-emerald-400 font-bold font-sans">Score: 95.5 / 100</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Readability & Naming</span>
                <span className="text-blue-400">95%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[95%] h-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Maintainability & Modularity</span>
                <span className="text-purple-400">90%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[90%] h-full bg-purple-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Security & Design Patterns</span>
                <span className="text-emerald-400">98%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[98%] h-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contests & Community Callout */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-100">
          Ready to Test Your Skills?
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Join scheduled contests, climb the global ranking leaderboard, and discuss solutions with top software engineers worldwide.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/contests">
            <Button variant="gradient" size="md">
              <Users className="w-4 h-4 mr-2" />
              View Active Contests
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="md">
              <Users className="w-4 h-4 mr-2" />
              Global Leaderboard
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

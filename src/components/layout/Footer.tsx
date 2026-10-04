import Link from "next/link";
import { Code2, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-base font-bold text-white">ApexCode</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Next-generation competitive programming platform empowering developers to learn, compete, and excel.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/problems" className="hover:text-white transition-colors">Problems</Link></li>
            <li><Link href="/contests" className="hover:text-white transition-colors">Contests</Link></li>
            <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
            <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Community</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/posts" className="hover:text-white transition-colors">Discussion Board</Link></li>
            <li><Link href="/posts/create" className="hover:text-white transition-colors">Share Post</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Discord Server</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Backend Architecture</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Frontend powered by Next.js App Router on Vercel. Code execution handled independently via Spring Boot & Isolated Docker containers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} ApexCode. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Built with Next.js & Supabase
        </span>
      </div>
    </footer>
  );
}

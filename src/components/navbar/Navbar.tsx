"use client";

import { useState, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  MessageSquare,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../layout/ThemeProvider";

export interface NavbarProps {
  userRole?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

export function Navbar({ userRole, username, avatarUrl }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href={username ? "/home" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              ApexCode
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            <Link
              href="/problems"
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Problems
            </Link>
            <Link
              href="/contests"
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Contests
            </Link>
            <Link
              href="/categories"
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/leaderboard"
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/posts"
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Community
            </Link>
            {userRole === "admin" && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden lg:flex flex-1 max-w-xs relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems, users, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-full text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-sm font-semibold text-slate-200">Notifications</span>
                  <span className="text-xs text-blue-400 cursor-pointer">Mark all as read</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800">
                    <p className="font-semibold text-slate-200">Weekly Contest #42 Live!</p>
                    <p className="text-slate-400">Join now and win rating points.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800">
                    <p className="font-semibold text-slate-200">Submission Evaluated</p>
                    <p className="text-slate-400">Two Sum submission passed all test cases.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {username ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold border border-slate-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-100 truncate">@{username}</p>
                  </div>
                  <Link
                    href={`/profile/${username}`}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <User className="w-4 h-4" />
                    Your Profile
                  </Link>
                  <Link
                    href="/posts/create"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Create Post
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 hover:text-rose-300 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-slate-800 bg-slate-950 space-y-3">
          <div className="relative my-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/problems"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900"
            >
              Problems
            </Link>
            <Link
              href="/contests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900"
            >
              Contests
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900"
            >
              Categories
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900"
            >
              Leaderboard
            </Link>
            <Link
              href="/posts"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900"
            >
              Community
            </Link>
            {userRole === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-amber-400 bg-amber-500/10"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

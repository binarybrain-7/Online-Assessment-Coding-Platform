import { Profile, UserSocialLink, UserBadge } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Code, Award, ExternalLink } from "lucide-react";

export interface UserStatsCardProps {
  profile: Profile;
  socialLinks?: UserSocialLink[];
  badges?: UserBadge[];
}

export function UserStatsCard({
  profile,
  socialLinks = [],
  badges = [],
}: UserStatsCardProps) {
  return (
    <Card className="space-y-6">
      {/* Header Avatar & Basic Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-1 shrink-0 shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-100">
              {profile.full_name || profile.username}
            </h1>
            <span className="text-sm font-semibold text-slate-400 font-mono">
              @{profile.username}
            </span>
            {profile.role === "admin" && (
              <Badge variant="amber">Admin</Badge>
            )}
          </div>

          {profile.bio && (
            <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20"
                >
                  {link.platform} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="text-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
            <Code className="w-3.5 h-3.5 text-blue-400" />
            Problems Solved
          </div>
          <p className="text-xl font-bold text-blue-400">
            {profile.problems_solved}
          </p>
        </div>

        <div className="text-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Rating
          </div>
          <p className="text-xl font-bold text-amber-400">
            {profile.contest_rating}
          </p>
        </div>

        <div className="text-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            Contests
          </div>
          <p className="text-xl font-bold text-purple-400">
            {profile.contests_played}
          </p>
        </div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Earned Badges ({badges.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 text-xs font-medium text-purple-200"
              >
                <span>🏆</span>
                <span>{ub.badge?.name || "Achievement"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

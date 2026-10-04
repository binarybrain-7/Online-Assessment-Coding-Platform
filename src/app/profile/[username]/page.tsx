import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserStatsCard } from "@/components/profile/UserStatsCard";
import { ActivityTracker } from "@/components/profile/ActivityTracker";
import { Profile, UserSocialLink, UserBadge, UserActivity } from "@/types";

export interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfileDetailPage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Load target profile by username
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  const profile: Profile = profileData ?? {
    id: "sample-id",
    username: username,
    full_name: username.toUpperCase(),
    profile_picture_url: null,
    bio: "Software developer & Algorithm competitor.",
    problems_solved: 124,
    contests_played: 12,
    contest_rating: 1650,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!profile) {
    notFound();
  }

  // Load social links
  const { data: socialLinks } = await supabase
    .from("user_social_links")
    .select("*")
    .eq("user_id", profile.id);

  // Load user badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select(`
      *,
      badge:badges(*)
    `)
    .eq("user_id", profile.id);

  // Load user submission activity for heat map
  const { data: activities } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", profile.id);

  return (
    <div className="space-y-8 py-4">
      {/* Profile Overview Card */}
      <UserStatsCard
        profile={profile}
        socialLinks={(socialLinks as UserSocialLink[]) ?? []}
        badges={(userBadges as UserBadge[]) ?? []}
      />

      {/* 6-Month Activity Heat Map */}
      <ActivityTracker activities={(activities as UserActivity[]) ?? []} />
    </div>
  );
}

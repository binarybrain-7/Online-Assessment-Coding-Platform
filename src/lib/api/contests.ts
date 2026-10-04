import { apiRequest } from "./client";
import {
  Contest,
  ContestParticipant,
  ContestProblem,
  ContestSubmission,
} from "@/types";

export async function fetchContests(): Promise<{
  upcoming: Contest[];
  ongoing: Contest[];
  past: Contest[];
}> {
  const response = await apiRequest<{
    upcoming: Contest[];
    ongoing: Contest[];
    past: Contest[];
  }>("/contests");

  if (response.success && response.data) {
    return response.data;
  }

  return { upcoming: [], ongoing: [], past: [] };
}

export async function fetchContestBySlug(slug: string): Promise<Contest | null> {
  const response = await apiRequest<Contest>(`/contests/slug/${slug}`);
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

export async function fetchContestProblems(
  contestId: number
): Promise<ContestProblem[]> {
  const response = await apiRequest<ContestProblem[]>(
    `/contests/${contestId}/problems`
  );
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

export async function fetchContestLeaderboard(
  contestId: number
): Promise<ContestParticipant[]> {
  const response = await apiRequest<ContestParticipant[]>(
    `/contests/${contestId}/leaderboard`
  );
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

export async function registerForContest(
  contestId: number,
  userId: string
): Promise<boolean> {
  const response = await apiRequest<{ registered: boolean }>(
    `/contests/${contestId}/register`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    }
  );
  return response.success;
}

export async function submitContestProblem(payload: {
  contestId: number;
  problemId: number;
  userId: string;
  code: string;
  language: string;
}): Promise<ContestSubmission | null> {
  const response = await apiRequest<ContestSubmission>(
    `/contests/${payload.contestId}/submissions`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

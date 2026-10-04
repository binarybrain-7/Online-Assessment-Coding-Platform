import { apiRequest } from "./client";
import { CodeAnalysis, CodeAnalysisFeedback } from "@/types";

export interface DetailedAnalysisResponse {
  analysis: CodeAnalysis;
  feedback: CodeAnalysisFeedback[];
}

export async function fetchSubmissionAnalysis(
  submissionId: string
): Promise<DetailedAnalysisResponse | null> {
  const response = await apiRequest<DetailedAnalysisResponse>(
    `/submissions/${submissionId}/analysis`
  );

  if (response.success && response.data) {
    return response.data;
  }

  return null;
}

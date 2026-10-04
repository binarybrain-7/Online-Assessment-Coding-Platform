import { apiRequest } from "./client";
import {
  Problem,
  Category,
  Tag,
  ProblemType,
  TestCase,
  ProblemFile,
  PaginatedResult,
} from "@/types";

export interface ProblemFilterParams {
  search?: string;
  category?: string;
  type?: string;
  difficulty?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchProblems(
  params: ProblemFilterParams = {}
): Promise<PaginatedResult<Problem>> {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.type) query.append("type", params.type);
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.page) query.append("page", params.page.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());

  const response = await apiRequest<PaginatedResult<Problem>>(
    `/problems?${query.toString()}`
  );

  if (response.success && response.data) {
    return response.data;
  }

  // Fallback pagination envelope when Spring Boot backend is offline
  return {
    items: [],
    total: 0,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    totalPages: 0,
  };
}

export async function fetchProblemBySlug(
  slug: string
): Promise<Problem | null> {
  const response = await apiRequest<Problem>(`/problems/slug/${slug}`);
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiRequest<Category[]>("/categories");
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

export async function fetchProblemTypes(): Promise<ProblemType[]> {
  const response = await apiRequest<ProblemType[]>("/problem-types");
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

export async function fetchProblemTags(): Promise<Tag[]> {
  const response = await apiRequest<Tag[]>("/tags");
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

export async function fetchProblemTestCases(
  problemId: number
): Promise<TestCase[]> {
  const response = await apiRequest<TestCase[]>(
    `/problems/${problemId}/test-cases`
  );
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

export async function fetchProblemFiles(
  problemId: number
): Promise<ProblemFile[]> {
  const response = await apiRequest<ProblemFile[]>(
    `/problems/${problemId}/files`
  );
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

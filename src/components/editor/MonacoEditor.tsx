"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Send,
  FileCode,
  FolderTree,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Cpu,
  Sparkles,
  History,
  FileCheck,
  FileText,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import {
  ProblemFile,
  ExecutionResult,
  Submission,
  TestCase,
  Problem,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { submitProblemSolution } from "@/lib/api/submissions";

export interface MonacoEditorProps {
  problem?: Problem;
  problemId: number;
  problemType: "dsa" | "development" | "sql" | "bash" | string;
  initialFiles?: ProblemFile[];
  testCases?: TestCase[];
  previousSubmission?: Submission | null;
  publicSubmissions?: Submission[];
  onSubmissionSuccess?: (result: ExecutionResult) => void;
}

// Starter boilerplate templates for each supported language
const STARTER_TEMPLATES: Record<
  string,
  {
    twoSum: string;
    generic: (title?: string) => string;
  }
> = {
  java: {
    twoSum: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
        return new int[]{};
    }
}`,
    generic: (title?: string) => `class Solution {
    public void solve() {
        // Write your solution for ${title || "this problem"} here
        
    }
}`,
  },
  cpp: {
    twoSum: `#include <vector>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Write your solution here
        
        return {};
    }
};`,
    generic: (title?: string) => `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Solution {
public:
    void solve() {
        // Write your solution for ${title || "this problem"} here
        
    }
};`,
  },
  python: {
    twoSum: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
    generic: (title?: string) => `class Solution:
    def solve(self):
        # Write your solution for ${title || "this problem"} here
        pass`,
  },
  javascript: {
    twoSum: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    return [];
}`,
    generic: () => `// Write your solution here
function solve(input) {
    return input;
}`,
  },
  typescript: {
    twoSum: `function twoSum(nums: number[], target: number): number[] {
    // Write your solution here
    return [];
}`,
    generic: () => `// Write your solution here
function solve(input: any): any {
    return input;
}`,
  },
};

function getStarterCode(
  problemSlug: string,
  problemTitle: string,
  language: string
): string {
  const isTwoSum =
    problemSlug === "two-sum" ||
    problemTitle.toLowerCase().includes("two sum");

  const langKey = language.toLowerCase();
  const template = STARTER_TEMPLATES[langKey];
  if (template) {
    return isTwoSum ? template.twoSum : template.generic(problemTitle);
  }

  if (langKey === "sql") {
    return `-- Write your SQL query here\nSELECT * FROM table_name;`;
  }
  if (langKey === "bash" || langKey === "shell") {
    return `#!/bin/bash\n# Write your bash script here\n`;
  }

  return isTwoSum
    ? `class Solution {\n    // Solution implementation\n}`
    : `// Write your solution here\nfunction solve(input) {\n    return input;\n}`;
}

function getFileExtension(language: string): string {
  switch (language.toLowerCase()) {
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    case "python":
      return "py";
    case "typescript":
      return "ts";
    case "sql":
      return "sql";
    case "bash":
    case "shell":
      return "sh";
    default:
      return "js";
  }
}

function getMonacoLanguage(language: string): string {
  switch (language.toLowerCase()) {
    case "java":
      return "java";
    case "cpp":
      return "cpp";
    case "python":
      return "python";
    case "typescript":
      return "typescript";
    case "sql":
      return "sql";
    case "bash":
    case "shell":
      return "shell";
    default:
      return "javascript";
  }
}

export function MonacoEditor({
  problem,
  problemId,
  problemType,
  initialFiles = [],
  testCases = [],
  previousSubmission = null,
  publicSubmissions = [],
  onSubmissionSuccess,
}: MonacoEditorProps) {
  const problemSlug = problem?.slug ?? "two-sum";
  const problemTitle = problem?.title ?? "Two Sum";

  // Default language logic: prefer Java for DSA problems unless previous submission exists
  const defaultLanguage =
    problemType === "sql"
      ? "sql"
      : problemType === "bash"
      ? "shell"
      : problemType === "development"
      ? "javascript"
      : previousSubmission?.language &&
        ["java", "cpp", "python"].includes(previousSubmission.language.toLowerCase())
      ? previousSubmission.language.toLowerCase()
      : "java";

  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);

  // Maintain user code cache per language so code is preserved across language changes
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {
      java: getStarterCode(problemSlug, problemTitle, "java"),
      cpp: getStarterCode(problemSlug, problemTitle, "cpp"),
      python: getStarterCode(problemSlug, problemTitle, "python"),
    };
    if (previousSubmission?.code && previousSubmission.language) {
      initialMap[previousSubmission.language.toLowerCase()] = previousSubmission.code;
    }
    return initialMap;
  });

  // Files state (multi-file support for development problems)
  const [files, setFiles] = useState<ProblemFile[]>(() => {
    if (initialFiles.length > 0) return initialFiles;

    const initialCode =
      codeByLanguage[defaultLanguage] ??
      getStarterCode(problemSlug, problemTitle, defaultLanguage);

    return [
      {
        id: 1,
        problem_id: problemId,
        file_path: `Solution.${getFileExtension(defaultLanguage)}`,
        file_content: initialCode,
        language: getMonacoLanguage(defaultLanguage),
        is_editable: true,
        is_entry_point: true,
      },
    ];
  });

  const [activeFilePath, setActiveFilePath] = useState<string>(
    files[0]?.file_path ?? `Solution.${getFileExtension(defaultLanguage)}`
  );

  // Left panel active tab: 'description' | 'results' | 'analysis' | 'saved' | 'submissions'
  const [activeLeftTab, setActiveLeftTab] = useState<
    "description" | "results" | "analysis" | "saved" | "submissions"
  >("description");

  // Bottom test case active tab index
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Prepare display test cases with robust fallbacks
  const displayTestCases: TestCase[] =
    testCases.filter((tc) => !tc.is_hidden).length > 0
      ? testCases.filter((tc) => !tc.is_hidden)
      : problemSlug === "two-sum" || problemTitle.toLowerCase().includes("two sum")
      ? [
          {
            id: 1,
            problem_id: problemId,
            input_data: "nums = [2,7,11,15], target = 9",
            expected_output: "[0, 1]",
            is_hidden: false,
            weight: 1,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            problem_id: problemId,
            input_data: "nums = [3,2,4], target = 6",
            expected_output: "[1, 2]",
            is_hidden: false,
            weight: 1,
            created_at: new Date().toISOString(),
          },
          {
            id: 3,
            problem_id: problemId,
            input_data: "nums = [3,3], target = 6",
            expected_output: "[0, 1]",
            is_hidden: false,
            weight: 1,
            created_at: new Date().toISOString(),
          },
        ]
      : [
          {
            id: 1,
            problem_id: problemId,
            input_data: "input = [1, 2, 3]",
            expected_output: "[1, 2, 3]",
            is_hidden: false,
            weight: 1,
            created_at: new Date().toISOString(),
          },
        ];

  const currentTestCase = displayTestCases[selectedTestCaseIndex] ?? displayTestCases[0];

  const activeFile = files.find((f) => f.file_path === activeFilePath) ?? files[0];

  // Handler for code changes in Monaco
  const handleCodeChange = (value?: string) => {
    const code = value ?? "";
    setCodeByLanguage((prev) => ({
      ...prev,
      [selectedLanguage]: code,
    }));
    setFiles((prevFiles) =>
      prevFiles.map((f) =>
        f.file_path === activeFile?.file_path ? { ...f, file_content: code } : f
      )
    );
  };

  // Handler for language switch: updates syntax, starter code, and Monaco language
  const handleLanguageChange = (newLang: string) => {
    const currentCode = activeFile?.file_content ?? "";
    const updatedCodeMap = {
      ...codeByLanguage,
      [selectedLanguage]: currentCode,
    };

    // Retrieve previous code for new language or generate starter template
    const nextCode =
      updatedCodeMap[newLang] ??
      getStarterCode(problemSlug, problemTitle, newLang);

    updatedCodeMap[newLang] = nextCode;
    setCodeByLanguage(updatedCodeMap);
    setSelectedLanguage(newLang);

    const newExt = getFileExtension(newLang);
    const newFileName = `Solution.${newExt}`;
    const newMonacoLang = getMonacoLanguage(newLang);

    setFiles((prev) =>
      prev.map((f, idx) =>
        idx === 0
          ? {
              ...f,
              file_path: newFileName,
              file_content: nextCode,
              language: newMonacoLang,
            }
          : f
      )
    );
    setActiveFilePath(newFileName);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveLeftTab("results");
    try {
      const result = await submitProblemSolution({
        problemId,
        language: selectedLanguage,
        code: activeFile?.file_content ?? "",
        files: files.map((f) => ({
          file_path: f.file_path,
          file_content: f.file_content,
          language: f.language,
        })),
      });
      setExecutionResult(result);
    } catch {
      // Handled in API layer fallback
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveLeftTab("results");
    try {
      const result = await submitProblemSolution({
        problemId,
        language: selectedLanguage,
        code: activeFile?.file_content ?? "",
        files: files.map((f) => ({
          file_path: f.file_path,
          file_content: f.file_content,
          language: f.language,
        })),
      });
      setExecutionResult(result);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(result);
      }
    } catch {
      // Handled in API layer fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySavedCode = () => {
    if (previousSubmission?.code) {
      navigator.clipboard.writeText(previousSubmission.code);
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
    }
  };

  const difficultyVariant =
    problem?.difficulty === "Easy"
      ? "easy"
      : problem?.difficulty === "Medium"
      ? "medium"
      : "hard";

  const problemTypeName = problem?.problem_type?.name ?? problemType ?? "dsa";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ======================================================== */}
      {/* LEFT PANEL: Description, Execution Results, AI Analysis, */}
      {/* Saved Solution, Submissions (LeetCode style layout)      */}
      {/* ======================================================== */}
      <div className="lg:col-span-5 flex flex-col h-[750px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Left Panel Tabs Bar */}
        <div className="flex items-center gap-0.5 px-2 bg-slate-900 border-b border-slate-800 text-xs font-medium text-slate-400 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveLeftTab("description")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeLeftTab === "description"
                ? "border-blue-500 text-blue-400 font-semibold bg-slate-800/40"
                : "border-transparent hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Description
          </button>
          <button
            onClick={() => setActiveLeftTab("results")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeLeftTab === "results"
                ? "border-blue-500 text-blue-400 font-semibold bg-slate-800/40"
                : "border-transparent hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Execution Results
            {executionResult && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  executionResult.status === "Accepted"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {executionResult.status}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveLeftTab("analysis")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeLeftTab === "analysis"
                ? "border-purple-500 text-purple-400 font-semibold bg-slate-800/40"
                : "border-transparent hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Analysis
          </button>
          <button
            onClick={() => setActiveLeftTab("saved")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeLeftTab === "saved"
                ? "border-emerald-500 text-emerald-400 font-semibold bg-slate-800/40"
                : "border-transparent hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            Saved Solution
          </button>
          <button
            onClick={() => setActiveLeftTab("submissions")}
            className={`px-3 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeLeftTab === "submissions"
                ? "border-amber-500 text-amber-400 font-semibold bg-slate-800/40"
                : "border-transparent hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            Submissions ({publicSubmissions.length})
          </button>
        </div>

        {/* Left Panel Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-slate-300 space-y-5">
          {/* TAB 1: DESCRIPTION */}
          {activeLeftTab === "description" && (
            <div className="space-y-5">
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  {problem?.difficulty && (
                    <Badge variant={difficultyVariant}>{problem.difficulty}</Badge>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                    {problemTypeName}
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold text-slate-100">
                  {problemTitle}
                </h1>

                {problem?.categories && problem.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {problem.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {problem?.description && (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: problem.description.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              )}

              {problem?.constraints && (
                <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Constraints
                  </h4>
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {problem.constraints}
                  </pre>
                </div>
              )}

              {problem?.hints && problem.hints.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Hints
                  </h4>
                  <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
                    {problem.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXECUTION RESULTS */}
          {activeLeftTab === "results" && (
            <div>
              {isRunning || isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-200">
                    {isSubmitting ? "Submitting code against all test cases..." : "Running code with test cases..."}
                  </p>
                  <p className="text-xs text-slate-500">
                    Executing in sandbox environment...
                  </p>
                </div>
              ) : !executionResult ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Play className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    No Execution Results Yet
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Press &quot;Run Code&quot; or &quot;Submit Solution&quot; in the editor toolbar to run your code and inspect results here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {/* Status Banner */}
                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {executionResult.status === "Accepted" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <span
                          className={`text-base font-bold ${
                            executionResult.status === "Accepted"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {executionResult.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({executionResult.testsPassed}/{executionResult.testsTotal} passed)
                        </span>
                      </div>

                      <Badge
                        variant={
                          executionResult.status === "Accepted" ? "emerald" : "hard"
                        }
                      >
                        Score: {executionResult.accuracyScore}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-[11px] text-slate-500">Runtime</p>
                          <p className="font-semibold text-slate-200">{executionResult.runtimeMs} ms</p>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-[11px] text-slate-500">Memory</p>
                          <p className="font-semibold text-slate-200">
                            {(executionResult.memoryKb / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Test Results */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Test Cases Results
                    </h4>
                    {executionResult.testResults.map((tr, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded bg-slate-900 border border-slate-800 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-semibold text-slate-300">
                            Test Case #{idx + 1}
                          </span>
                          <span
                            className={`font-sans font-bold text-xs ${
                              tr.status === "Passed"
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {tr.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs pt-1">
                          Actual Output:{" "}
                          <span className="text-slate-200">{tr.actualOutput}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI CODE ANALYSIS */}
          {activeLeftTab === "analysis" && (
            <div className="font-sans space-y-4">
              {executionResult?.analysis ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Readability</p>
                      <p className="text-xl font-bold text-blue-400 mt-1">
                        {executionResult.analysis.readabilityScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Maintainability</p>
                      <p className="text-xl font-bold text-purple-400 mt-1">
                        {executionResult.analysis.maintainabilityScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Architecture</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {executionResult.analysis.architectureScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Overall Score</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">
                        {executionResult.scores?.overallScore}%
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>AI Evaluation Summary</span>
                    </div>
                    <p className="text-slate-300">{executionResult.analysis.summary}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    No Analysis Generated Yet
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Run or submit your solution to receive AI Code Analysis on code readability, complexity, design patterns, and structure.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED SOLUTION */}
          {activeLeftTab === "saved" && (
            <div className="font-sans space-y-3">
              {previousSubmission ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Latest Submission:</span>
                      <Badge
                        variant={
                          previousSubmission.status === "Accepted"
                            ? "emerald"
                            : "hard"
                        }
                      >
                        {previousSubmission.status}
                      </Badge>
                    </div>
                    <span className="font-mono text-slate-400 uppercase">
                      {previousSubmission.language}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={handleCopySavedCode}
                      className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-xs flex items-center gap-1"
                      title="Copy Code"
                    >
                      {hasCopiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <pre className="p-4 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre">
                      {previousSubmission.code}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    No Saved Solution
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Submit your solution to save it to your profile for future reference.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMMUNITY SUBMISSIONS */}
          {activeLeftTab === "submissions" && (
            <div className="font-sans space-y-2">
              {publicSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <History className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    No Community Submissions
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Be the first to solve this problem and appear on the leaderboard!
                  </p>
                </div>
              ) : (
                publicSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-slate-200">
                        @{sub.profile?.username ?? "user"}
                      </span>
                      <Badge
                        variant={sub.status === "Accepted" ? "emerald" : "hard"}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                      <span className="uppercase text-slate-300">{sub.language}</span>
                      <span>{sub.runtime_ms} ms</span>
                      <span>{(sub.memory_kb / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Language Toggle (Java, C++, Python),        */}
      {/* Monaco Code Editor, and Bottom Panel with Test Cases ONLY */}
      {/* ======================================================== */}
      <div className="lg:col-span-7 flex flex-col h-[750px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
          {/* Language Selector (Java, C++, Python) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
              >
                {problemType === "sql" ? (
                  <option value="sql">PostgreSQL / SQL</option>
                ) : problemType === "bash" ? (
                  <option value="bash">Bash Script</option>
                ) : problemType === "development" ? (
                  <>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                  </>
                ) : (
                  <>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </>
                )}
              </select>
            </div>

            {/* Development multi-file tab selector */}
            {problemType === "development" && (
              <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                {files.map((file) => (
                  <button
                    key={file.file_path}
                    onClick={() => setActiveFilePath(file.file_path)}
                    className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                      activeFilePath === file.file_path
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {file.file_path}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run & Submit buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCode}
              isLoading={isRunning}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              <Play className="w-3.5 h-3.5 mr-1 text-emerald-400 fill-emerald-400/20" />
              Run Code
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSubmitCode}
              isLoading={isSubmitting}
              className="text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Submit Solution
            </Button>
          </div>
        </div>

        {/* Main Workspace (Monaco Editor & optional Multi-file Explorer) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Multi-file Explorer Side Navigation (Only for Development Type) */}
          {problemType === "development" && (
            <div className="w-48 bg-slate-900/60 border-r border-slate-800 p-2 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 font-semibold mb-2 uppercase tracking-wider">
                <FolderTree className="w-3.5 h-3.5" />
                Files
              </div>
              {files.map((file) => (
                <button
                  key={file.file_path}
                  onClick={() => setActiveFilePath(file.file_path)}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 font-mono text-xs transition-colors ${
                    activeFilePath === file.file_path
                      ? "bg-blue-600/20 text-blue-400 font-medium"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  {file.file_path}
                </button>
              ))}
            </div>
          )}

          {/* Monaco Editor Component */}
          <div className="flex-1 h-full">
            <Editor
              height="100%"
              theme="vs-dark"
              language={getMonacoLanguage(selectedLanguage)}
              value={activeFile?.file_content ?? ""}
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                tabSize: 4,
              }}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* Bottom Panel: TEST CASES ONLY (LeetCode style)           */}
        {/* ======================================================== */}
        <div className="h-64 border-t border-slate-800 bg-slate-900/90 flex flex-col">
          {/* Test Cases Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200">Test Cases</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                {displayTestCases.length}
              </span>
            </div>

            {/* Test Case selection tabs: Case 1, Case 2, etc. */}
            <div className="flex items-center gap-1.5">
              {displayTestCases.map((tc, idx) => (
                <button
                  key={tc.id || idx}
                  onClick={() => setSelectedTestCaseIndex(idx)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    selectedTestCaseIndex === idx
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Test Case Input & Expected Output Display */}
          <div className="flex-1 p-4 overflow-y-auto text-xs font-mono text-slate-300">
            {currentTestCase ? (
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 font-sans text-xs font-medium">
                    Input:
                  </span>
                  <pre className="text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-800/80 mt-1 overflow-x-auto whitespace-pre-wrap">
                    {currentTestCase.input_data}
                  </pre>
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-xs font-medium">
                    Expected Output:
                  </span>
                  <pre className="text-emerald-400 bg-slate-950 p-2.5 rounded border border-slate-800/80 mt-1 overflow-x-auto whitespace-pre-wrap">
                    {currentTestCase.expected_output}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 font-sans py-4 text-center">
                Default sample test cases available for practice.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

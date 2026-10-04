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
} from "lucide-react";
import { ProblemFile, ExecutionResult, Submission, TestCase } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { submitProblemSolution } from "@/lib/api/submissions";

export interface MonacoEditorProps {
  problemId: number;
  problemType: "dsa" | "development" | "sql" | "bash";
  initialFiles?: ProblemFile[];
  testCases?: TestCase[];
  previousSubmission?: Submission | null;
  publicSubmissions?: Submission[];
  onSubmissionSuccess?: (result: ExecutionResult) => void;
}

export function MonacoEditor({
  problemId,
  problemType,
  initialFiles = [],
  testCases = [],
  previousSubmission = null,
  publicSubmissions = [],
  onSubmissionSuccess,
}: MonacoEditorProps) {
  // Available language options
  const defaultLanguage =
    problemType === "sql"
      ? "sql"
      : problemType === "bash"
      ? "shell"
      : "javascript";

  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    previousSubmission?.language ?? defaultLanguage
  );

  // File explorer state for multi-file development problems
  const [files, setFiles] = useState<ProblemFile[]>(
    initialFiles.length > 0
      ? initialFiles
      : [
          {
            id: 1,
            problem_id: problemId,
            file_path: "index.js",
            file_content:
              previousSubmission?.code ??
              `// Write your solution here\nfunction solve(input) {\n    return input;\n}`,
            language: defaultLanguage,
            is_editable: true,
            is_entry_point: true,
          },
        ]
  );

  const [activeFilePath, setActiveFilePath] = useState<string>(
    files[0]?.file_path ?? "index.js"
  );

  // Editor bottom tabs: 'testcases' | 'results' | 'analysis' | 'saved' | 'submissions'
  const [activeTab, setActiveTab] = useState<
    "testcases" | "results" | "analysis" | "saved" | "submissions"
  >("testcases");

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  const activeFile = files.find((f) => f.file_path === activeFilePath) ?? files[0];

  const handleCodeChange = (value?: string) => {
    if (!value || !activeFile) return;
    setFiles((prevFiles) =>
      prevFiles.map((f) =>
        f.file_path === activeFile.file_path ? { ...f, file_content: value } : f
      )
    );
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab("results");
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
    setActiveTab("results");
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
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Language selector & File tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ 20</option>
              <option value="java">Java 17</option>
              <option value="sql">PostgreSQL / SQL</option>
              <option value="bash">Bash Script</option>
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
            className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Play className="w-3.5 h-3.5 mr-1 text-emerald-400 fill-emerald-400/20" />
            Run Code
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSubmitCode}
            isLoading={isSubmitting}
            className="text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Main Workspace (Split View for Dev or Direct Monaco Editor) */}
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
            language={activeFile?.language ?? selectedLanguage}
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

      {/* Bottom Panel Tabs & Results */}
      <div className="h-64 border-t border-slate-800 bg-slate-900/90 flex flex-col">
        {/* Bottom Tab Bar */}
        <div className="flex items-center gap-1 px-4 bg-slate-950 border-b border-slate-800 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab("testcases")}
            className={`px-3 py-2 border-b-2 transition-colors ${
              activeTab === "testcases"
                ? "border-blue-500 text-blue-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            Test Cases ({testCases.filter((tc) => !tc.is_hidden).length})
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "results"
                ? "border-blue-500 text-blue-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Execution Results
            {executionResult && (
              <Badge
                variant={
                  executionResult.status === "Accepted" ? "emerald" : "hard"
                }
              >
                {executionResult.status}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "analysis"
                ? "border-purple-500 text-purple-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Code Analysis
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "saved"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            Saved Solution
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "submissions"
                ? "border-amber-500 text-amber-400"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            Submissions ({publicSubmissions.length})
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1 p-4 overflow-y-auto text-xs font-mono text-slate-300">
          {activeTab === "testcases" && (
            <div className="space-y-3">
              {testCases.filter((tc) => !tc.is_hidden).length === 0 ? (
                <p className="text-slate-500 font-sans">
                  Default sample test cases available for practice.
                </p>
              ) : (
                testCases
                  .filter((tc) => !tc.is_hidden)
                  .map((tc, index) => (
                    <div
                      key={tc.id}
                      className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1"
                    >
                      <span className="text-slate-400 font-sans font-semibold">
                        Sample Test Case #{index + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-slate-500">Input:</span>
                          <pre className="text-slate-200 bg-slate-900 p-2 rounded mt-0.5">
                            {tc.input_data}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected Output:</span>
                          <pre className="text-emerald-400 bg-slate-900 p-2 rounded mt-0.5">
                            {tc.expected_output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === "results" && (
            <div>
              {!executionResult ? (
                <div className="text-slate-500 font-sans py-4 text-center">
                  Press &quot;Run Code&quot; or &quot;Submit Solution&quot; to test your code.
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      {executionResult.status === "Accepted" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span
                        className={`text-sm font-bold ${
                          executionResult.status === "Accepted"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {executionResult.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({executionResult.testsPassed}/{executionResult.testsTotal} test cases passed)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {executionResult.runtimeMs} ms
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                        {(executionResult.memoryKb / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  </div>

                  {/* Individual Test Results */}
                  <div className="space-y-2">
                    {executionResult.testResults.map((tr, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans font-semibold text-slate-300">
                            Test Case #{idx + 1}
                          </span>
                          <span
                            className={
                              tr.status === "Passed"
                                ? "text-emerald-400 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {tr.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs">
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

          {activeTab === "analysis" && (
            <div className="font-sans space-y-4">
              {executionResult?.analysis ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Readability</p>
                      <p className="text-lg font-bold text-blue-400">
                        {executionResult.analysis.readabilityScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Maintainability</p>
                      <p className="text-lg font-bold text-purple-400">
                        {executionResult.analysis.maintainabilityScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Architecture</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {executionResult.analysis.architectureScore}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-400">Overall Score</p>
                      <p className="text-lg font-bold text-amber-400">
                        {executionResult.scores?.overallScore}%
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 text-xs leading-relaxed">
                    <p className="font-semibold text-slate-200 mb-1">AI Evaluation Summary:</p>
                    {executionResult.analysis.summary}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-6 text-center">
                  Submit code to receive AI Code Analysis on readability, design patterns, and efficiency.
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="font-sans">
              {previousSubmission ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span>
                      Latest Submission Status:{" "}
                      <span className="text-emerald-400 font-bold">
                        {previousSubmission.status}
                      </span>
                    </span>
                    <span>Language: {previousSubmission.language}</span>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                    {previousSubmission.code}
                  </pre>
                </div>
              ) : (
                <div className="text-slate-500 py-6 text-center">
                  No saved solution for this problem yet.
                </div>
              )}
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="font-sans space-y-2">
              {publicSubmissions.length === 0 ? (
                <div className="text-slate-500 py-6 text-center">
                  No community submissions recorded yet. Be the first to solve this problem!
                </div>
              ) : (
                publicSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        @{sub.profile?.username ?? "user"}
                      </span>
                      <Badge
                        variant={sub.status === "Accepted" ? "emerald" : "hard"}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 font-mono">
                      <span>{sub.language}</span>
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
    </div>
  );
}

"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  FileSpreadsheet,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { ProblemDifficulty, ProblemTypeName } from "@/types";

export default function CreateProblemPage() {
  const router = useRouter();
  const supabase = createClient();

  // Basic Info
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>("Easy");
  const [problemType, setProblemType] = useState<ProblemTypeName>("dsa");
  const [constraints, setConstraints] = useState("");
  const [hints, setHints] = useState("");

  // Execution config
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);

  // Manual Test Cases
  const [testCases, setTestCases] = useState<
    Array<{ input_data: string; expected_output: string; is_hidden: boolean }>
  >([
    { input_data: "nums = [2,7,11,15], target = 9", expected_output: "[0,1]", is_hidden: false },
  ]);

  // File Upload State for Batch Testcases (CSV / XLSX / JSON)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Multi-file starter code for Development problems
  const [starterFiles] = useState<
    Array<{ file_path: string; file_content: string; language: string }>
  >([
    { file_path: "index.js", file_content: "// Starter Code\n", language: "javascript" },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { input_data: "", expected_output: "", is_hidden: false },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadStatus(`Selected ${file.name}. Reading content...`);

    try {
      const text = await file.text();
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setTestCases((prev) => [...prev, ...parsed]);
          setUploadStatus(`Successfully extracted ${parsed.length} test cases from JSON.`);
        }
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter((l) => l.trim());
        const extracted = lines.slice(1).map((line) => {
          const parts = line.split(",");
          return {
            input_data: parts[0]?.trim() ?? "",
            expected_output: parts[1]?.trim() ?? "",
            is_hidden: parts[2]?.trim() === "true",
          };
        });
        setTestCases((prev) => [...prev, ...extracted]);
        setUploadStatus(`Successfully extracted ${extracted.length} test cases from CSV.`);
      }
    } catch {
      setUploadStatus("Failed to parse file content. Please verify CSV/JSON formatting.");
    }
  };

  const handleSubmitProblem = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Admin session expired. Please re-login.");
        setIsLoading(false);
        return;
      }

      const typeMap: Record<ProblemTypeName, number> = {
        dsa: 1,
        development: 2,
        sql: 3,
        bash: 4,
      };

      const { data: problem, error: probErr } = await supabase
        .from("problems")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          difficulty,
          type_id: typeMap[problemType],
          constraints: constraints.trim() || null,
          hints: hints ? hints.split("\n").filter((h) => h.trim()) : null,
          is_published: true,
        })
        .select("id")
        .single();

      if (probErr) {
        setErrorMessage(probErr.message);
        setIsLoading(false);
        return;
      }

      const problemId = problem.id;

      await supabase.from("problem_execution_config").insert({
        problem_id: problemId,
        time_limit_ms: timeLimitMs,
        memory_limit_mb: memoryLimitMb,
      });

      if (testCases.length > 0) {
        await supabase.from("test_cases").insert(
          testCases.map((tc) => ({
            problem_id: problemId,
            input_data: tc.input_data,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden,
          }))
        );
      }

      if (problemType === "development" && starterFiles.length > 0) {
        await supabase.from("problem_files").insert(
          starterFiles.map((sf, idx) => ({
            problem_id: problemId,
            file_path: sf.file_path,
            file_content: sf.file_content,
            language: sf.language,
            is_editable: true,
            is_entry_point: idx === 0,
          }))
        );
      }

      if (uploadFile) {
        await supabase.from("problem_uploads").insert({
          admin_id: user.id,
          file_name: uploadFile.name,
          file_url: "supabase-storage-placeholder",
          status: "Processed",
          extracted_test_cases_count: testCases.length,
        });
      }

      router.push(`/problems/${slug}`);
      router.refresh();
    } catch {
      setErrorMessage("Failed to create problem. Please check database permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400">
          <Code2 className="w-3.5 h-3.5" /> Problem Creation
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Create New Problem</h1>
      </div>

      <Card className="p-8 space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitProblem} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Problem Title"
              type="text"
              placeholder="e.g. Valid Palindrome II"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
            <Input
              label="URL Slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Problem Type</label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as ProblemTypeName)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dsa">DSA (Data Structures & Algorithms)</option>
                <option value="development">Development (Multi-File App)</option>
                <option value="sql">SQL Query</option>
                <option value="bash">Bash Scripting</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Problem Description (Markdown)
            </label>
            <textarea
              rows={8}
              placeholder="Detailed problem statement, sample input/output examples..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Constraints"
              placeholder="e.g. 1 <= nums.length <= 10^5"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
            <Input
              label="Hints (One per line)"
              placeholder="Try using two pointers..."
              value={hints}
              onChange={(e) => setHints(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Input
              label="Time Limit (ms)"
              type="number"
              value={timeLimitMs}
              onChange={(e) => setTimeLimitMs(Number(e.target.value))}
            />
            <Input
              label="Memory Limit (MB)"
              type="number"
              value={memoryLimitMb}
              onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Upload Batch Test Cases (CSV, XLSX, JSON)
              </h4>
            </div>

            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileUploadChange}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />

            {uploadStatus && (
              <p className="text-xs text-emerald-400 font-mono">{uploadStatus}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200">Test Cases ({testCases.length})</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTestCase}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Test Case
              </Button>
            </div>

            {testCases.map((tc, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Test Case #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tc.is_hidden}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setTestCases((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, is_hidden: val } : item))
                          );
                        }}
                      />
                      Hidden Test Case
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    placeholder="Input Data"
                    value={tc.input_data}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTestCases((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, input_data: val } : item))
                      );
                    }}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200"
                  />
                  <textarea
                    rows={2}
                    placeholder="Expected Output"
                    value={tc.expected_output}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTestCases((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, expected_output: val } : item))
                      );
                    }}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isLoading}>
              Publish Problem
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trophy, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function CreateContestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmitContest = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("contests")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim(),
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          is_published: true,
        })
        .select("slug")
        .single();

      if (error) {
        setErrorMessage(error.message);
      } else if (data) {
        router.push(`/contests/${data.slug}`);
        router.refresh();
      }
    } catch {
      setErrorMessage("Failed to schedule contest. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400">
          <Trophy className="w-3.5 h-3.5" /> Contest Scheduling
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Schedule Contest</h1>
      </div>

      <Card className="p-6 space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitContest} className="space-y-4">
          <Input
            label="Contest Title"
            type="text"
            placeholder="Weekly Contest #43"
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              rows={4}
              placeholder="Contest overview, rules, scoring criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Timestamp"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Timestamp"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isLoading}>
              Schedule Contest
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

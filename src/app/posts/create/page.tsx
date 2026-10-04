"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { validatePost } from "@/lib/validations";

export default function CreatePostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitPost = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const valErr = validatePost(title, content);
    if (valErr) {
      setErrorMessage(valErr);
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to create a post.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          title: title.trim(),
          content: content.trim(),
        })
        .select("id")
        .single();

      if (error) {
        setErrorMessage(error.message);
      } else if (data) {
        router.push(`/posts/${data.id}`);
        router.refresh();
      }
    } catch {
      setErrorMessage("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
          <MessageSquare className="w-3.5 h-3.5" /> Post Creation
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Create Discussion</h1>
      </div>

      <Card className="p-6 space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitPost} className="space-y-4">
          <Input
            label="Post Title"
            type="text"
            placeholder="e.g. Master-Slave Database Replication in PostgreSQL"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Content (Markdown / Text)
            </label>
            <textarea
              rows={12}
              placeholder="Write your article, code snippets, or discussion points here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isLoading}>
              Publish Post
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

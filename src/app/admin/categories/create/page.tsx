"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function CreateCategoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("folder");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmitCategory = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        icon: icon.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/categories");
        router.refresh();
      }
    } catch {
      setErrorMessage("Failed to create category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-400">
          <FolderPlus className="w-3.5 h-3.5" /> Category Configuration
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Create Category</h1>
      </div>

      <Card className="p-6 space-y-6">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitCategory} className="space-y-4">
          <Input
            label="Category Name"
            type="text"
            placeholder="Dynamic Programming"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
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
              rows={3}
              placeholder="Brief summary of topics covered in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <Input
            label="Icon Identifier"
            type="text"
            placeholder="e.g. repeat, database, git-branch"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" isLoading={isLoading}>
              Save Category
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

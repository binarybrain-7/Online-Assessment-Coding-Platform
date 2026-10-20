import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Calendar, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: postData } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(username, full_name, profile_picture_url)
    `)
    .eq("id", id)
    .single();

  const post = postData ?? {
    id: id,
    title: "Optimizing Dynamic Programming Solutions with Bitmasking",
    content: "Dynamic programming with bitmasking allows state compression when dealing with subset selection problems.\n\n### Core Concept\nA bitmask represents a set of elements using integers in binary representation. Bitwise operations like AND (&), OR (|), XOR (^), and SHIFT (<<, >>) operate in single CPU cycles, making state lookup lightning fast.\n\n### Code Example:\n```cpp\nint solve(int mask, int pos) {\n    if (mask == (1 << N) - 1) return 0;\n    // state transitions...\n}\n```\n\nAlways analyze maximum element counts before choosing bitmask DP.",
    created_at: new Date().toISOString(),
    author: {
      username: "alex_coder",
      full_name: "Alex Rivera",
    },
  };

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to discussions
      </Link>

      <Card className="p-8 space-y-6">
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-extrabold text-slate-100 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link
              href={`/profile/${post.author?.username ?? "user"}`}
              className="flex items-center gap-1.5 text-slate-200 hover:text-blue-400 font-semibold"
            >
              <User className="w-4 h-4 text-indigo-400" />
              @{post.author?.username ?? "author"}
            </Link>
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-4">
          <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br/>") }} />
        </div>
      </Card>
    </div>
  );
}

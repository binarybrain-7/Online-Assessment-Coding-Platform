import Link from "next/link";
import { MessageSquare, Plus, User, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

export interface PostsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 6;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: postsData, count } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(username, full_name, profile_picture_url)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const posts = postsData ?? [
    {
      id: "post-1",
      title: "Optimizing Dynamic Programming Solutions with Bitmasking",
      content: "Bitmask DP is a powerful technique when state space involves small set membership...",
      created_at: new Date().toISOString(),
      author: {
        username: "alex_coder",
        full_name: "Alex Rivera",
      },
    },
    {
      id: "post-2",
      title: "Guide to Solving Multi-File Development Challenges in Next.js",
      content: "When tackling full-stack development problems on ApexCode, modular architecture is key...",
      created_at: new Date().toISOString(),
      author: {
        username: "sarah_dev",
        full_name: "Sarah Chen",
      },
    },
  ];

  const totalPages = Math.ceil((count ?? posts.length) / pageSize);

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-xs font-semibold text-purple-400">
            <MessageSquare className="w-3.5 h-3.5" /> Community Discussions
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Developer Forum</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Share technical articles, code walkthroughs, and contest editorial strategies.
          </p>
        </div>

        {user && (
          <Link href="/posts/create">
            <Button variant="gradient" size="md">
              <Plus className="w-4 h-4 mr-1.5" /> Create Post
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-6 space-y-3">
            <Link
              href={`/posts/${post.id}`}
              className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors block"
            >
              {post.title}
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {post.content}
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <Link
                href={`/profile/${post.author?.username ?? "user"}`}
                className="flex items-center gap-1.5 hover:text-slate-200"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>@{post.author?.username ?? "author"}</span>
              </Link>

              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatDate(post.created_at)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={() => {}}
      />
    </div>
  );
}

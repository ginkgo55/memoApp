import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";
import Editor from "@/components/features/editor/Editor";

type MemoDetailPageProps = {
  params: {
    id: string;
  };
};

async function getMemo(params: { id: string }) {
  // Next.js 15から、ページの`params`はPromiseのようなオブジェクトになりました。
  // そのため、プロパティにアクセスする前に `await` で解決する必要があります。
  // @ts-ignore - Next.jsの型定義がこの変更に追いついていないための一時的な措置です。
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach((cookie) => cookieStore.set(cookie));
          } catch (error) {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: memo, error } = await supabase
    .from("memos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // 自分のメモだけを取得
    .single();

  if (error || !memo) {
    notFound();
  }

  return memo;
}

export default async function MemoDetailPage({ params }: MemoDetailPageProps) {
  const memo = await getMemo(params);

  return (
    <div>
      <div className="p-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold">{memo.title}</h1>
      </div>
      <Editor memo={memo} />
    </div>
  );
}

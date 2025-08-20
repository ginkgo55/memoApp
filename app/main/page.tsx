import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import MemoList from "@/components/features/memo/MemoList";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MemosPage() {
  // Next.js の最近のバージョンでは、cookies() が Promise を返す場合があるため、await を使用します。
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 新しい `getAll` / `setAll` API を使用するように変更します。
        // これにより、非推奨の警告が解消されます。
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // Server Component では cookie のセットはできませんが、
            // middleware がセッションを更新するため、このエラーは無視できます。
            cookiesToSet.forEach((cookie) => cookieStore.set(cookie));
          } catch (error) {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  // セッション情報を取得。なければログインページにリダイレクト。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインページもリファクタリング後のパスに修正
    redirect("/auth/login");
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">マイメモ一覧</h1>
        <Link href="/main/memo/new">
          <Button>新しいメモ</Button>
        </Link>
      </div>
      <Suspense fallback={<div className="text-center p-8">Loading memos...</div>}>
        <MemoList />
      </Suspense>
    </main>
  );
}

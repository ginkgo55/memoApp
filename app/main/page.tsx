import { createClient } from "@/lib/supabase/server";
import MemoList from "@/components/features/memo/MemoList";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MemosPage() {
  const supabase = createClient();

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

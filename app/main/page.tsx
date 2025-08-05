import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";
import Link from "next/link";

type Memo = Database["public"]["Tables"]["memos"]["Row"];

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

  // ログインユーザーのメモのみを取得
  const { data: memos } = await supabase
    .from("memos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">マイメモ一覧</h1>
        <Link href="/main/memo/new" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          新しいメモ
        </Link>
      </div>
      <ul className="space-y-4">
        {memos?.map((memo: Memo) => (
          <li key={memo.id}>
            <Link
              href={`/main/memo/${memo.id}`}
              className="block p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold">{memo.title}</h2>
              <p className="text-sm text-gray-500">更新日時: {new Date(memo.updated_at).toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import type { Database } from "@/lib/database.types";

export default async function Header() {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server Components cannot set cookies.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-semibold">
        <Link href="/main">MemoApp</Link>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                ログアウト
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            ログイン
          </Link>
        )}
      </div>
    </header>
  );
}

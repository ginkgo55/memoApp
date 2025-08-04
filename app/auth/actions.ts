"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // The `getAll` and `setAll` methods are required for the `createServerClient`
        // in a Server Action.
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          });
        },
      },
    }
  );

  await supabase.auth.signOut();

  // ルートレイアウトを再検証して、ヘッダーのユーザー情報を更新する
  revalidatePath("/", "layout");
  return redirect("/auth/login");
}

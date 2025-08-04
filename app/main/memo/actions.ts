"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/database.types";

export async function createMemo(formData: FormData) {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const title = formData.get("title") as string;

  // drawing_data は今後のステップで実装します
  const { error } = await supabase
    .from("memos")
    .insert({ title, user_id: user.id });

  if (error) throw error;

  revalidatePath("/main");
  redirect("/main");
}

export async function updateMemo(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const drawing_data = formData.get("drawing_data") as string;

  if (!id) {
    throw new Error("Memo ID is required.");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach((cookie) => cookieStore.set(cookie));
          } catch {
            // Server Actions can set cookies.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  const { error } = await supabase
    .from("memos")
    .update({ title, drawing_data: JSON.parse(drawing_data), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath(`/main/memo/${id}`);
  revalidatePath("/main");
}

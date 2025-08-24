"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = createClient();

  await supabase.auth.signOut();

  // ルートレイアウトを再検証して、ヘッダーのユーザー情報を更新する
  revalidatePath("/", "layout");
  return redirect("/auth/login");
}

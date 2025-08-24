"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createMemo(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const title = formData.get("title") as string;

  // drawing_data は今後のステップで実装します
  const { data: newMemos, error } = await supabase
    .from("memos")
    .insert({ title, user_id: user.id })
    .select();

  if (error) throw error;

  if (!newMemos || newMemos.length === 0) {
    // Handle case where insert succeeded but returned no data
    // This shouldn't happen in normal circumstances
    return redirect("/main"); // or some error page
  }

  const newMemo = newMemos[0];

  revalidatePath("/main");
  revalidatePath(`/main/memo/${newMemo.id}`);
  redirect(`/main/memo/${newMemo.id}`);
}

export async function updateMemo(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const drawing_data = formData.get("drawing_data") as string;

  if (!id) {
    throw new Error("Memo ID is required.");
  }

  const supabase = createClient();

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

export async function deleteMemo(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Memo ID is required for deletion.");
  }

  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  const { error } = await supabase.from("memos").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/main");
  redirect("/main");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveMemoAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not authenticated." };
  }

  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const drawingData = formData.get("drawingData") as string;
  const previewImageDataUrl = formData.get("previewImage") as string;

  let preview_image_path: string | null = null;

  // Data URLをBlobに変換
  const blob = previewImageDataUrl ? await (await fetch(previewImageDataUrl)).blob() : null;

  if (blob) {
    const filePath = `${user.id}/${id && id !== 'new' ? id : crypto.randomUUID()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("memo-previews")
      .upload(filePath, blob, { upsert: true }); // upsertで既存のプレビューを上書き

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, message: "Failed to upload preview image." };
    }
    preview_image_path = uploadData.path;
  }

  const memoData = {
    title,
    drawing_data: JSON.parse(drawingData),
    preview_image_path,
    user_id: user.id,
  };

  if (id && id !== 'new') {
    // 既存メモの更新
    const { error } = await supabase.from("memos").update(memoData).eq("id", id);
    if (error) {
      console.error("Update error:", error);
      return { success: false, message: "Failed to update memo." };
    }
  } else {
    // 新規メモの作成
    const { error } = await supabase.from("memos").insert(memoData);
    if (error) {
      console.error("Insert error:", error);
      return { success: false, message: "Failed to create memo." };
    }
  }

  revalidatePath("/main");
  redirect("/main");
}

export async function deleteMemoAction(memoId: string) {
  const supabase = await createClient();

  // 削除前にプレビュー画像のパスを取得
  const { data: memo } = await supabase.from("memos").select("preview_image_path").eq("id", memoId).single();

  // プレビュー画像がストレージにあれば削除
  if (memo?.preview_image_path) {
    await supabase.storage.from("memo-previews").remove([memo.preview_image_path]);
  }

  const { error } = await supabase.from("memos").delete().eq("id", memoId);

  if (error) {
    return { success: false, message: "Failed to delete memo." };
  }

  revalidatePath("/main"); // メモ一覧ページを再検証して表示を更新
  return { success: true, message: "Memo deleted successfully." };
}
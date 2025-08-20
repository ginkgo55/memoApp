import { createClient } from "@/lib/supabase/server";
import MemoCard from "./MemoCard";

export default async function MemoList() {
  // createClientはサーバーサイドのヘルパーで、内部でcookies()を呼び出します。
  // そのため、引数なしで呼び出します。
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p>Please log in to see your memos.</p>;
  }

  const { data: memos, error } = await supabase
    .from("memos")
    .select("id, title, updated_at, preview_image_path")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-red-500">メモを読み込めませんでした。</p>;
  }

  if (!memos || memos.length === 0) {
    return <p className="text-center text-gray-500 py-8">No memos found. Create one!</p>;
  }

  // プレビュー画像の公開URLを生成
  const memosWithPublicUrl = await Promise.all(
    memos.map(async (memo) => {
      if (memo.preview_image_path) {
        const { data } = supabase.storage
          .from("memo-previews")
          .getPublicUrl(memo.preview_image_path);
        return { ...memo, publicUrl: data.publicUrl };
      }
      return { ...memo, publicUrl: null };
    })
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Supabaseのselectから型が推論されるため、memoの型を明示する必要はありません */}
      {memosWithPublicUrl.map((memo) => (
        <MemoCard key={memo.id} memo={memo} />
      ))}
    </div>
  );
}
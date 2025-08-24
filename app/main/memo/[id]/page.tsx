import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Editor from "@/components/features/editor/Editor";

type MemoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemoDetailPage({params}: MemoDetailPageProps) {
  const { id } = await params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: memo, error } = await supabase.from("memos").select("*").eq("id", id).eq("user_id", user.id).single();
  if (error || !memo) {
    notFound();
  }

  return (
    <div>
      <div className="p-4 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold">{memo.title}</h1>
      </div>
      <Editor memo={memo} />
    </div>
  );
}

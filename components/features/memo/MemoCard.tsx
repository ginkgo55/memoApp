import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import DeleteMemoButton from "./DeleteMemoButton";
import type { Database } from "@/lib/database.types";

type Memo = Pick<
  Database["public"]["Tables"]["memos"]["Row"],
  "id" | "title" | "updated_at" | "preview_image_path"
> & { publicUrl: string | null };

type MemoCardProps = {
  memo: Memo;
};

export default function MemoCard({ memo }: MemoCardProps) {
  return (
    <Card>
      <Link href={`/main/memo/${memo.id}`} className="block hover:bg-gray-50">
        <div className="relative w-full h-32 bg-gray-200">
          {memo.publicUrl ? (
            <Image src={memo.publicUrl} alt={`Preview of ${memo.title || 'Untitled'}`} fill style={{ objectFit: 'cover' }} className="bg-white" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Preview</div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold truncate h-7">{memo.title || "Untitled Memo"}</h2>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(memo.updated_at).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <div className="p-2 px-4 border-t flex justify-end">
        <DeleteMemoButton memoId={memo.id} />
      </div>
    </Card>
  );
}
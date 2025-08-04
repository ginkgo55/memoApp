"use client";

import { useState, useTransition, Suspense } from "react";
import dynamic from "next/dynamic";
import type { Database } from "@/lib/database.types";
import { updateMemo } from "@/app/main/memo/actions";
import type { LineData } from "./DrawingCanvas";

const DrawingCanvas = dynamic(() => import("./DrawingCanvas"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse rounded-md"></div>,
});

type Memo = Database["public"]["Tables"]["memos"]["Row"];

type EditorProps = {
  memo: Memo;
};

export default function Editor({ memo }: EditorProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(memo.title);
  const [drawingData, setDrawingData] = useState<LineData[]>(
    (memo.drawing_data as LineData[] | null) || []
  );

  const handleSave = () => {
    const formData = new FormData();
    formData.append("id", memo.id);
    formData.append("title", title);
    formData.append("drawing_data", JSON.stringify(drawingData));

    startTransition(async () => {
      try {
        await updateMemo(formData);
        alert("保存しました！");
      } catch (error) {
        console.error(error);
        alert("保存に失敗しました。");
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold bg-transparent border-none focus:ring-0 w-full"
        />
        <button onClick={handleSave} disabled={isPending} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 whitespace-nowrap">
          {isPending ? "保存中..." : "保存"}
        </button>
      </div>
      <div className="flex-grow p-4 bg-gray-50">
        <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse rounded-md"></div>}>
          <DrawingCanvas initialData={drawingData} onDrawChange={setDrawingData} />
        </Suspense>
      </div>
    </div>
  );
}

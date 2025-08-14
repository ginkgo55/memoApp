"use client";

import { useState, useTransition, Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import type { Database } from "@/lib/database.types";
import type Konva from "konva";
import { updateMemo, deleteMemo } from "@/app/main/memo/actions";
import type { LineData } from "./DrawingCanvas";
import Toolbar from "./Toolbar";

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
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const stageRef = useRef<Konva.Stage>(null);

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

  const handleDelete = () => {
    if (!window.confirm("本当にこのメモを削除しますか？")) {
      return;
    }

    const formData = new FormData();
    formData.append("id", memo.id);

    startTransition(async () => {
      // try...catchを削除。redirect()が正しく動作するようになります。
      await deleteMemo(formData);
    });
  };

  const handleDownload = () => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const dataURL = stage.toDataURL({ mimeType: "image/png" });

    const link = document.createElement("a");
    link.download = `${title || "memo"}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold bg-transparent border-none focus:ring-0 w-full"
        />
        <Toolbar
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          onDownload={handleDownload}
        />
        <button onClick={handleSave} disabled={isPending} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 whitespace-nowrap flex-shrink-0">
          {isPending ? "保存中..." : "保存"}
        </button>
        <button onClick={handleDelete} disabled={isPending} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 whitespace-nowrap flex-shrink-0">
          削除
        </button>
      </div>
      <div className="flex-grow p-4 bg-gray-50">
        <Suspense fallback={<div className="w-full h-full bg-gray-200 animate-pulse rounded-md"></div>}>
          <DrawingCanvas
            ref={stageRef}
            initialData={drawingData}
            onDrawChange={setDrawingData}
            color={color}
            strokeWidth={strokeWidth}
          />
        </Suspense>
      </div>
    </div>
  );
}

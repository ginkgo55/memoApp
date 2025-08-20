"use client";

import { useState, useTransition, Suspense, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Database } from "@/lib/database.types";
import type Konva from "konva";
import { saveMemoAction, deleteMemoAction } from "@/lib/actions/memoActions";
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
  // Undo/Redoのための履歴管理
  const [history, setHistory] = useState<LineData[][]>([
    (memo.drawing_data as LineData[] | null) || [],
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const drawingData = history[historyIndex]; // 現在の描画データは履歴から取得

  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const stageRef = useRef<Konva.Stage>(null);

  // 描画が変更されたときのハンドラ
  const handleDrawChange = useCallback((newData: LineData[]) => {
    // Undoで戻った状態から新しい描画をした場合、それ以降の履歴は削除する
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redoのハンドラ
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();

      // 'new'は新規作成時のIDと仮定
      if (memo.id !== 'new') {
        formData.append("id", memo.id);
      }
      formData.append("title", title);
      formData.append("drawingData", JSON.stringify(drawingData));

      // キャンバスからプレビュー画像を取得
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({
          mimeType: "image/png",
          quality: 0.5, // プレビュー用に品質を少し落としてファイルサイズを削減
          pixelRatio: 0.5 // 解像度も少し落とす
        });
        formData.append("previewImage", dataUrl);
      }

      await saveMemoAction(formData);
    });
  };

  const handleDelete = () => {
    if (!window.confirm("本当にこのメモを削除しますか？")) {
      return;
    }

    startTransition(async () => {
      // 新しいdeleteMemoActionを呼び出す
      await deleteMemoAction(memo.id);
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
          onUndo={handleUndo}
          canUndo={canUndo}
          onRedo={handleRedo}
          canRedo={canRedo}
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
            onDrawChange={handleDrawChange}
            color={color}
            strokeWidth={strokeWidth}
          />
        </Suspense>
      </div>
    </div>
  );
}

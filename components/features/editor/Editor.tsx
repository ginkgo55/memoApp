"use client";

import type { Database } from "@/lib/database.types";

type Memo = Database["public"]["Tables"]["memos"]["Row"];

type EditorProps = {
  memo: Memo;
};

export default function Editor({ memo }: EditorProps) {
  return (
    <div className="bg-gray-50">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">ツールバー（仮）</h2>
        {/* ツールバーのコンポーネントは後でここに配置します */}
      </div>
      <div className="p-4">
        <p className="mb-2 text-sm text-gray-600">キャンバス（仮）</p>
        <div className="w-full h-96 bg-white border border-gray-300 rounded-md shadow-inner">
          {/* 手書き描画キャンバスは後でここに配置します */}
          <p className="p-4 text-gray-400">ここに描画内容が表示されます。</p>
        </div>
      </div>
    </div>
  );
}

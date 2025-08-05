"use client";

import React from "react";

type ToolbarProps = {
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
};

const COLORS = ["#000000", "#FF0000", "#0000FF", "#008000", "#FFFF00", "#FFA500"];
const STROKE_WIDTHS = [2, 5, 10, 15];

export default function Toolbar({
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
}: ToolbarProps) {
  return (
    <div className="p-2 bg-gray-200 rounded-md shadow-md flex items-center gap-4 flex-shrink-0">
      <div>
        <span className="text-sm font-medium mr-2">Color:</span>
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${
                color === c ? "border-blue-500 ring-2 ring-blue-500" : "border-white"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium mr-2">Width:</span>
        <div className="flex gap-2">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setStrokeWidth(width)}
              className={`px-2 py-1 text-sm rounded-md ${
                strokeWidth === width
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {width}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
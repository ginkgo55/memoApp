"use client";

import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";

// 1本の線のデータを表現する型
export type LineData = {
  points: number[];
  // 今後、色や線の太さなどのプロパティを追加できます
};

type DrawingCanvasProps = {
  initialData: LineData[] | null;
  onDrawChange: (data: LineData[]) => void;
};

export default function DrawingCanvas({ initialData, onDrawChange }: DrawingCanvasProps) {
  const [lines, setLines] = useState<LineData[]>(initialData || []);
  const [dimensions, setDimensions] = useState({ width: 0, height: 500 });
  const isDrawing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // コンテナのサイズに合わせてキャンバスのサイズを調整
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 500,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    const newLines = [...lines];
    newLines.splice(lines.length - 1, 1, lastLine);
    setLines(newLines);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    onDrawChange(lines); // 描画の変更を親コンポーネントに通知
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="bg-white border border-gray-300 rounded-md shadow-inner">
        <Layer>
          {lines.map((line, i) => (
            <Line key={i} points={line.points} stroke="black" strokeWidth={5} tension={0.5} lineCap="round" lineJoin="round" />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

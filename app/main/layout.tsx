import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // このレイアウトは今後、メイン機能で共通のヘッダーなどを配置するために使用します。
  return <>{children}</>;
}


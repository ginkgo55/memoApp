import { redirect } from "next/navigation";

export default function RootPage() {
  // ログイン後のメインページにリダイレクト
  redirect("/main");
}


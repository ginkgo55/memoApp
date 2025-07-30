# データベース設計書

本ドキュメントは、手書きメモアプリで使用するSupabase (PostgreSQL) のデータベース設計を定義します。

## 1. 設計概要

本アプリケーションの主要なデータは「ユーザー」と「メモ」です。

- **ユーザー (`auth.users`)**
  - Supabaseの認証機能をそのまま利用します。このテーブルには、ユーザーID、メールアドレス、パスワードハッシュなどが自動的に管理されるため、別途ユーザーテーブルを作成する必要はありません。

- **メモ (`memos`)**
  - ユーザーが作成する手書きメモの情報を格納する `memos` テーブルを新規に作成します。
  - どのユーザーが作成したメモかを紐付けるために、`auth.users` テーブルのIDを外部キーとして保持します。

- **プレビュー画像 (Supabase Storage)**
  - プレビュー画像ファイル自体はデータベースに保存せず、Supabase Storageにアップロードします。
  - `memos` テーブルには、Storage内の画像へのパスを文字列として保存します。これにより、データベースの肥大化を防ぎます。

---

## 2. テーブル定義 (`memos`)

### カラム定義

| カラム名             | データ型      | 制約                               | 説明                                                 |
| -------------------- | ------------- | ---------------------------------- | ---------------------------------------------------- |
| `id`                 | `UUID`        | `PRIMARY KEY`, `DEFAULT`           | メモの主キー (UUID)                                  |
| `user_id`            | `UUID`        | `FOREIGN KEY (auth.users)`, `NOT NULL` | 作成したユーザーのID (auth.usersへの外部キー)        |
| `title`              | `TEXT`        | `NOT NULL`                         | メモのタイトル                                       |
| `drawing_data`       | `JSONB`       |                                    | 手書き描画のデータ (JSON形式)                        |
| `preview_image_path` | `TEXT`        |                                    | プレビュー画像のSupabase Storage内でのパス           |
| `created_at`         | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()`        | 作成日時                                             |
| `updated_at`         | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()`        | 最終更新日時                                         |

### スキーマ (SQL)

```sql
-- 手書きメモを保存する 'memos' テーブルを作成
CREATE TABLE public.memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  drawing_data JSONB,
  preview_image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- パフォーマンス向上のためのインデックスを作成
-- ユーザーごとのメモ一覧取得を高速化
CREATE INDEX memos_user_id_idx ON public.memos (user_id);
-- 更新日時でのソートを高速化
CREATE INDEX memos_updated_at_idx ON public.memos (updated_at DESC);


-- メモが更新されたときに 'updated_at' を自動で更新するための関数とトリガー
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_memos_update
  BEFORE UPDATE ON public.memos
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
```

---

## 3. Row Level Security (RLS) ポリシー

「各ユーザーは自分のみが作成したメモを閲覧・編集・削除できる」というセキュリティ要件を実現するために、RLSを設定します。

```sql
-- 'memos' テーブルでRLSを有効化
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- ポリシー定義
-- 自分のメモのみを閲覧できる
CREATE POLICY "Users can view their own memos"
  ON public.memos FOR SELECT
  USING (auth.uid() = user_id);

-- 自分のユーザーIDで新しいメモを作成できる
CREATE POLICY "Users can insert their own memos"
  ON public.memos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分のメモのみを更新できる
CREATE POLICY "Users can update their own memos"
  ON public.memos FOR UPDATE
  USING (auth.uid() = user_id);

-- 自分のメモのみを削除できる
CREATE POLICY "Users can delete their own memos"
  ON public.memos FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. Supabase Storage 設定

プレビュー画像を保存するための設定です。これはSQLではなく、Supabaseのダッシュボードから行います。

1.  **バケットの作成:**
    - Supabaseダッシュボードの `Storage` に移動します。
    - バケット名を `previews` とし、**Public bucket** のチェックをオンにして作成します。

2.  **Storageのポリシー設定 (推奨):**
    - 作成した `previews` バケットのポリシーを編集し、認証済みユーザーが自分のフォルダ (`{user_id}/`) にのみファイルをアップロード・更新・削除できるように制限を加えます。


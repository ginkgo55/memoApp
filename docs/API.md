# API仕様書

## 1. 概要

本APIは、手書きメモアプリのバックエンド機能を提供します。Next.jsのApp Router (`app/api`ディレクトリ) を利用し、RESTfulな設計思想に基づいています。

- **ベースURL:** `/api`
- **認証:** 全てのエンドポイントでSupabaseのユーザー認証が必要です。リクエストには有効な認証情報（CookieまたはAuthorizationヘッダー）が含まれている必要があります。
- **データ形式:** リクエスト、レスポンスともに原則としてJSON形式です。ただし、ファイルアップロードを伴う場合は `multipart/form-data` を使用します。

---

## 2. メモ (Memos) に関するAPI

### `GET /api/memos`

ログインしているユーザーのメモ一覧を取得します。検索、ソート、日付フィルタ機能も提供します。

- **認証:** 必要
- **メソッド:** `GET`
- **エンドポイント:** `/api/memos`
- **クエリパラメータ:**
  - `search` (string, optional): タイトル検索のキーワード。
  - `start_date` (string, optional): 検索範囲の開始日 (YYYY-MM-DD形式)。
  - `end_date` (string, optional): 検索範囲の終了日 (YYYY-MM-DD形式)。
  - `sort` ('new' | 'old', optional): 並び順。`new`は更新日時の降順（新しい順）、`old`は昇順（古い順）。デフォルトは`new`。
- **成功レスポンス (200 OK):**
  ```json
[
  {
    "id": "c7a9f3b2-3e1d-4b8c-9f0a-2e1b9d5c8a7f",
    "title": "会議のメモ",
    "updated_at": "2023-10-27T10:00:00Z",
    "preview_image_url": "https://<project-ref>.supabase.co/storage/v1/object/public/previews/user-id/c7a9f3b2-....png"
  }
]
  ```
- **エラーレスポンス:**
  - `401 Unauthorized`: 認証されていない場合。
  - `400 Bad Request`: 日付フィルタの形式が不正な場合。

---

### `GET /api/memos/[id]`

指定されたIDのメモの詳細情報（描画データを含む）を取得します。

- **認証:** 必要
- **メソッド:** `GET`
- **エンドポイント:** `/api/memos/{id}`
- **成功レスポンス (200 OK):**
  ```json
{
  "id": "c7a9f3b2-3e1d-4b8c-9f0a-2e1b9d5c8a7f",
  "title": "会議のメモ",
  "drawing_data": {
    "lines": [
      { "points": [{ "x": 10, "y": 10 }, { "x": 12, "y": 12 }], "color": "#000000", "lineWidth": 5 }
    ]
  },
  "created_at": "2023-10-27T09:50:00Z",
  "updated_at": "2023-10-27T10:00:00Z"
}
  ```
- **エラーレスポンス:**
  - `401 Unauthorized`: 認証されていない場合。
  - `403 Forbidden`: 自分のメモではない場合。
  - `404 Not Found`: 指定されたIDのメモが存在しない場合。

---

### `POST /api/memos`

新しい手書きメモを作成します。描画データと共に、クライアントサイドで生成したプレビュー画像をアップロードします。

- **認証:** 必要
- **メソッド:** `POST`
- **エンドポイント:** `/api/memos`
- **リクエストボディ (`multipart/form-data`):**
  - `title` (string, required): メモのタイトル。
  - `drawing_data` (string, required): 描画データのJSON文字列 (`JSON.stringify(data)`)。
  - `preview_image` (File, required): Canvasから生成されたプレビュー画像ファイル (例: PNG)。
- **成功レスポンス (201 Created):**
  ```json
{
  "id": "d8b0a4c1-4f2e-5d9d-a1b3-3f2c8e7b9a6d",
  "message": "Memo created successfully"
}
  ```
- **エラーレスポンス:**
  - `400 Bad Request`: 必須項目が不足している場合。
  - `401 Unauthorized`: 認証されていない場合。
  - `500 Internal Server Error`: データベースやストレージへの保存に失敗した場合。

---

### `PUT /api/memos/[id]`

既存のメモを更新します。

- **認証:** 必要
- **メソッド:** `PUT`
- **エンドポイント:** `/api/memos/{id}`
- **リクエストボディ (`multipart/form-data`):**
  - `title` (string, required): メモのタイトル。
  - `drawing_data` (string, required): 描画データのJSON文字列。
  - `preview_image` (File, required): 更新されたプレビュー画像ファイル。
- **成功レスポンス (200 OK):**
  ```json
{
  "id": "c7a9f3b2-3e1d-4b8c-9f0a-2e1b9d5c8a7f",
  "message": "Memo updated successfully"
}
  ```
- **エラーレスポンス:**
  - `400 Bad Request`: 必須項目が不足している場合。
  - `401 Unauthorized`: 認証されていない場合。
  - `403 Forbidden`: 自分のメモではない場合。
  - `404 Not Found`: 指定されたIDのメモが存在しない場合。
  - `500 Internal Server Error`: データベースやストレージへの保存に失敗した場合。

---

### `DELETE /api/memos/[id]`

指定されたIDのメモを削除します。データベースのレコードと、Supabase Storage上のプレビュー画像の両方を削除します。

- **認証:** 必要
- **メソッド:** `DELETE`
- **エンドポイント:** `/api/memos/{id}`
- **成功レスポンス (204 No Content):**
  - 成功時はレスポンスボディは空です。
- **エラーレスポンス:**
  - `401 Unauthorized`: 認証されていない場合。
  - `403 Forbidden`: 自分のメモではない場合。
  - `404 Not Found`: 指定されたIDのメモが存在しない場合。
  - `500 Internal Server Error`: データベースやストレージへの削除に失敗した場合。


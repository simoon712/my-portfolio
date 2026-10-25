import type { EditorItem } from "../types";

// Rectangleのデータが正しいか確認する
function isRectangle(data: unknown): boolean {
  // オブジェクトであることを確認する
  if (typeof data !== "object" || data === null) {
    return false;
  }

  // プロパティを確認できる型にする
  const item = data as Record<string, unknown>;

  // Rectangleに必要なデータを確認する
  return (
    // UUIDが文字列で、正しい形式か確認する
    typeof item.uuid === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.uuid) &&
    item.type === "rectangle" &&

    // 座標が有限の数値であることを確認する
    typeof item.x === "number" &&
    Number.isFinite(item.x) &&
    typeof item.y === "number" &&
    Number.isFinite(item.y) &&

    // 幅と高さが1以上の有限の数値であることを確認する
    typeof item.width === "number" &&
    Number.isFinite(item.width) &&
    item.width >= 1 &&
    typeof item.height === "number" &&
    Number.isFinite(item.height) &&
    item.height >= 1
  );
}

// Lineのデータが正しいか確認する
function isLine(data: unknown): boolean {
  // オブジェクトであることを確認する
  if (typeof data !== "object" || data === null) {
    return false;
  }

  // プロパティを確認できる型にする
  const item = data as Record<string, unknown>;

  // Lineに必要なデータを確認する
  return (
    // UUIDが文字列で、正しい形式か確認する
    typeof item.uuid === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.uuid) &&
    item.type === "line" &&

    // 始点の座標が有限の数値であることを確認する
    typeof item.x1 === "number" &&
    Number.isFinite(item.x1) &&
    typeof item.y1 === "number" &&
    Number.isFinite(item.y1) &&

    // 終点の座標が有限の数値であることを確認する
    typeof item.x2 === "number" &&
    Number.isFinite(item.x2) &&
    typeof item.y2 === "number" &&
    Number.isFinite(item.y2)
  );
}

// JSONファイルを読み込んで図形データに変換する
export async function importJson(file: File): Promise<EditorItem[]> {
  // ファイルの内容を文字列として読み込む
  const text = await file.text();

  // JSON文字列をJavaScriptのデータに変換する
  const data: unknown = JSON.parse(text);

  // 読み込んだデータが配列か確認する
  if (!Array.isArray(data)) {
    throw new Error("Invalid JSON format");
  }

  // 配列内のすべての図形が正しいデータか確認する
  const isValid = data.every((item) => {
    return isRectangle(item) || isLine(item);
  });

  // 不正な図形が含まれていたらエラーにする
  if (!isValid) {
    throw new Error("Invalid shape data");
  }

  // すべての図形のUUIDを取得する
  const uuids = data.map((item: EditorItem) => item.uuid);

  // Setを使ってUUIDの重複を取り除く
  const uniqueUuids = new Set(uuids);

  // UUIDが重複している場合はエラーにする
  if (uuids.length !== uniqueUuids.size) {
    throw new Error("Duplicate UUID");
  }

  // 検証した図形データを返す
  return data as EditorItem[];
}
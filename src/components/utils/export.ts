import type { EditorItem } from "../types";

// 図形データをJSONファイルとして保存する
export function exportJson(items: EditorItem[]): void {
  // ① 図形データをJSON文字列に変換する
  const json = JSON.stringify(items, null, 2);

  // ② JSON文字列をBlobにする
  const blob = new Blob([json], { type: "application/json" });

  // ③ Blobにアクセスする一時URLを作る
  const url = URL.createObjectURL(blob);

  // ④ ダウンロード用のリンクを作る
  const link = document.createElement("a");

  // ⑤ リンク先とファイル名を設定する
  link.href = url;
  link.download = "drawing.json";

  // ⑥ 自動的にクリックしてダウンロードする
  link.click();

  // ⑦ 一時URLを解放する
  URL.revokeObjectURL(url);
}
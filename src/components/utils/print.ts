import type { EditorItem } from "../types";

// すべての図形を囲む範囲を計算する
export function getDrawingBounds(items: EditorItem[]) {
  // 図形がない場合は計算しない
  if (items.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // すべての図形の座標を確認する
  items.forEach((item) => {
    if (item.type === "rectangle") {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    }

    if (item.type === "line") {
      minX = Math.min(minX, item.x1, item.x2);
      minY = Math.min(minY, item.y1, item.y2);
      maxX = Math.max(maxX, item.x1, item.x2);
      maxY = Math.max(maxY, item.y1, item.y2);
    }
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// 印刷用のSVG文字列を生成する
export function createPrintSvg(items: EditorItem[]): string {
  // すべての図形を囲む範囲を取得する
  const bounds = getDrawingBounds(items);

  // 図形がない場合は空文字を返す
  if (!bounds) return "";

  // 図形の周囲に余白を追加する
  const margin = 20;

  // 印刷する範囲を計算する
  const x = bounds.x - margin;
  const y = bounds.y - margin;
  const width = Math.max(bounds.width + margin * 2, 1);
  const height = Math.max(bounds.height + margin * 2, 1);

  // 四角形と直線をSVGの文字列に変換する
  const shapes = items.map((item) => {
    if (item.type === "rectangle") {
      return `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" fill="none" stroke="black" />`;
    }

    return `<line x1="${item.x1}" y1="${item.y1}" x2="${item.x2}" y2="${item.y2}" stroke="black" />`;
  }).join("");

  // 図形全体を囲むSVGを返す
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${shapes}</svg>`;
}

// 印刷するためのダイアログを開く
export function openPrintDialog(items: EditorItem[]): void {
  // 印刷用のSVGを生成する
  const svg = createPrintSvg(items);

  // 図形がない場合は何もしない
  if (!svg) return;

  // 印刷専用のウィンドウを開く
  const printWindow = window.open("", "_blank");

  // ウィンドウを開けなかった場合は終了する
  if (!printWindow) return;

  // 印刷用のHTMLを作成する
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>Drawing</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            margin: 0;
          }

          svg {
            display: block;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        ${svg}
      </body>
    </html>
  `);

  // HTMLの書き込みを終了する
  printWindow.document.close();

  // 印刷用ウィンドウにフォーカスする
  printWindow.focus();

  // 印刷ダイアログを開く
  printWindow.print();
}
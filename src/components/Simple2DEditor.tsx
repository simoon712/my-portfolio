import { useState } from "react";
import type { MouseEvent } from "react";

type Rectangle = {
  id: number;
  x:  number;
  y:  number;
};

type DragOffset = {
  x: number;
  y: number;
};
function Simple2DEditor() {
  // アイテムの状態
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);

  // ドラッグ中のアイテムID
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // アイテムを掴んだ位置
  const [dragOffset, setDragOffset] = useState<DragOffset>({
    x: 0,
    y: 0
  });

  // 新しいRectangleを作る
  function addRectangle() {
    const newRectangle: Rectangle = {
      id: rectangles.length + 1,
      x: 50,
      y: 50,
    };
    setRectangles([
      ...rectangles,
      newRectangle
    ]);
  }

  // アイテムのドラッグ開始
  function handleMouseDown(
    e: MouseEvent<HTMLDivElement>,
    rect: Rectangle
  ) {
    // ドラッグするアイテムのIDを保存
    setDraggingId(rect.id);

    // アイテムのブラウザ上の位置を取得
    const rectangleRect = e.currentTarget.getBoundingClientRect();

    // アイテムの左上から、クリックした位置までの距離を保存
    setDragOffset({
      x: e.clientX - rectangleRect.left,
      y: e.clientY - rectangleRect.top
    });
  }

  // アイテムをドラッグ中に移動する
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    // ドラッグ中でなければ何もしない
    if (draggingId === null) return;

    // 描画エリアのブラウザ上の位置を取得
    const editorRect = e.currentTarget.getBoundingClientRect();

    // ドラッグ中のアイテムだけ座標を更新
    const newRectangles = rectangles.map((rect) => {
      if (rect.id === draggingId) {
        return {
          ...rect,
          x: e.clientX - editorRect.left - dragOffset.x,
          y: e.clientY - editorRect.top - dragOffset.y,
        };
      }
      return rect;
    });
    setRectangles(newRectangles);
  }

  // アイテムのドラッグ終了
  function handleMouseUp() {
    setDraggingId(null);
  }

  return (
    <>
      <h2>Simple 2D Editor</h2>
      <button
        onClick = {addRectangle}
      >
        Add Rectangle
      </button>

      {/* 描画エリア */}
      <div
        className = "editor-area"
        onMouseMove = {handleMouseMove}
        onMouseUp = {handleMouseUp}
      >
        {rectangles.map((rect) => (
          <div
            key = {rect.id}
            className = "rectangle"
            style = {{
              left: rect.x,
              top: rect.y
            }}
            onMouseDown = {(e) => handleMouseDown(e, rect)}
          >
          </div>
        ))}
      </div>
    </>
  );
}
export default Simple2DEditor;
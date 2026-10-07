import { useEffect, useRef, useState } from "react";
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

  // 選択中のアイテムID
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 次に使用するアイテムID
  const nextId = useRef<number>(1);

  // 新しいRectangleを作る
  function addRectangle() {
    const newRectangle: Rectangle = {
      id: nextId.current++,
      x: 50,
      y: 50,
    };
    setRectangles([
      ...rectangles,
      newRectangle
    ]);
  }

  // アイテムをマウスダウンした時の処理
  function handleMouseDown(
    e: MouseEvent<HTMLDivElement>,
    rect: Rectangle
  ) {
    // 選択したアイテムのIDを保存
    setSelectedId(rect.id);

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

  // 描画エリアをマウスダウンした時の処理（選択解除）
  function handleEditorMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  }

  // 選択したアイテムの削除
  function deleteSelectedRectangle() {
    // 選択中のIDと一致しないアイテムだけを残す
    const newRectangles = rectangles.filter((rect) => {
      return rect.id !== selectedId;
    });

    // 削除後の配列でstateを更新
    setRectangles(newRectangles);

    // 削除後は選択状態を解除
    setSelectedId(null);
  }

  // キーボード操作を監視
  useEffect(() => {
    // キーが押された時の処理
    function handleKeyDown(e: KeyboardEvent) {
      // Deleteキーが押されたら選択中のアイテムを削除
      if (e.key === 'Delete') deleteSelectedRectangle();
    }

    // windowにキーボードイベントを登録
    window.addEventListener("keydown", handleKeyDown);

    // Effectが再実行・破棄される前にイベントを解除
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

    // 最新のrectanglesとselectedIdを使用するため
    // どちらかが変わったらEffectを再実行
  }, [rectangles, selectedId]);

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
        onMouseDown = {handleEditorMouseDown}
      >
        {rectangles.map((rect) => (
          <div
            key = {rect.id}
            className = {selectedId === rect.id ? "rectangle selected" : "rectangle"}
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
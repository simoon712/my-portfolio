import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

type Rectangle = {
  id: number;
  x:  number;
  y:  number;
  width: number;
  height: number;
};

type DragOffset = {
  x: number;
  y: number;
};

// 現在の操作状態
type EditorAction =
  | { type: "none" }
  | { type: "drag"; id: number }
  | { type: "resize"; id: number };

function Simple2DEditor() {
  // アイテムの状態
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);

  // アイテムを掴んだ位置
  const [dragOffset, setDragOffset] = useState<DragOffset>({
    x: 0,
    y: 0
  });

  // 選択中のアイテムID
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 次に使用するアイテムID
  const nextId = useRef<number>(1);

  // 操作しているアイテムID
  const [action, setAction] = useState<EditorAction>({
    type: "none"
  });

  // 新しいRectangleを作る
  function addRectangle() {
    const newRectangle: Rectangle = {
      id: nextId.current++,
      x: 50,
      y: 50,
      width: 100,
      height: 80,
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
    setAction({ type: 'drag', id: rect.id });

    // アイテムのブラウザ上の位置を取得
    const rectangleRect = e.currentTarget.getBoundingClientRect();

    // アイテムの左上から、クリックした位置までの距離を保存
    setDragOffset({
      x: e.clientX - rectangleRect.left,
      y: e.clientY - rectangleRect.top
    });

    // 選択したアイテム以外を残す
    const otherRectangles = rectangles.filter((item) => {
      return item.id !== rect.id;
    });

    // 選択したアイテムを配列の最後に移動して最前面にする
    setRectangles([
      ...otherRectangles,
      rect
    ]);
  }

  // アイテムをドラッグ・リサイズ中に更新する
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    // ドラッグ・リサイズ中でなければ何もしない
    if (action.type === 'none') return;

    // 描画エリアのブラウザ上の位置を取得
    const editorRect = e.currentTarget.getBoundingClientRect();

    let newRectangles: Rectangle[] = rectangles;

    switch (action.type) {
      // ドラッグ
      case 'drag': {
        newRectangles = rectangles.map((rect) => {
          if (rect.id === action.id) {
            return {
              ...rect,
              x: e.clientX - editorRect.left - dragOffset.x,
              y: e.clientY - editorRect.top - dragOffset.y,
            };
          }
          return rect;
        });
        break;
      }

      // リサイズ
      case 'resize': {
        newRectangles = rectangles.map((rect) => {
          if (rect.id === action.id) {
            return {
              ...rect,
              width: Math.max(20, e.clientX - editorRect.left - rect.x),
              height: Math.max(20, e.clientY - editorRect.top - rect.y)
            };
          }
          return rect;
        });
        break;
      }
    }

    // 更新したRectangleをstateに反映
    setRectangles(newRectangles);

  }

  // ドラッグ・リサイズ終了
  function handleMouseUp() {
    setAction({ type: 'none' });
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

  // 描画エリア外をクリックした場合に選択解除する
  useEffect(() => {
    function handleWindowMouseDown(e: globalThis.MouseEvent) {
      // 描画エリアを取得
      const editor = document.querySelector(".editor-area");

      // 描画エリア外をクリックした場合
      if (editor && !editor.contains(e.target as Node)) {
        setSelectedId(null);
      }
    }

    window.addEventListener("mousedown", handleWindowMouseDown);

    return () => {
      window.removeEventListener("mousedown", handleWindowMouseDown);
    };
  }, []);

  // リサイズ開始
  function handleResizeMouseDown(
    e: MouseEvent<HTMLDivElement>,
    rect: Rectangle
  ) {
    // 親のRectangleにマウスイベントを伝えない
    e.stopPropagation();

    // リサイズするアイテムのIDを保存
    setAction({ type: 'resize', id: rect.id });
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
        onMouseDown = {handleEditorMouseDown}
      >
        {rectangles.map((rect) => (
          <div
            key = {rect.id}
            className = {selectedId === rect.id ? "rectangle selected" : "rectangle"}
            style = {{
              left:   rect.x,
              top:    rect.y,
              width:  rect.width,
              height: rect.height,
            }}
            onMouseDown = {(e) => handleMouseDown(e, rect)}
          >
            {selectedId === rect.id && (
              <div
                className = "resize-handle"
                onMouseDown = {(e) => handleResizeMouseDown(e, rect)}
              >
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
export default Simple2DEditor;
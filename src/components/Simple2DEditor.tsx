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
  function handleMouseDown(e: MouseEvent<SVGRectElement>, rect: Rectangle) {
    // 描画エリアへのマウスイベント伝播を防ぐ
    e.stopPropagation();

    // 選択したアイテムのIDを保存
    setSelectedId(rect.id);

    // マウスのSVG座標を取得
    const point = getSvgPoint(e);

    if (!point) return;

    // ドラッグ開始
    setAction({ type: "drag", id: rect.id });

    // 四角形の左上からマウス位置までの距離を保存
    setDragOffset({
      x: point.x - rect.x,
      y: point.y - rect.y
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
  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    // ドラッグ・リサイズ中でなければ何もしない
    if (action.type === 'none') return;

    // ブラウザ上のマウス位置をSVG座標に変換
    const point = getSvgPoint(e);

    // SVG座標を取得できなかった場合は終了
    if (!point) return;

    // Rectangleの配列を更新
    const newRectangles = rectangles.map((rect) => {
      // 操作対象ではないRectangleは変更しない
      if (rect.id !== action.id) return rect;

      // 現在の操作に応じて処理を切り替える
      switch (action.type) {
        case "drag":
          // ドラッグ中はRectangleの位置を更新
          return {
            ...rect,
            // マウス位置から掴んだ位置の差分を引く
            x: point.x - dragOffset.x,
            y: point.y - dragOffset.y
          };

        case "resize":
          // リサイズ中はRectangleの幅と高さを更新
          return {
            ...rect,
            // Rectangleの左上からマウス位置までの距離を計算
            // 最小サイズは20に制限する
            width: Math.max(20, point.x - rect.x),
            height: Math.max(20, point.y - rect.y)
          };
      }
    });

    // 更新した配列をReactのstateに反映
    setRectangles(newRectangles);
  }

  // ドラッグ・リサイズ終了
  function handleMouseUp() {
    setAction({ type: 'none' });
  }

  // 描画エリアの空白部分をクリックした時の処理
  function handleEditorMouseDown(e: MouseEvent<SVGSVGElement>) {
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
  function handleResizeMouseDown(e: MouseEvent<SVGRectElement>, rect: Rectangle) {
    // 親のRectangleにマウスイベントを伝えない
    e.stopPropagation();

    // リサイズするアイテムのIDを保存
    setAction({ type: 'resize', id: rect.id });
  }

  // マウスの位置をSVG上の座標に変換する
  function getSvgPoint(e: MouseEvent<SVGElement>) {
    // マウスイベントが発生したSVG要素を取得
    const svg = e.currentTarget.ownerSVGElement
      ?? (e.currentTarget as SVGSVGElement);

    // SVGの画面上の座標変換行列を取得
    const matrix = svg.getScreenCTM();

    if (!matrix) return null;

    // ブラウザ上のマウス座標をSVG座標に変換
    const point = new DOMPoint(e.clientX, e.clientY);

    return point.matrixTransform(matrix.inverse());
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
      <svg
        className = "editor-area"
        viewBox = "0 0 800 500"
        onMouseDown = {handleEditorMouseDown}
        onMouseMove = {handleMouseMove}
        onMouseUp = {handleMouseUp}
      >
        {rectangles.map((rect) => (
          <g key = {rect.id}>
            {/* Rectangle本体 */}
            <rect
              x = {rect.x}
              y = {rect.y}
              width = {rect.width}
              height = {rect.height}
              fill = 'white'
              stroke = {selectedId === rect.id ? "blue" : "#222"}
              strokeWidth = {selectedId === rect.id ? 2 : 1}
              onMouseDown = {(e) => handleMouseDown(e, rect)}
            />
            {/* 選択中のRectangleにリサイズハンドルを表示 */}
            {selectedId === rect.id && (
              <rect
                x = {rect.x + rect.width - 5}
                y = {rect.y + rect.height - 5}
                width = {10}
                height = {10}
                fill = "blue"
                style = {{ cursor: "nwse-resize" }}
                onMouseDown = {(e) => handleResizeMouseDown(e, rect)}
              />
            )}
          </g>
        ))}
        
      </svg>
    </>
  );
}
export default Simple2DEditor;
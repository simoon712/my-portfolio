import { useEffect, useRef, useState } from "react";
import type { MouseEvent, WheelEvent } from "react";

type Rectangle = {
  id: number;
  type: "rectangle"; // 図形の種類
  x:  number;
  y:  number;
  width: number;
  height: number;
};

// エディタで扱うすべての図形の型
type EditorItem = Rectangle;

type DragOffset = {
  x: number;
  y: number;
};

// 現在の操作状態
type EditorAction =
  | { type: "none" }
  | { type: "drag"; id: number }
  | { type: "resize"; id: number }
  | { type: "pan" };

// SVGの表示範囲
type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type EditorHistory = {
  past: EditorItem[][];    // 過去の図形データ
  present: EditorItem[];   // 現在の図形データ
  future: EditorItem[][];  // やり直し用の図形データ
};

function Simple2DEditor() {
  // 図形の操作履歴を管理する
  const [history, setHistory] = useState<EditorHistory>({
    past: [],
    present: [],
    future: []
  });

  // 現在の図形データを履歴から取得する
  const items = history.present;

  // アイテムを掴んだ位置
  const [dragOffset, setDragOffset] = useState<DragOffset>({x: 0, y: 0});

  // 選択中のアイテムID
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 次に使用するアイテムID
  const nextId = useRef<number>(1);

  // 操作しているアイテムID
  const [action, setAction] = useState<EditorAction>({type: "none"});

  // ドラッグ・リサイズ開始前の図形データを一時保存する
  const actionStartItems = useRef<EditorItem[] | null>(null);

  // Spaceキーが押されているかを管理する
  const spacePressed = useRef<boolean>(false);

  // パン操作を開始したときのマウス位置
  const panStart = useRef<DragOffset>({ x: 0, y: 0 });

  // SVG要素を参照する
  const svgRef = useRef<SVGSVGElement>(null);

  // SVGの表示範囲を管理する（原点を画面中央にする）
  const [viewBox, setViewBox] = useState<ViewBox>({x: -430, y: -250, width: 860, height: 500});

  // 新しいRectangleを作る
  function addRectangle() {
    const newRectangle: Rectangle = {
      id: nextId.current++,
      type: "rectangle", // 図形の種類
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };

    setHistory((prev) => ({
      past: [...prev.past, prev.present], // 変更前の図形データを履歴に保存
      present: [...prev.present, newRectangle], // 新しい四角形を追加
      future: [] // 新しい操作をしたのでRedoの履歴を消去
    }));
  }

  // ひとつ前の図形データに戻す
  function undo() {
    setHistory((prev) => {
      // 過去のデータがなければ何もしない
      if (prev.past.length === 0) return prev;

      return {
        past: prev.past.slice(0, -1), // 最後の履歴を取り除く
        present: prev.past[prev.past.length - 1], // ひとつ前の状態に戻す
        future: [prev.present, ...prev.future] // 現在の状態をredo用に保存
      };
    });
  }

  // undoで取り消した操作をやり直す
  function redo() {
    setHistory((prev) => {
      // やり直すデータがなければ何もしない
      if (prev.future.length === 0) return prev;

      return {
        past: [...prev.past, prev.present], // 現在の状態を過去の履歴に保存
        present: prev.future[0], // redoの履歴の先頭の状態を復元
        future: prev.future.slice(1) // 使用した先頭の履歴を取り除く
      };
    });
  }

  // アイテムをマウスダウンした時の処理
  function handleMouseDown(e: MouseEvent<SVGRectElement>, item: Rectangle) {
    // Spaceキーが押されている場合は親SVGに処理を任せる
    if (spacePressed.current) return;

    // 描画エリアへのマウスイベント伝播を防ぐ
    e.stopPropagation();

    // 選択したアイテムのIDを保存
    setSelectedId(item.id);

    // マウスのSVG座標を取得
    const point = getSvgPoint(e);

    if (!point) return;

    // ドラッグ開始前の図形データを一時保存する
    actionStartItems.current = items;

    // ドラッグ開始
    setAction({ type: "drag", id: item.id });

    // 四角形の左上からマウス位置までの距離を保存
    setDragOffset({
      x: point.x - item.x,
      y: point.y - item.y
    });

    // 選択したアイテム以外を残す
    const otherItems = items.filter((otherItem) => {
      return otherItem.id !== item.id;
    });

    // 選択したアイテムを配列の最後に移動して最前面にする
    setHistory((prev) => ({
      ...prev,
      present: [...otherItems, item]
    }));
  }

  // アイテムをドラッグ・リサイズ中に更新する
  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    // ドラッグ・リサイズ中でなければ何もしない
    if (action.type === 'none') return;

    // パン操作中の場合
    if (action.type === "pan") {
      // マウスの移動量を取得（画面上のピクセル単位）
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;

      // SVGの画面上の大きさを取得
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();

      // 画面上の移動量をSVG座標の移動量に変換
      const moveX = dx * (viewBox.width / rect.width);
      const moveY = dy * (viewBox.height / rect.height);

      // 表示範囲を移動する
      setViewBox((prev) => ({
        ...prev,
        x: prev.x - moveX,
        y: prev.y - moveY
      }));

      // 次の移動量を計算するため、現在位置を保存
      panStart.current = {
        x: e.clientX,
        y: e.clientY
      };

      return;
    }

    // ブラウザ上のマウス位置をSVG座標に変換
    const point = getSvgPoint(e);

    // SVG座標を取得できなかった場合は終了
    if (!point) return;

    // アイテムの配列を更新
    const newItems = items.map((item) => {
      // 操作対象ではないitemは変更しない
      if (item.id !== action.id) return item;

      // 現在の操作に応じて処理を切り替える
      switch (action.type) {
        case "drag":
          // ドラッグ中はitemの位置を更新
          return {
            ...item,
            // マウス位置から掴んだ位置の差分を引く
            x: point.x - dragOffset.x,
            y: point.y - dragOffset.y
          };

        case "resize":
          // リサイズ中はitemの幅と高さを更新
          return {
            ...item,
            // itemの左上からマウス位置までの距離を計算
            // 最小サイズは20に制限する
            width: Math.max(20, point.x - item.x),
            height: Math.max(20, point.y - item.y)
          };
      }
    });

    // ドラッグ・リサイズ中の図形データを更新する
    setHistory((prev) => ({
      ...prev,
      present: newItems
    }));
  }

  // ドラッグ・リサイズ終了
  function handleMouseUp() {
    // 操作前と現在の図形データが異なる場合だけ履歴に保存する
    if (actionStartItems.current !== null && JSON.stringify(actionStartItems.current) !== JSON.stringify(items)) {
      const startItems = actionStartItems.current;

      setHistory((prev) => ({
        past: [...prev.past, startItems], // 操作開始前の状態を履歴に保存
        present: prev.present, // 操作終了時の図形データはそのまま
        future: [] // 新しい操作なのでredo履歴を消去
      }));
    }
    // 一時保存した図形データをクリアする
    actionStartItems.current = null;

    // 操作状態を解除する
    setAction({ type: 'none' });
  }

  // 描画エリアをマウスダウンした時の処理
  function handleEditorMouseDown(e: MouseEvent<SVGSVGElement>) {

    // Spaceキーが押されていたらパン操作を開始する
    if (spacePressed.current) {

      // ドラッグ開始時のマウス位置を保存
      panStart.current = {
        x: e.clientX,
        y: e.clientY
      };

      // 現在の操作をパンに切り替える
      setAction({ type: "pan" });

      return;
    }

    // 空白部分をクリックした場合は選択解除
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  }

  // 選択したアイテムの削除
  function deleteSelectedItem() {
    // 図形が選択されていなければ削除しない
    if (selectedId === null) return;

    // 選択中のIDと一致しないアイテムだけを残す
    const newItems = items.filter((item) => {
      return item.id !== selectedId;
    });

    // 削除前の状態を履歴に保存して、図形を削除する
    setHistory((prev) => ({
      past: [...prev.past, prev.present], // 削除前の状態を保存
      present: newItems, // 削除後の図形データ
      future: [] // 新しい操作なのでRedoの履歴を消去
    }));

    // 削除後は選択状態を解除
    setSelectedId(null);
  }

  // キーボード操作を監視
  useEffect(() => {
    // キーが押された時の処理
    function handleKeyDown(e: KeyboardEvent) {
      // Deleteキーが押されたら選択中のアイテムを削除
      if (e.key === 'Delete') deleteSelectedItem();

      // Spaceキーが押されたら記録する
      if (e.code === "Space") {
        spacePressed.current = true;
        e.preventDefault();
      }

      // Commandキー（Mac）またはCtrlキーを押しながらZでUndo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault(); // ブラウザ標準のUndoを防ぐ
        undo();
        return;
      }

      // MacはCommand + Shift + Z、WindowsはCtrl + YでRedo
      if (
        (e.metaKey && e.shiftKey && e.key.toLowerCase() === "z") ||
        (e.ctrlKey && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault(); // ブラウザ標準の動作を防ぐ
        redo();
        return;
      }
    }

    // キーが離された時の処理
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        spacePressed.current = false;
      }
    }

    // windowにキーボードイベントを登録
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Effectが再実行・破棄される前にイベントを解除
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };

    // 最新のitemsとselectedIdを使用するため
    // どちらかが変わったらEffectを再実行
  }, [items, selectedId]);

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

  // SVGのサイズが変わったらviewBoxの横幅を調整する
  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) return;

    const observer = new ResizeObserver(() => {
      // SVGの実際の表示サイズを取得
      const { width, height } = svg.getBoundingClientRect();

      if (width === 0 || height === 0) return;

      // 縦横比を維持しながら表示範囲を調整
      setViewBox((prev) => {
        const newWidth = prev.height * (width / height);

        return {
          ...prev,
          x: prev.x + (prev.width - newWidth) / 2,
          width: newWidth
        };
      });
    });

    observer.observe(svg);

    // コンポーネントが破棄されたら監視を終了
    return () => {
      observer.disconnect();
    };
  }, []);

  // リサイズ開始
  function handleResizeMouseDown(e: MouseEvent<SVGRectElement>, item: Rectangle) {
    // Spaceキーが押されている場合は親SVGに処理を任せる
    if (spacePressed.current) return;

    // 親要素にマウスイベントを伝えない
    e.stopPropagation();

    // リサイズ開始前の図形データを一時保存する
    actionStartItems.current = items;

    // リサイズするアイテムのIDを保存
    setAction({ type: 'resize', id: item.id });
  }

  // マウスの位置をSVG上の座標に変換する
  function getSvgPoint(e: MouseEvent<SVGElement> | WheelEvent<SVGSVGElement>) {
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

  // 描画エリアの拡大縮小
  function handleWheel(e: WheelEvent<SVGSVGElement>) {
    // マウスの位置をSVG座標に変換する
    const point = getSvgPoint(e);

    // 座標を取得できなかった場合は処理を終了する
    if (!point) return;

    // ホイールを上に回したら0.9倍、下に回したら1.1倍
    // SVGは表示範囲を小さくすると図形が大きく表示される
    const scale = e.deltaY < 0 ? 0.9 : 1.1;

    // SVGの表示範囲（viewBox）を更新する
    setViewBox((prev) => {
      // 新しい表示範囲を返してstateを更新する
      return {
        // 現在のviewBoxの値をコピー
        ...prev,

        // 表示範囲の幅と高さに倍率を掛ける
        // 例：800 × 0.9 = 720（拡大）
        width: prev.width * scale,
        height: prev.height * scale,

        // マウスが指しているSVG座標を画面上の同じ位置に保つ
        // そのために、表示範囲の左上座標を調整する
        // 例：point.x = 200、prev.x = 0、scale = 0.9
        //     200 - (200 - 0) × 0.9 = 20
        //     表示範囲の左端が0から20に移動する
        x: point.x - (point.x - prev.x) * scale,
        y: point.y - (point.y - prev.y) * scale,
      };
    });
  }

  return (
    <>
      <h2>Simple 2D Editor</h2>
      <button
        onClick = {addRectangle}
      >
        Add Rectangle
      </button>

      {/* undoボタン */}
      <button
        onClick = {undo}
        disabled = {history.past.length === 0}
      >
        ←
      </button>

      {/* redoボタン */}
      <button
        onClick = {redo}
        disabled = {history.future.length === 0}
      >
        →
      </button>

      {/* 描画エリア */}
      <svg
        ref = {svgRef}
        className = "editor-area"
        viewBox = {`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio = "xMidYMid meet"
        onMouseDown = {handleEditorMouseDown}
        onMouseMove = {handleMouseMove}
        onMouseUp = {handleMouseUp}
        onMouseLeave = {handleMouseUp}
        onWheel = {handleWheel}
      >
        {/* 50単位ごとに薄いグレーの格子線を定義する */}
        <defs>
          <pattern
            id = "editor-grid"
            width = "50"
            height = "50"
            patternUnits = "userSpaceOnUse"
          >
            <path
              d = "M 50 0 L 0 0 0 50"
              fill = "none"
              stroke = "#dddddd"
              strokeWidth = "1"
            />
          </pattern>
        </defs>

        {/* 定義した格子線を描画エリア全体に表示する */}
        <rect
          x = {viewBox.x}
          y = {viewBox.y}
          width = {viewBox.width}
          height = {viewBox.height}
          fill = "url(#editor-grid)"
          pointerEvents = "none"
        />

        {/* 原点(0, 0)を通るX軸 */}
        <line
          x1 = {viewBox.x}
          y1 = {0}
          x2 = {viewBox.x + viewBox.width}
          y2 = {0}
          stroke = "#888888"
          strokeWidth = "1"
        />

        {/* 原点(0, 0)を通るY軸 */}
        <line
          x1 = {0}
          y1 = {viewBox.y}
          x2 = {0}
          y2 = {viewBox.y + viewBox.height}
          stroke = "#888888"
          strokeWidth = "1"
        />

        {items.map((item) => (
          <g key = {item.id}>
            {/* item本体 */}
            <rect
              x = {item.x}
              y = {item.y}
              width = {item.width}
              height = {item.height}
              fill = 'white'
              stroke = {selectedId === item.id ? "blue" : "#222"}
              strokeWidth = {selectedId === item.id ? 2 : 1}
              onMouseDown = {(e) => handleMouseDown(e, item)}
            />
            {/* 選択中のitemにリサイズハンドルを表示 */}
            {selectedId === item.id && (
              <rect
                x = {item.x + item.width - 5}
                y = {item.y + item.height - 5}
                width = {10}
                height = {10}
                fill = "blue"
                style = {{ cursor: "nwse-resize" }}
                onMouseDown = {(e) => handleResizeMouseDown(e, item)}
              />
            )}
          </g>
        ))}
      </svg>
    </>
  );
}
export default Simple2DEditor;
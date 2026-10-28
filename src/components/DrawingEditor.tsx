import { useEffect, useRef, useState } from "react";
import type { MouseEvent, WheelEvent } from "react";
import type { Rectangle, Line, EditorItem, DragOffset, EditorAction, ViewBox, EditorHistory } from "./types";
import RectangleItem from "./RectangleItem";
import LineItem from "./LineItem";
import { openPrintDialog } from "./utils/print";
import { offsetDuplicateItem } from "./utils/offset";
import { exportJson } from "./utils/export";
import { importJson } from "./utils/import";

function DrawingEditor() {
  // 図形の操作履歴を管理する
  const [history, setHistory] = useState<EditorHistory>({
    past: [],
    present: [],
    future: []
  });

  // 現在の図形データを履歴から取得する
  const items = history.present;

  // ドラッグ開始時のマウス位置を保存する
  const dragStartPoint = useRef<DragOffset>({ x: 0, y: 0 });

  // 選択中の図形のUUIDを配列で管理する（複数選択に対応）
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 範囲選択の開始位置と現在位置を管理する
  const [selectionBox, setSelectionBox] = useState<{
    start: DragOffset;
    end: DragOffset;
  } | null>(null);

  // 操作しているアイテムID
  const [action, setAction] = useState<EditorAction>({type: "none"});

  // ドラッグ・リサイズ開始前の図形データを一時保存する
  const actionStartItems = useRef<EditorItem[] | null>(null);

  // コピーした図形を一時保存する
  const copiedItems = useRef<EditorItem[]>([]);

  // Spaceキーが押されているかを管理する
  const spacePressed = useRef<boolean>(false);

  // パン操作を開始したときのマウス位置
  const panStart = useRef<DragOffset>({ x: 0, y: 0 });

  // SVG要素を参照する
  const svgRef = useRef<SVGSVGElement>(null);

  // JSONファイルを選択するinput要素を参照する
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SVGの表示範囲を管理する（原点を画面中央にする）
  const [viewBox, setViewBox] = useState<ViewBox>({x: -430, y: -250, width: 860, height: 500});

  // 選択したJSONファイルを読み込む
  async function handleImportJson(file: File) {
    try {
      // JSONファイルを読み込み、図形データを取得する
      const importedItems = await importJson(file);

      // 読み込んだ図形データをエディターに反映する
      setHistory((prev) => ({
        past: [...prev.past, prev.present],
        present: importedItems,
        future: []
      }));

      // 図形の選択状態を解除する
      setSelectedIds([]);

    } catch (error) {
      // 読み込みに失敗した場合はエラーを表示する
      console.error(error);
      alert("JSONファイルの読み込みに失敗しました。");
    }
  }

  // 新しいRectangleを作る
  function addRectangle() {
    const newRectangle: Rectangle = {
      uuid: crypto.randomUUID(),
      type: "rectangle", // 図形の種類
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };

    setHistory((prev) => {
      // 同じ四角形が存在する場合は座標をずらす
      const adjustedRectangle = offsetDuplicateItem(newRectangle, prev.present);

      return {
        past: [...prev.past, prev.present], // 変更前の図形データを履歴に保存
        present: [...prev.present, adjustedRectangle], // 座標を調整した四角形を追加
        future: [] // 新しい操作をしたのでRedoの履歴を消去
      };
    });
  }

  // 新しいLineを作る
  function addLine() {
    const newLine: Line = {
      uuid: crypto.randomUUID(),
      type: "line",
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 100
    };

    setHistory((prev) => {
      // 同じ直線が存在する場合は座標をずらす
      const adjustedLine = offsetDuplicateItem(newLine, prev.present);

      return {
        past: [...prev.past, prev.present],
        present: [...prev.present, adjustedLine],
        future: []
      }

    });
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
  function handleMouseDown(e: MouseEvent<SVGElement>, item: EditorItem) {
    // Spaceキーが押されている場合は親SVGに処理を任せる
    if (spacePressed.current) return;

    // 描画エリアへのマウスイベント伝播を防ぐ
    e.stopPropagation();

    // 選択状態を更新する
    selectItem(item.uuid, e.shiftKey);

    // マウスのSVG座標を取得
    const point = getSvgPoint(e);

    if (!point) return;

    // ドラッグ開始時のマウス位置を保存する
    dragStartPoint.current = {
      x: point.x,
      y: point.y
    };

    // ドラッグ開始前の図形データを一時保存する
    actionStartItems.current = items;

    // ドラッグ開始
    setAction({ type: "drag", uuid: item.uuid });

    // 選択したアイテム以外を残す
    const otherItems = items.filter((otherItem) => {
      return otherItem.uuid !== item.uuid;
    });

    // 選択したアイテムを配列の最後に移動して最前面にする
    setHistory((prev) => ({
      ...prev,
      present: [...otherItems, item]
    }));
  }


  // 図形の選択状態を更新する（四角形・直線共通）
  function selectItem(uuid: string, shiftKey: boolean) {
    if (shiftKey) {
      // Shiftキーが押されている場合は選択を追加・解除する
      setSelectedIds((prev) => {
        // 選択済みなら解除する
        if (prev.includes(uuid)) {
          return prev.filter((id) => id !== uuid);
        }

        // 未選択なら追加する
        return [...prev, uuid];
      });
    } else {
      // 選択済みの図形をクリックした場合は複数選択を維持する
      if (selectedIds.includes(uuid)) return;

      // 未選択の図形をクリックした場合は1つだけ選択する
      setSelectedIds([uuid]);
    }
  }

  // マウス移動時の操作を振り分ける
  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    // 範囲選択中は選択枠の終点を更新する
    if (selectionBox) {
      const point = getSvgPoint(e);
      if (!point) return;

      setSelectionBox((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          end: { x: point.x, y: point.y }
        };
      });
      return;
    }

    // 操作していない場合は何もしない
    if (action.type === "none") return;

    // パン操作中は画面を移動する
    if (action.type === "pan") {
      handlePan(e);
      return;
    }

    // ドラッグ・リサイズ中は図形を更新する
    handleItemMove(e);
  }

  // Spaceキーを押しながらマウスを動かしたときの画面移動
  function handlePan(e: MouseEvent<SVGSVGElement>) {
    // マウスの移動量を取得する
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;

    // マウスの移動量をSVG座標に変換する
    const rect = e.currentTarget.getBoundingClientRect();
    const moveX = dx * (viewBox.width / rect.width);
    const moveY = dy * (viewBox.height / rect.height);

    // SVGの表示範囲を移動する
    setViewBox((prev) => ({
      ...prev,
      x: prev.x - moveX,
      y: prev.y - moveY
    }));

    // 次回の移動量を計算するために現在位置を保存する
    panStart.current = {
      x: e.clientX,
      y: e.clientY
    };
  }

  // 操作対象の図形を判定し、種類に応じた更新処理を呼び出す
  function updateItem(item: EditorItem, point: DragOffset, dx: number, dy: number): EditorItem {
    // ドラッグ中は選択中の図形だけを操作する
    if (action.type === "drag") {
      if (!selectedIds.includes(item.uuid)) return item;
    }

    // リサイズ中は操作対象の図形だけを操作する
    if (action.type === "resize" || action.type === "resize-line") {
      if (item.uuid !== action.uuid) return item;
    }

    // 直線の更新処理
    if (item.type === "line") {
      return updateLine(item, point, dx, dy);
    }

    // 四角形の更新処理
    return updateRectangle(item, point, dx, dy);
  }

  // 図形のドラッグ・リサイズ中に座標を更新する
  function handleItemMove(e: MouseEvent<SVGSVGElement>) {
    // マウスの位置をSVG座標に変換する
    const point = getSvgPoint(e);
    if (!point) return;

    // ドラッグ開始位置からの移動量を計算する
    const dx = point.x - dragStartPoint.current.x;
    const dy = point.y - dragStartPoint.current.y;

    // 操作対象の図形を更新する
    const newItems = items.map((item) => {
      // 各図形の更新処理を呼び出す
      return updateItem(item, point, dx, dy);
    });

    // 更新した図形データを反映する
    setHistory((prev) => ({
      ...prev,
      present: newItems
    }));
  }

  // 直線のドラッグ・リサイズ処理
  function updateLine(item: Line, point: DragOffset, dx: number, dy: number): Line {
    // ドラッグ中は開始前の座標を基準に移動する
    if (action.type === "drag") {
      const startItem = actionStartItems.current?.find((startItem) => {
        return startItem.uuid === item.uuid;
      });

      if (!startItem || startItem.type !== "line") return item;

      return {
        ...item,
        x1: startItem.x1 + dx,
        y1: startItem.y1 + dy,
        x2: startItem.x2 + dx,
        y2: startItem.y2 + dy
      };
    }

    // 直線の始点または終点をリサイズする
    if (action.type === "resize-line") {
      return resizeLine(item, point, action.endpoint);
    }

    return item;
  }

  // 四角形のドラッグ・リサイズ処理
  function updateRectangle(item: Rectangle, point: DragOffset, dx: number, dy: number): Rectangle {
    // ドラッグ中は開始前の座標を基準に移動する
    if (action.type === "drag") {
      const startItem = actionStartItems.current?.find((startItem) => {
        return startItem.uuid === item.uuid;
      });

      if (!startItem || startItem.type !== "rectangle") return item;

      return {
        ...item,
        x: startItem.x + dx,
        y: startItem.y + dy
      };
    }

    // 四角形の幅と高さを変更する
    if (action.type === "resize") {
      return resizeRectangle(item, point);
    }

    return item;
  }

  // 四角形をリサイズしたときの幅と高さを計算する
  function resizeRectangle(item: Rectangle, point: DragOffset): Rectangle {
    return {
      ...item,
      // 四角形の左上からマウス位置までの距離を計算する
      // 最小サイズは1に制限する
      width: Math.max(1, point.x - item.x),
      height: Math.max(1, point.y - item.y)
    };
  }

  // 直線の終点を移動して長さと角度を変更する
  function resizeLine(item: Line, point: DragOffset, endpoint: "start" | "end"): Line {
    // 始点を操作している場合
    if (endpoint === 'start') {
      return {
        ...item,
        // 終点は固定し、始点だけをマウス位置に変更する
        x1: point.x,
        y1: point.y,
      };
    } else {
      return {
        ...item,
        // 始点は固定し、終点だけをマウス位置に変更する
        x2: point.x,
        y2: point.y,
      };
    }
  }

  // ドラッグ・リサイズ終了
  function handleMouseUp() {
    // 範囲選択中なら選択を確定して終了する
    if (selectionBox) {
      finishAreaSelection();
      return;
    }

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

  // 範囲選択を確定して終了する
  function finishAreaSelection() {
    // 範囲選択中でなければ何もしない
    if (!selectionBox) return;

    // 選択範囲の上下左右を取得する
    const left = Math.min(selectionBox.start.x, selectionBox.end.x);
    const right = Math.max(selectionBox.start.x, selectionBox.end.x);
    const top = Math.min(selectionBox.start.y, selectionBox.end.y);
    const bottom = Math.max(selectionBox.start.y, selectionBox.end.y);

    // 選択範囲に完全に入っている図形を取得する
    const selectedItems = items.filter((item) => {
      if (item.type === "rectangle") {
        return (
          item.x >= left &&
          item.y >= top &&
          item.x + item.width <= right &&
          item.y + item.height <= bottom
        );
      }

      return (
        item.x1 >= left &&
        item.x1 <= right &&
        item.y1 >= top &&
        item.y1 <= bottom &&
        item.x2 >= left &&
        item.x2 <= right &&
        item.y2 >= top &&
        item.y2 <= bottom
      );
    });

    // 選択範囲内の図形を選択状態にする
    setSelectedIds(selectedItems.map((item) => item.uuid));

    // 選択枠を消す
    setSelectionBox(null);
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

    // 空白部分をクリックした場合は範囲選択を開始する
    if (e.target === e.currentTarget) {
      // 既存の選択状態を解除する
      setSelectedIds([]);

      // マウスのSVG座標を取得する
      const point = getSvgPoint(e);
      if (!point) return;

      // 範囲選択の開始位置を保存する
      setSelectionBox({
        start: { x: point.x, y: point.y },
        end: { x: point.x, y: point.y }
      });
    }
  }

  // 選択したアイテムの削除
  function deleteSelectedItem() {
    // 図形が選択されていなければ削除しない
    if (selectedIds.length === 0) return;

    // 選択中のIDと一致しないアイテムだけを残す
    const newItems = items.filter((item) => {
      return !selectedIds.includes(item.uuid);
    });

    // 削除前の状態を履歴に保存して、図形を削除する
    setHistory((prev) => ({
      past: [...prev.past, prev.present], // 削除前の状態を保存
      present: newItems, // 削除後の図形データ
      future: [] // 新しい操作なのでRedoの履歴を消去
    }));

    // 削除後は選択状態を解除
    setSelectedIds([]);
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

      // Command + C（Mac）またはCtrl + Cで選択中の図形をコピーする
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c" && selectedIds.length > 0) {
        e.preventDefault();

        // 選択中の図形をコピーする
        copiedItems.current = items.filter((item) => selectedIds.includes(item.uuid));

        return;
      }

      // Command + V（Mac）またはCtrl + Vで図形を貼り付ける
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v" && copiedItems.current.length > 0) {
        e.preventDefault();

        // コピーした図形を少しずらし、新しいUUIDを設定する
        const pastedItems = copiedItems.current.map((item) => {
          if (item.type === "rectangle") {
            return {
              ...item,
              uuid: crypto.randomUUID(),
              x: item.x + 20,
              y: item.y + 20
            };
          }

          return {
            ...item,
            uuid: crypto.randomUUID(),
            x1: item.x1 + 20,
            y1: item.y1 + 20,
            x2: item.x2 + 20,
            y2: item.y2 + 20
          };
        });

        // 貼り付けた図形を履歴に保存する
        setHistory((prev) => ({
          past: [...prev.past, prev.present],
          present: [...prev.present, ...pastedItems],
          future: []
        }));

        // 貼り付けた図形を選択状態にする
        setSelectedIds(pastedItems.map((item) => item.uuid));

        // 次回の貼り付けではさらに20ずらす
        copiedItems.current = pastedItems;

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
  }, [items, selectedIds]);

  // 描画エリア外をクリックした場合に選択解除する
  useEffect(() => {
    function handleWindowMouseDown(e: globalThis.MouseEvent) {
      // 描画エリアを取得
      const editor = document.querySelector(".editor-area");

      // 描画エリア外をクリックした場合
      if (editor && !editor.contains(e.target as Node)) {
        setSelectedIds([]);
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
    setAction({ type: 'resize', uuid: item.uuid });
  }

  // 直線の端点をドラッグして位置変更を開始する
  function handleLineResizeMouseDown(e: MouseEvent<SVGCircleElement>, item: Line, endpoint: 'start' | 'end') {
    // Spaceキーが押されている場合は親SVGに処理を任せる
    if (spacePressed.current) return;

    // 親SVGへのマウスイベント伝播を防ぐ
    e.stopPropagation();

    // リサイズ開始前の図形データを保存する
    actionStartItems.current = items;

    // 操作する端点を指定してリサイズを開始する
    setAction({ type: "resize-line", uuid: item.uuid, endpoint: endpoint });
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
      <h2>Drawing Editor</h2>
      <button
        onClick = {addRectangle}
      >
        {/* Add Rectangle */}
        □
      </button>

      {/* 直線を追加するボタン */}
      <button
        onClick = {addLine}
      >
        {/* Add Line */}
        /
      </button>

      {/* 印刷ダイアログを開くボタン */}
      <button
        onClick = {() => openPrintDialog(items)}
        disabled = {items.length === 0}
      >
        {/* Print */}
        印刷
      </button>

      {/* JSONファイルを保存するボタン */}
      <button
        onClick = {() => exportJson(items)}
        disabled = {items.length === 0}
      >
        {/* Export */}
        保存
      </button>

      {/* JSONファイルをインポートするボタン */}
      <button
        onClick = {() => fileInputRef.current?.click()}
      >
        {/* Import */}
        開く
      </button>

      {/* JSONファイルを選択するための非表示input */}
      <input
        type = "file"
        accept = ".json,application/json"
        ref = {fileInputRef}
        style = {{ display: "none" }}
        onChange = {(e) => {
          // 選択されたファイルを取得する
          const file = e.target.files?.[0];

          // ファイルが選択されなかった場合は何もしない
          if (!file) return;

          // JSONファイルを読み込む
          void handleImportJson(file);

          // 同じファイルを再度選択できるようにする
          e.target.value = "";
        }}
/>
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

        {/* ドラッグ中の範囲選択枠 */}
        {selectionBox && (
          <rect
            x = {Math.min(selectionBox.start.x, selectionBox.end.x)}
            y = {Math.min(selectionBox.start.y, selectionBox.end.y)}
            width = {Math.abs(selectionBox.end.x - selectionBox.start.x)}
            height = {Math.abs(selectionBox.end.y - selectionBox.start.y)}
            fill = "#3b82f6"
            fillOpacity = {0.1}
            stroke = "#3b82f6"
            strokeWidth = {1}
            strokeDasharray = "5 5"
            pointerEvents = "none"
          />
        )}

        {items.map((item) => (
          item.type === "rectangle" ? (
            <RectangleItem
              key = {item.uuid}
              item = {item}
              selectedId = {selectedIds.includes(item.uuid) ? item.uuid : null}
              onMouseDown = {handleMouseDown}
              onResizeMouseDown = {handleResizeMouseDown}
            />
          ) : (
            <LineItem
              key = {item.uuid}
              item = {item}
              selectedId = {selectedIds.includes(item.uuid) ? item.uuid : null}
              onMouseDown = {handleMouseDown}
              onResizeMouseDown = {handleLineResizeMouseDown}
            />
          )
        ))}
      </svg>
    </>
  );
}
export default DrawingEditor;
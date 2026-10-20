// 四角形の定義
export type Rectangle = {
  id: number;
  type: "rectangle"; // 図形の種類
  x:  number;
  y:  number;
  width: number;
  height: number;
};

// エディタで扱うすべての図形の型
export type EditorItem = Rectangle;

// マウス操作時の位置や移動量を表す型
export type DragOffset = {
  x: number;
  y: number;
};

// 現在の操作状態
export type EditorAction =
  | { type: "none" }
  | { type: "drag"; id: number }
  | { type: "resize"; id: number }
  | { type: "pan" };

// SVGの表示範囲
export type ViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EditorHistory = {
  past: EditorItem[][];    // 過去の図形データ
  present: EditorItem[];   // 現在の図形データ
  future: EditorItem[][];  // やり直し用の図形データ
};